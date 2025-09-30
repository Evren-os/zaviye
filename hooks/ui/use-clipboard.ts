import { useCallback, useState } from "react";

/**
 * Hook for copying text to clipboard with feedback state
 */
export function useClipboard(timeout = 2000) {
	const [isCopied, setIsCopied] = useState(false);

	const copy = useCallback(
		async (text: string): Promise<boolean> => {
			if (!navigator?.clipboard) {
				console.warn("Clipboard API not available");
				return false;
			}

			try {
				await navigator.clipboard.writeText(text);
				setIsCopied(true);
				setTimeout(() => setIsCopied(false), timeout);
				return true;
			} catch (error) {
				console.error("Failed to copy to clipboard:", error);
				setIsCopied(false);
				return false;
			}
		},
		[timeout],
	);

	return { isCopied, copy };
}
