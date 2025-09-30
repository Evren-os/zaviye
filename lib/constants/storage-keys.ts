/**
 * Centralized storage keys for localStorage operations
 * All keys are prefixed with 'zaviye-' for namespacing
 */

export const STORAGE_KEYS = {
	CUSTOM_PERSONAS: "zaviye-custom-personas",
	GLOBAL_MODEL: "zaviye-global-model",

	/**
	 * Generates a chat messages key for a specific chat/persona ID
	 */
	chatMessages: (chatId: string) => `zaviye-${chatId}-messages`,

	/**
	 * Generates a chat started flag key for a specific chat/persona ID
	 */
	chatStarted: (chatId: string) => `zaviye-${chatId}-started`,
} as const;

/**
 * Storage key prefix for identifying all Zaviye-related keys
 */
export const STORAGE_PREFIX = "zaviye-";
