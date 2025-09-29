"use client";

import { CopyIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MessageActionsToolbarProps {
	message: Message;
	isLastMessage: boolean;
	isLoading: boolean;
	isVisibleOnMobile: boolean;
	onCopyAction: () => void;
	onRegenerateAction: () => void;
}

export function MessageActionsToolbar({
	message,
	isLastMessage,
	isLoading,
	isVisibleOnMobile,
	onCopyAction,
	onRegenerateAction,
}: MessageActionsToolbarProps) {
	const canRegenerate =
		message.role === "assistant" && isLastMessage && !isLoading;

	return (
		<div
			className={cn(
				"flex items-center gap-1 transition-all duration-200 ease-in-out",
				// Desktop: controlled by group-hover on the parent message
				"md:opacity-0 md:group-hover/message:opacity-100 md:-translate-y-2 md:group-hover/message:translate-y-0",
				// Mobile: controlled by JS state
				{
					"opacity-100 translate-y-0": isVisibleOnMobile,
					"opacity-0 -translate-y-2 pointer-events-none md:pointer-events-auto":
						!isVisibleOnMobile,
				},
			)}
			aria-hidden={!isVisibleOnMobile}
		>
			<Button
				variant="ghost"
				size="icon"
				className="h-11 w-11 md:h-7 md:w-7 text-muted-foreground hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
				onClick={onCopyAction}
				aria-label="Copy message"
			>
				<CopyIcon className="h-4 w-4" />
			</Button>
			{canRegenerate && (
				<Button
					variant="ghost"
					size="icon"
					className="h-11 w-11 md:h-7 md:w-7 text-muted-foreground hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
					onClick={onRegenerateAction}
					aria-label="Regenerate response"
				>
					<RefreshCwIcon className="h-4 w-4" />
				</Button>
			)}
		</div>
	);
}
