import { useEffect, useState } from "react";
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
		saveChatMessages(chatType, messages);
	}, [messages, chatType]);

	// Save chat started flag whenever it changes
	useEffect(() => {
		markChatStarted(chatType, hasStartedChat);
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
