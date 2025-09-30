/**
 * Chat management hook
 *
 * This file has been refactored for better maintainability.
 * The implementation is now split into focused modules:
 * - chat/use-chat-state.ts: Main state management
 * - chat/use-chat-storage.ts: localStorage persistence
 * - chat/use-chat-api.ts: API calls to Gemini
 * - chat/use-rate-limit.ts: Rate limiting logic
 * - chat/chat-operations.ts: Pure business logic
 * - chat/message-factory.ts: Message creation utilities
 *
 * This file now serves as a backward-compatible re-export.
 */

import type { ChatType } from "@/lib/types";
import { useChatState } from "./chat/use-chat-state";

export function useChat(chatType: ChatType) {
	return useChatState(chatType);
}
