/**
 * Error handling utilities for consistent error management
 */

/**
 * Handles errors by showing a toast notification and logging
 * Skips toast for aborted requests
 */
interface ToastError {
	error: (
		message: string,
		options?: { duration?: number; description?: string },
	) => void;
}

export function handleError(
	error: unknown,
	context: string,
	toast: ToastError,
): void {
	if (error instanceof Error && error.name === "AbortError") {
		return;
	}

	if (error instanceof Error) {
		toast.error(error.message, {
			duration: 3500,
			description: "Consider switching to a different model if this persists.",
		});
	} else {
		toast.error(`An error occurred in ${context}`, { duration: 3500 });
	}

	console.error(`Error in ${context}:`, error);
}
