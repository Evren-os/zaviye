/**
 * String manipulation utilities
 */

/**
 * Truncate a string to a maximum length and add ellipsis
 */
export function truncate(
	text: string,
	maxLength: number,
	ellipsis = "...",
): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(text: string): string {
	if (!text) return text;
	return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert a string to title case
 */
export function toTitleCase(text: string): string {
	return text
		.split(" ")
		.map((word) => capitalize(word.toLowerCase()))
		.join(" ");
}

/**
 * Remove extra whitespace from a string
 */
export function normalizeWhitespace(text: string): string {
	return text.trim().replace(/\s+/g, " ");
}

/**
 * Count words in a string
 */
export function countWords(text: string): number {
	return normalizeWhitespace(text).split(" ").filter(Boolean).length;
}

/**
 * Format a timestamp to a relative time string
 */
export function formatRelativeTime(timestamp: number): string {
	const now = Date.now();
	const diff = now - timestamp;
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) return "just now";
	if (minutes < 60) return `${minutes}m ago`;
	if (hours < 24) return `${hours}h ago`;
	if (days < 7) return `${days}d ago`;

	return new Date(timestamp).toLocaleDateString();
}
