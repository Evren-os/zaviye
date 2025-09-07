import { NextRequest, NextResponse } from "next/server";

// In-memory store for rate limiting. Resets on cold starts.
const rateLimitStore = new Map<string, { count: number; lastRequest: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 15;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Periodically clean up old entries from the rate limit store
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now - record.lastRequest > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(ip);
    }
  }
}, CLEANUP_INTERVAL_MS);

const API_KEY = process.env.GEMINI_API_KEY || "";
const DEFAULT_MODEL_NAME = "gemini-2.5-flash";

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
    // Start a new record for the IP or reset the window
    rateLimitStore.set(ip, { count: 1, lastRequest: now });
  }

  if (!API_KEY) {
    console.error("CRITICAL: GEMINI_API_KEY environment variable is not set.");
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  try {
    const { systemPrompt, userPrompt, modelName }: GeminiRequestBody = await request.json();

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
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_NONE" },
      ],
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: "Unknown API error" }));
      console.error("Gemini API Error:", { status: response.status, body: errorBody });
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
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
