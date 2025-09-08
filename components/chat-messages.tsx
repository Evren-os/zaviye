"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/loading-dots";
import type { Message, ChatType, Persona } from "@/lib/types";
import { MessageActionsToolbar } from "./message-actions-toolbar";
import { useIsMobile } from "@/hooks/use-mobile";
 
import { usePersonas } from "@/hooks/use-personas";
import dynamic from "next/dynamic";

const Markdown = dynamic(() => import("./markdown").then((m) => m.Markdown), {
  ssr: false,
  loading: () => null,
});

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  activeChat: ChatType;
  onRegenerateAction: () => void;
  onSendDemoPrompt: (prompt: string) => void;
}

// Removed ad-hoc code fence parsing in favor of full Markdown rendering

const IntroScreen = ({
  persona,
  onSendDemoPrompt,
}: {
  persona: Persona | undefined;
  onSendDemoPrompt: (prompt: string) => void;
}) => {
  if (!persona) return null;

  const hasIntro = persona.isDefault && persona.introMessage;
  const hasDemos = persona.demoPrompts && persona.demoPrompts.length > 0;

  return (
    <div className="flex items-center justify-center flex-1">
      <div className="max-w-md w-full text-center space-y-5 animate-in fade-in-50 slide-in-from-bottom-4 duration-200 motion-reduce:animate-none">
        {hasIntro && (
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{persona.name}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{persona.introMessage}</p>
          </div>
        )}

        {hasDemos && (
          <div className="space-y-3">
            {hasIntro && <div className="border-t border-border/60 my-1.5" />}
            <h4 className="text-xs uppercase tracking-wide text-muted-foreground/70 text-left">Examples</h4>
            <div className="flex flex-col text-left">
              {persona.demoPrompts?.slice(0, 3).map((prompt: string, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSendDemoPrompt(prompt)}
                  className="group w-full text-left px-0 py-2.5 min-h-11 text-[0.95rem] text-muted-foreground hover:text-foreground transition-colors duration-150 border-b border-border/50 last:border-b-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {!hasIntro && !hasDemos && (
          <p className="text-center text-muted-foreground text-sm">Start a conversation...</p>
        )}
      </div>
    </div>
  );
};

export function ChatMessages({
  messages,
  isLoading,
  activeChat,
  onRegenerateAction,
  onSendDemoPrompt,
}: ChatMessagesProps) {
  const [activeToolbarId, setActiveToolbarId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { getPersona } = usePersonas();
  const persona = getPersona(activeChat);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard", { duration: 1500 });
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleContainerClick = () => {
    if (activeToolbarId) {
      setActiveToolbarId(null);
    }
  };

  const handleMessageClick = (e: React.MouseEvent, messageId: string) => {
    if (isMobile) {
      e.stopPropagation();
      setActiveToolbarId(activeToolbarId === messageId ? null : messageId);
    }
  };

  const shouldShowIntroScreen = messages.length === 0 && !isLoading;

  return (
    <div
      className="flex flex-col h-full"
      onClick={handleContainerClick}
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      aria-busy={isLoading}
      aria-label="Chat messages"
    >
      {shouldShowIntroScreen ? (
        <IntroScreen persona={persona} onSendDemoPrompt={onSendDemoPrompt} />
      ) : (
        <div className="space-y-3 py-4">
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;

            return (
              <div
                key={message.id}
                className={cn(
                  "group/message flex w-full flex-col gap-[7px]",
                  message.role === "user" ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "relative max-w-[85%] rounded-xl px-3.5 py-2.5 transition-all duration-200 text-left",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/80 backdrop-blur-sm border shadow-sm text-foreground",
                    isMobile && "cursor-pointer",
                  )}
                  onClick={(e) => handleMessageClick(e, message.id)}
                >
                  <Markdown className="text-sm break-words">
                    {message.content}
                  </Markdown>
                </div>
                <MessageActionsToolbar
                  message={message}
                  isLastMessage={isLastMessage}
                  isLoading={isLoading}
                  isVisibleOnMobile={activeToolbarId === message.id}
                  onCopyAction={() => {
                    copyToClipboard(message.content);
                    setActiveToolbarId(null);
                  }}
                  onRegenerateAction={() => {
                    onRegenerateAction();
                    setActiveToolbarId(null);
                  }}
                />
              </div>
            );
          })}

          {isLoading && (
            <div className="flex w-full justify-start animate-in slide-in-from-bottom-2 duration-200">
              <div className="max-w-[85%] rounded-xl bg-muted/80 backdrop-blur-sm border px-3.5 py-2.5 shadow-sm">
                <LoadingDots />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
