/**
 * Array manipulation utilities
 */

/**
 * Remove duplicate items from an array
 */
export function unique<T>(array: T[]): T[] {
	return [...new Set(array)];
}

/**
 * Remove duplicate items by a key selector
 */
export function uniqueBy<T, K>(array: T[], keySelector: (item: T) => K): T[] {
	const seen = new Set<K>();
	return array.filter((item) => {
		const key = keySelector(item);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

/**
 * Group array items by a key selector
 */
export function groupBy<T, K extends string | number>(
	array: T[],
	keySelector: (item: T) => K,
): Record<K, T[]> {
	return array.reduce(
		(groups, item) => {
			const key = keySelector(item);
			if (!groups[key]) {
				groups[key] = [];
			}
			groups[key].push(item);
			return groups;
		},
		{} as Record<K, T[]>,
	);
}

/**
 * Chunk an array into smaller arrays of specified size
 */
export function chunk<T>(array: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}

/**
 * Get the last item from an array
 */
export function last<T>(array: T[]): T | undefined {
	return array[array.length - 1];
}

/**
 * Get the first item from an array
 */
export function first<T>(array: T[]): T | undefined {
	return array[0];
}

/**
 * Shuffle an array randomly
 */
export function shuffle<T>(array: T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}
