"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePersonas } from "@/hooks/use-personas";
import type { ChatType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronDown, SendIcon, SquareIcon, TimerIcon } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface ChatInputProps {
  onSendAction: (message: string) => void;
  isLoading: boolean;
  activeChat: ChatType;
  onOpenHubAction: () => void;
  stopGeneration: () => void;
  throttleSeconds: number;
}

const MIN_TEXTAREA_HEIGHT = 80;
const MAX_TEXTAREA_HEIGHT = 120;

export function ChatInput({
  onSendAction,
  isLoading,
  activeChat,
  onOpenHubAction,
  stopGeneration,
  throttleSeconds,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getPersona } = usePersonas();
  const persona = getPersona(activeChat);
  const Icon = persona?.icon;
  const isThrottled = throttleSeconds > 0;

  // Reset input when chat type changes
  useEffect(() => {
    setInput("");
  }, [activeChat]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to recalculate
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, MIN_TEXTAREA_HEIGHT), MAX_TEXTAREA_HEIGHT);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !isThrottled) {
      onSendAction(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = `${MIN_TEXTAREA_HEIGHT}px`;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !isThrottled) {
        handleSubmit(e);
      }
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="relative">
        <form
          onSubmit={handleSubmit}
          className={cn(
            "relative flex flex-col rounded-2xl border bg-background/95 backdrop-blur-sm shadow-lg transition-all duration-200 motion-reduce:transition-none",
            isFocused ? "ring-2 ring-primary/20 border-primary/30" : "border-border",
          )}
        >
          <div className="relative p-4">
            <Textarea
              ref={textareaRef}
              id="zaviye-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={persona?.placeholder || "Type your message..."}
              className="no-focus-outline resize-none border-0 bg-transparent text-sm placeholder:text-muted-foreground/60 transition-all duration-200 motion-reduce:transition-none"
              style={{ height: `${MIN_TEXTAREA_HEIGHT}px` }}
            />
          </div>

          <div className="flex items-center justify-between p-3 pt-0">
            <Button
              variant="outline"
              type="button"
              onClick={onOpenHubAction}
              className="flex items-center gap-2 rounded-lg border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 h-11 md:h-9 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{persona?.name ?? "Select Persona"}</span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>

            <div className="flex items-center gap-2">
              {isThrottled && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TimerIcon className="h-4 w-4 animate-pulse motion-reduce:animate-none" />
                  <span>Wait {throttleSeconds}s</span>
                </div>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type={isLoading ? "button" : "submit"}
                    size="icon"
                    onClick={isLoading ? stopGeneration : undefined}
                    disabled={(!input.trim() && !isLoading) || isThrottled}
                    className={cn(
                      "rounded-lg h-11 w-11 md:h-8 md:w-8 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isLoading && "bg-primary hover:bg-primary/90",
                    )}
                    aria-label={isLoading ? "Stop generating" : "Send message"}
                  >
                    <div className="relative h-4 w-4 flex items-center justify-center overflow-hidden">
                      <SquareIcon
                        className={cn(
                          "absolute transition-all duration-200 ease-in-out motion-reduce:transition-none",
                          isLoading && !isThrottled
                            ? "opacity-100 scale-100"
                            : "opacity-0 -translate-y-full scale-50",
                        )}
                        fill="currentColor"
                      />
                      <SendIcon
                        className={cn(
                          "absolute transition-all duration-200 ease-in-out motion-reduce:transition-none",
                          isLoading || isThrottled
                            ? "opacity-0 translate-y-full scale-50"
                            : "opacity-100 scale-100",
                        )}
                      />
                    </div>
                  </Button>
                </TooltipTrigger>
                {isLoading && !isThrottled && (
                  <TooltipContent>
                    <p>Stop generating</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}
