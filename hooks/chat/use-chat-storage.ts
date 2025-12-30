import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	clearChatHistory as clearChatHistoryService,
	getChatMessages,
	hasChatStarted,
	markChatStarted,
	saveChatMessages,
} from "@/lib/services/chat-history-service";
import type { Message } from "@/lib/types";

/**
 * Hook for managing chat persistence to localStorage
 */
export function useChatStorage(chatType: string) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [hasStartedChat, setHasStartedChat] = useState(false);

	// Load initial state from storage
	useEffect(() => {
		const savedMessages = getChatMessages(chatType);
		const savedChatState = hasChatStarted(chatType);
		setMessages(savedMessages);
		setHasStartedChat(savedChatState);
	}, [chatType]);

	// Save messages to storage whenever they change
	useEffect(() => {
		try {
			saveChatMessages(chatType, messages);
		} catch (error) {
			console.error("Failed to save chat messages:", error);
			const isQuotaError =
				error instanceof Error && error.message.toLowerCase().includes("quota");
			if (isQuotaError) {
				toast.error("Storage full", {
					description: "Please clear old data from settings.",
				});
			}
		}
	}, [messages, chatType]);

	// Save chat started flag whenever it changes
	useEffect(() => {
		try {
			markChatStarted(chatType, hasStartedChat);
		} catch (error) {
			console.error("Failed to mark chat started:", error);
			const isQuotaError =
				error instanceof Error && error.message.toLowerCase().includes("quota");
			if (isQuotaError) {
				toast.error("Storage full", {
					description: "Please clear old data from settings.",
				});
			}
		}
	}, [hasStartedChat, chatType]);

	const clearHistory = () => {
		setMessages([]);
		setHasStartedChat(false);
		clearChatHistoryService(chatType);
	};

	return {
		messages,
		setMessages,
		hasStartedChat,
		setHasStartedChat,
		clearHistory,
	};
}
