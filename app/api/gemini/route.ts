import { type NextRequest, NextResponse } from "next/server";

// In-memory store for rate limiting. Resets on cold starts.
const rateLimitStore = new Map<
	string,
	{ count: number; lastRequest: number }
>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 15;

// NOTE: Rate limiting is per-instance and doesn't persist across serverless instances.
// For production deployments with multiple serverless instances, use Redis or Vercel KV
// for distributed rate limiting to ensure consistent limits across all instances.
// Lazy cleanup (below) prevents unbounded memory growth in single-instance scenarios.

const API_KEY = process.env.GEMINI_API_KEY || "";
const DEFAULT_MODEL_NAME = "gemini-3-flash-preview";

interface GeminiRequestBody {
	systemPrompt: string;
	userPrompt: string;
	modelName?: string;
}

interface GeminiApiResponse {
	candidates?: Array<{
		content: {
			parts: Array<{
				text: string;
			}>;
		};
	}>;
	promptFeedback?: {
		blockReason: string;
	};
}

export async function POST(request: NextRequest) {
	const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
	const now = Date.now();

	const record = rateLimitStore.get(ip);

	if (record && now - record.lastRequest < RATE_LIMIT_WINDOW_MS) {
		if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
			console.warn(
				`RATE_LIMIT: IP ${ip} blocked for exceeding ${RATE_LIMIT_MAX_REQUESTS} requests/min.`,
			);
			return NextResponse.json(
				{ error: "Too many requests. Please try again later." },
				{ status: 429 },
			);
		}
		rateLimitStore.set(ip, { count: record.count + 1, lastRequest: now });
	} else {
		// Lazy cleanup: remove stale entries when checking rate limit
		const oneMinuteAgo = now - RATE_LIMIT_WINDOW_MS;
		for (const [key, record] of rateLimitStore.entries()) {
			if (record.lastRequest < oneMinuteAgo) {
				rateLimitStore.delete(key);
			}
		}

		// Start a new record for the IP or reset the window
		rateLimitStore.set(ip, { count: 1, lastRequest: now });
	}

	if (!API_KEY) {
		console.error("CRITICAL: GEMINI_API_KEY environment variable is not set.");
		return NextResponse.json(
			{ error: "Server configuration error." },
			{ status: 500 },
		);
	}

	try {
		const { systemPrompt, userPrompt, modelName }: GeminiRequestBody =
			await request.json();

		// Validate required fields
		if (!systemPrompt || typeof systemPrompt !== "string") {
			return NextResponse.json(
				{ error: "systemPrompt is required and must be a string" },
				{ status: 400 },
			);
		}

		if (!userPrompt || typeof userPrompt !== "string") {
			return NextResponse.json(
				{ error: "userPrompt is required and must be a string" },
				{ status: 400 },
			);
		}

		if (userPrompt.trim().length === 0) {
			return NextResponse.json(
				{ error: "userPrompt cannot be empty" },
				{ status: 400 },
			);
		}

		const effectiveModelName = modelName || DEFAULT_MODEL_NAME;
		const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModelName}:generateContent?key=${API_KEY}`;

		const requestBody = {
			contents: [
				{
					role: "user",
					parts: [{ text: userPrompt }],
				},
			],
			system_instruction: {
				parts: [{ text: systemPrompt }],
			},
			generationConfig: {
				temperature: 1.0,
				topK: 40,
				topP: 0.95,
				maxOutputTokens: 65536,
			},
			safetySettings: [
				{ category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
				{ category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
				{
					category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
					threshold: "BLOCK_NONE",
				},
				{
					category: "HARM_CATEGORY_DANGEROUS_CONTENT",
					threshold: "BLOCK_NONE",
				},
				{ category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_NONE" },
			],
		};

		const timeoutMs = 60000; // 60 seconds
		const timeoutController = new AbortController();
		const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

		let response: Response;
		try {
			response = await fetch(API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
				signal: timeoutController.signal,
			});
		} catch (error) {
			clearTimeout(timeoutId);
			throw error;
		}
		clearTimeout(timeoutId);

		if (!response.ok) {
			const errorBody = await response
				.json()
				.catch(() => ({ error: "Unknown API error" }));
			console.error("Gemini API Error:", {
				status: response.status,
				body: errorBody,
			});
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data: GeminiApiResponse = await response.json();

		const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

		if (responseText) {
			return NextResponse.json({ text: responseText });
		} else {
			// Handle cases where the API might block the request for safety reasons
			console.warn("API_RESPONSE_BLOCKED:", data);
			const blockReason = data.promptFeedback?.blockReason || "safety settings";
			return NextResponse.json({
				text: `My apologies, but the response was blocked due to ${blockReason}. Please try rephrasing your message.`,
			});
		}
	} catch (error) {
		console.error("HANDLER_ERROR: Error in POST /api/gemini:", error);
		return NextResponse.json(
			{ error: "Failed to generate content" },
			{ status: 500 },
		);
	}
}
