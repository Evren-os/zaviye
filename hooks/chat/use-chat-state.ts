import { toast } from "sonner";
import { usePersonas } from "@/hooks/use-personas";
import type { ChatType } from "@/lib/types";
import { handleError } from "@/lib/utils/error-utils";
import {
	findLastUserMessage,
	isValidMessageContent,
	removeAssistantMessagesAfter,
	removeMessageById,
} from "./chat-operations";
import { createUserMessage } from "./message-factory";
import { useChatApi } from "./use-chat-api";
import { useChatStorage } from "./use-chat-storage";
import { useRateLimit } from "./use-rate-limit";

/**
 * Main hook for managing chat state and operations
 */
export function useChatState(chatType: ChatType) {
	const { getPersona, globalModel } = usePersonas();
	const {
		messages,
		setMessages,
		hasStartedChat,
		setHasStartedChat,
		clearHistory,
	} = useChatStorage(chatType);
	const { throttleSeconds, checkAndApplyThrottle } = useRateLimit();
	const { isLoading, fetchAssistantResponse, stopGeneration } = useChatApi();

	const sendMessage = async (content: string) => {
		// Validation
		if (!isValidMessageContent(content) || throttleSeconds > 0) return;

		const persona = getPersona(chatType);
		if (!persona) {
			toast.error(`Persona with ID "${chatType}" not found.`);
			return;
		}

		const effectiveModelId = persona.model || globalModel;
		if (checkAndApplyThrottle(effectiveModelId)) return;

		if (!hasStartedChat) setHasStartedChat(true);

		// Create and add user message
		const userMessage = createUserMessage(content);
		setMessages((prev) => [...prev, userMessage]);

		// Fetch assistant response
		try {
			const assistantMessage = await fetchAssistantResponse(
				content,
				effectiveModelId,
				persona,
			);
			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			handleError(error, "sendMessage", toast);
			// Remove the user message if request failed
			setMessages((prev) => removeMessageById(prev, userMessage.id));
		}
	};

	const regenerateLastResponse = async () => {
		if (throttleSeconds > 0) return;

		const lastUserMessage = findLastUserMessage(messages);
		if (!lastUserMessage) {
			toast.error("Could not find a message to regenerate.");
			return;
		}

		const persona = getPersona(chatType);
		if (!persona) {
			toast.error(`Persona with ID "${chatType}" not found.`);
			return;
		}

		const effectiveModelId = persona.model || globalModel;
		if (checkAndApplyThrottle(effectiveModelId)) return;

		// Remove assistant messages after the last user message
		setMessages((prev) =>
			removeAssistantMessagesAfter(prev, lastUserMessage.timestamp),
		);

		// Fetch new response
		try {
			const assistantMessage = await fetchAssistantResponse(
				lastUserMessage.content,
				effectiveModelId,
				persona,
			);
			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			handleError(error, "regenerateLastResponse", toast);
		}
	};

	return {
		messages,
		isLoading,
		sendMessage,
		regenerateLastResponse,
		hasStartedChat,
		clearChatHistory: clearHistory,
		stopGeneration,
		throttleSeconds,
	};
}
