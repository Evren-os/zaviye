/**
 * Common validation utilities
 */

/**
 * Check if a string is empty or only whitespace
 */
export function isEmpty(value: string): boolean {
	return !value || value.trim().length === 0;
}

/**
 * Check if a string is not empty
 */
export function isNotEmpty(value: string): boolean {
	return !isEmpty(value);
}

/**
 * Validate minimum length
 */
export function hasMinLength(value: string, minLength: number): boolean {
	return value.trim().length >= minLength;
}

/**
 * Validate maximum length
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
	return value.trim().length <= maxLength;
}

/**
 * Validate length range
 */
export function hasLengthBetween(
	value: string,
	min: number,
	max: number,
): boolean {
	const length = value.trim().length;
	return length >= min && length <= max;
}

/**
 * Validate that a value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
	return value !== null && value !== undefined;
}

/**
 * Validate array is not empty
 */
export function isNotEmptyArray<T>(
	array: T[] | null | undefined,
): array is T[] {
	return Array.isArray(array) && array.length > 0;
}
