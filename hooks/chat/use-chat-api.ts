import { useCallback, useRef, useState } from "react";
import { generateContent } from "@/lib/gemini";
import type { Message, ModelId, Persona } from "@/lib/types";
import { createAssistantMessage } from "./message-factory";

/**
 * Hook for managing API calls to generate chat responses
 */
export function useChatApi() {
	const [isLoading, setIsLoading] = useState(false);
	const abortControllerRef = useRef<AbortController | null>(null);

	const stopGeneration = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
	}, []);

	const fetchAssistantResponse = useCallback(
		async (
			userPrompt: string,
			modelName: ModelId,
			persona: Persona,
		): Promise<Message> => {
			if (abortControllerRef.current) stopGeneration();
			setIsLoading(true);
			abortControllerRef.current = new AbortController();

			try {
				const systemPrompt = persona.prompt;

				const response = await generateContent({
					systemPrompt,
					userPrompt,
					modelName,
					signal: abortControllerRef.current.signal,
				});

				return createAssistantMessage(response);
			} finally {
				setIsLoading(false);
				abortControllerRef.current = null;
			}
		},
		[stopGeneration],
	);

	return {
		isLoading,
		fetchAssistantResponse,
		stopGeneration,
	};
}
