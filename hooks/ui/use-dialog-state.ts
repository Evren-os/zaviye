import { useCallback, useState } from "react";

/**
 * Hook for managing dialog/modal open state
 * Provides open, close, and toggle functions
 */
export function useDialogState(initialOpen = false) {
	const [isOpen, setIsOpen] = useState(initialOpen);

	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

	return {
		isOpen,
		open,
		close,
		toggle,
		setIsOpen,
	};
}
