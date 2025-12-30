import { STORAGE_KEYS, STORAGE_PREFIX } from "@/lib/constants/storage-keys";
import type { Message, ModelId, Persona } from "@/lib/types";

/**
 * Centralized storage service for all localStorage operations
 * Provides type-safe access to browser storage with error handling
 */

/**
 * Safely gets a value from localStorage with type safety
 */
function safeGet<T>(key: string, defaultValue: T): T {
	try {
		const item = localStorage.getItem(key);
		if (!item) return defaultValue;

		// Handle legacy data that might not be JSON-stringified
		// This prevents JSON.parse errors on plain string values
		try {
			return JSON.parse(item);
		} catch {
			// If parsing fails, return the raw value if it matches expected type
			// This handles legacy boolean strings like "true"/"false"
			if (item === "true" || item === "false") {
				return (item === "true") as T;
			}
			// For other unparseable values, return default
			return defaultValue;
		}
	} catch (error) {
		console.error(`Failed to get ${key} from localStorage:`, error);
		return defaultValue;
	}
}

/**
 * Safely sets a value in localStorage
 */
function safeSet(key: string, value: unknown): void {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		if (
			error instanceof DOMException &&
			(error.name === "QuotaExceededError" || error.code === 22)
		) {
			throw new Error(
				"Storage quota exceeded. Please clear some old data to continue.",
			);
		}
		console.error(`Failed to set ${key} in localStorage:`, error);
	}
}

/**
 * Safely removes a key from localStorage
 */
function safeRemove(key: string): void {
	try {
		localStorage.removeItem(key);
	} catch (error) {
		console.error(`Failed to remove ${key} from localStorage:`, error);
	}
}

/**
 * Persona storage operations
 */
export const personasStorage = {
	/**
	 * Get all custom personas from storage
	 */
	getAll(): Omit<Persona, "icon">[] {
		return safeGet(STORAGE_KEYS.CUSTOM_PERSONAS, []);
	},

	/**
	 * Save custom personas to storage
	 */
	saveAll(personas: Omit<Persona, "icon">[]): void {
		safeSet(STORAGE_KEYS.CUSTOM_PERSONAS, personas);
	},

	/**
	 * Clear all custom personas from storage
	 */
	clear(): void {
		safeRemove(STORAGE_KEYS.CUSTOM_PERSONAS);
	},
};

/**
 * Global model storage operations
 */
export const modelStorage = {
	/**
	 * Get the global model setting
	 */
	get(): ModelId | null {
		return safeGet<ModelId | null>(STORAGE_KEYS.GLOBAL_MODEL, null);
	},

	/**
	 * Save the global model setting
	 */
	save(modelId: ModelId): void {
		safeSet(STORAGE_KEYS.GLOBAL_MODEL, modelId);
	},

	/**
	 * Clear the global model setting
	 */
	clear(): void {
		safeRemove(STORAGE_KEYS.GLOBAL_MODEL);
	},
};

/**
 * Chat messages storage operations
 */
export const chatMessagesStorage = {
	/**
	 * Get messages for a specific chat
	 */
	get(chatId: string): Message[] {
		return safeGet(STORAGE_KEYS.chatMessages(chatId), []);
	},

	/**
	 * Save messages for a specific chat
	 */
	save(chatId: string, messages: Message[]): void {
		safeSet(STORAGE_KEYS.chatMessages(chatId), messages);
	},

	/**
	 * Remove messages for a specific chat
	 */
	remove(chatId: string): void {
		safeRemove(STORAGE_KEYS.chatMessages(chatId));
	},
};

/**
 * Chat started flag storage operations
 */
export const chatStartedStorage = {
	/**
	 * Check if a chat has been started
	 */
	get(chatId: string): boolean {
		return safeGet(STORAGE_KEYS.chatStarted(chatId), false);
	},

	/**
	 * Mark a chat as started
	 */
	save(chatId: string, started: boolean): void {
		safeSet(STORAGE_KEYS.chatStarted(chatId), started);
	},

	/**
	 * Remove the started flag for a chat
	 */
	remove(chatId: string): void {
		safeRemove(STORAGE_KEYS.chatStarted(chatId));
	},
};

/**
 * Utility operations for managing all storage
 */
export const storageUtils = {
	/**
	 * Get all Zaviye-related keys from localStorage
	 */
	getAllKeys(): string[] {
		const keys: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith(STORAGE_PREFIX)) {
				keys.push(key);
			}
		}
		return keys;
	},

	/**
	 * Clear all Zaviye-related data from localStorage
	 */
	clearAll(): void {
		const keys = this.getAllKeys();
		keys.forEach((key) => {
			safeRemove(key);
		});
	},
};

/**
 * Backward compatibility exports
 * These maintain the original API from lib/utils.ts
 */
export function safeLocalStorageGet<T>(key: string, defaultValue: T): T {
	return safeGet(key, defaultValue);
}

export function safeLocalStorageSet(key: string, value: unknown): void {
	safeSet(key, value);
}

export function safeLocalStorageRemove(key: string): void {
	safeRemove(key);
}
