"use client";

import { Button } from "@/components/ui/button";
import { CopyIcon, RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";

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
  const canRegenerate = message.role === "assistant" && isLastMessage && !isLoading;

  return (
    <div
      className={cn(
        "flex items-center gap-1 transition-all duration-200 ease-in-out",
        // Desktop: controlled by group-hover on the parent message
        "md:opacity-0 md:group-hover/message:opacity-100 md:-translate-y-2 md:group-hover/message:translate-y-0",
        // Mobile: controlled by JS state
        {
          "opacity-100 translate-y-0": isVisibleOnMobile,
          "opacity-0 -translate-y-2 pointer-events-none md:pointer-events-auto": !isVisibleOnMobile,
        },
      )}
      aria-hidden={!isVisibleOnMobile}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 md:h-7 md:w-7 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        onClick={onCopyAction}
        aria-label="Copy message"
      >
        <CopyIcon className="h-4 w-4" />
      </Button>
      {canRegenerate && (
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 md:h-7 md:w-7 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          onClick={onRegenerateAction}
          aria-label="Regenerate response"
        >
          <RefreshCwIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
