import type { ModelId } from "./types";

export interface GenerateContentParams {
  systemPrompt: string;
  userPrompt: string;
  modelName: ModelId;
  signal?: AbortSignal;
}

export async function generateContent({
  systemPrompt,
  userPrompt,
  modelName,
  signal,
}: GenerateContentParams): Promise<string> {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ systemPrompt, userPrompt, modelName }),
      signal, // Pass the signal to the fetch request
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `API Error: Status ${response.status}`;

      if (response.status === 429) {
        throw new Error("API rate limit hit. Try a different model or wait a moment.");
      }
      if (response.status >= 500) {
        throw new Error("A server error occurred. Please try again later.");
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.text) {
      throw new Error("No text content received from API");
    }

    return data.text;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Fetch aborted by user.");
      // Re-throw the abort error so it can be caught and handled upstream
      throw error;
    }
    console.error("Error in generateContent:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred.");
  }
}
