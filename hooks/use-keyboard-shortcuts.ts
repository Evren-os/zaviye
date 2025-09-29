"use client";

import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
	isHubOpen: boolean;
	setIsHubOpen: (open: boolean) => void;
	onFocusInput?: () => void;
}

export function useKeyboardShortcuts({
	isHubOpen,
	setIsHubOpen,
	onFocusInput,
}: UseKeyboardShortcutsProps) {
	useEffect(() => {
		const isTypingTarget = (target: EventTarget | null) => {
			if (!(target instanceof HTMLElement)) return false;
			const tag = target.tagName;
			const editable = target.getAttribute("contenteditable");
			return (
				tag === "INPUT" ||
				tag === "TEXTAREA" ||
				editable === "" ||
				editable === "true"
			);
		};

		const onKeyDown = (e: KeyboardEvent) => {
			// Focus input on '/'
			if (
				e.key === "/" &&
				!e.metaKey &&
				!e.ctrlKey &&
				!e.altKey &&
				!isTypingTarget(e.target)
			) {
				e.preventDefault();
				onFocusInput?.();
				return;
			}

			// Open Hub on Cmd/Ctrl+K
			if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setIsHubOpen(true);
				return;
			}

			// Close Hub on Esc
			if (e.key === "Escape" && isHubOpen) {
				e.preventDefault();
				setIsHubOpen(false);
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [isHubOpen, setIsHubOpen, onFocusInput]);
}
