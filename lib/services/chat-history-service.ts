import {
	chatMessagesStorage,
	chatStartedStorage,
} from "@/lib/services/storage-service";
import type { Message } from "@/lib/types";

/**
 * Service for managing chat history operations
 * Handles message persistence and chat state
 */

/**
 * Get messages for a specific chat
 */
export function getChatMessages(chatId: string): Message[] {
	return chatMessagesStorage.get(chatId);
}

/**
 * Save messages for a specific chat
 */
export function saveChatMessages(chatId: string, messages: Message[]): void {
	chatMessagesStorage.save(chatId, messages);
}

/**
 * Clear messages for a specific chat
 */
export function clearChatMessages(chatId: string): void {
	chatMessagesStorage.remove(chatId);
}

/**
 * Check if a chat has been started
 */
export function hasChatStarted(chatId: string): boolean {
	return chatStartedStorage.get(chatId);
}

/**
 * Mark a chat as started
 */
export function markChatStarted(chatId: string, started: boolean): void {
	chatStartedStorage.save(chatId, started);
}

/**
 * Clear the started flag for a chat
 */
export function clearChatStartedFlag(chatId: string): void {
	chatStartedStorage.remove(chatId);
}

/**
 * Clear all chat data (messages and started flag)
 */
export function clearChatHistory(chatId: string): void {
	clearChatMessages(chatId);
	clearChatStartedFlag(chatId);
}
