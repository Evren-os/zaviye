import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import type { ChatType, Message } from "@/lib/types";

interface UseAutoScrollProps {
	messages: Message[];
	activeChat: ChatType;
}

const SCROLL_THRESHOLD = 150;

export function useAutoScroll({ messages, activeChat }: UseAutoScrollProps) {
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const [isAtBottom, setIsAtBottom] = useState(true);
	const isAtBottomRef = useRef(isAtBottom);

	useEffect(() => {
		isAtBottomRef.current = isAtBottom;
	}, [isAtBottom]);

	const scrollToBottom = useCallback(
		(behavior: "smooth" | "auto" = "smooth") => {
			const container = messagesContainerRef.current;
			if (container) {
				container.scrollTo({
					top: container.scrollHeight,
					behavior,
				});
			}
		},
		[],
	);

	const handleScroll = useCallback(() => {
		const container = messagesContainerRef.current;
		if (!container) return;

		const { scrollTop, scrollHeight, clientHeight } = container;
		const isScrollable = scrollHeight > clientHeight;
		const isCurrentlyAtBottom =
			scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;

		if (isScrollable) {
			setIsAtBottom(isCurrentlyAtBottom);
		} else {
			setIsAtBottom(true);
		}
	}, []);

	useEffect(() => {
		const container = messagesContainerRef.current;
		if (!container) return;

		container.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll(); // Initial check

		return () => container.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	useLayoutEffect(() => {
		scrollToBottom("auto");
		setIsAtBottom(true);
	}, [scrollToBottom]);

	useEffect(() => {
		if (isAtBottomRef.current) {
			scrollToBottom("smooth");
		}
	}, [scrollToBottom]);

	return {
		messagesContainerRef,
		isAtBottom,
		scrollToBottom,
	};
}
