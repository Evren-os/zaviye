import type { Message } from "@/lib/types";
import { generateId } from "@/lib/utils/id-utils";

/**
 * Factory functions for creating chat messages
 */

/**
 * Create a user message
 */
export function createUserMessage(content: string): Message {
	return {
		id: generateId(),
		role: "user",
		content,
		timestamp: Date.now(),
	};
}

/**
 * Create an assistant message
 */
export function createAssistantMessage(content: string): Message {
	return {
		id: generateId(),
		role: "assistant",
		content,
		timestamp: Date.now(),
	};
}
