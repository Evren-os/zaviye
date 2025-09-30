/**
 * Generates a random unique ID
 * Uses the same format as the original implementation for compatibility
 */
export function generateId(): string {
	return (
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)
	);
}

/**
 * Generates a UUID using the Web Crypto API
 * Preferred for newer persona creation
 */
export function generateUUID(): string {
	return crypto.randomUUID();
}
