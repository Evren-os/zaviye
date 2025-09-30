import type { Message } from "@/lib/types";

/**
 * Pure business logic functions for chat operations
 */

/**
 * Find the last user message in a conversation
 */
export function findLastUserMessage(messages: Message[]): Message | undefined {
	return [...messages].reverse().find((m) => m.role === "user");
}

/**
 * Filter out assistant messages after a specific timestamp
 * Used when regenerating responses
 */
export function removeAssistantMessagesAfter(
	messages: Message[],
	timestamp: number,
): Message[] {
	return messages.filter(
		(msg) => msg.role !== "assistant" || msg.timestamp < timestamp,
	);
}

/**
 * Remove a specific message by ID
 */
export function removeMessageById(messages: Message[], id: string): Message[] {
	return messages.filter((msg) => msg.id !== id);
}

/**
 * Add a message to the conversation
 */
export function addMessage(messages: Message[], message: Message): Message[] {
	return [...messages, message];
}

/**
 * Validate if content is sendable (not empty or whitespace)
 */
export function isValidMessageContent(content: string): boolean {
	return content.trim().length > 0;
}
