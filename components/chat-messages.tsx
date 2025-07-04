"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/loading-dots";
import type { Message, ChatType, Persona } from "@/lib/types";
import { CodeBlock } from "./code-block";
import { MessageActionsToolbar } from "./message-actions-toolbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "./ui/button";
import { usePersonas } from "@/hooks/use-personas";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  hasStartedChat: boolean;
  activeChat: ChatType;
  onRegenerateAction: () => void;
  onSendDemoPrompt: (prompt: string) => void;
}

// A simple parser to split text and code blocks
const parseMessageContent = (content: string) => {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts
    .map((part, index) => {
      if (index % 2 === 1) {
        const code = part.replace(/^```|```$/g, "").trim();
        return { type: "code" as const, content: code };
      }
      return { type: "text" as const, content: part };
    })
    .filter((part) => part.content.length > 0);
};

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
      <div className="max-w-md w-full text-center space-y-5 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
        {hasIntro && (
          <div className="bg-muted/30 backdrop-blur-sm rounded-xl p-4 sm:p-5 border">
            <h3 className="text-lg font-semibold mb-2 text-foreground">{persona.name}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm mb-3">
              {persona.introMessage}
            </p>
            <Collapsible>
              <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                <div className="pt-2">
                  <p className="text-muted-foreground/80 text-xs leading-relaxed bg-background/50 p-3 rounded-lg border font-mono">
                    {persona.description}
                  </p>
                </div>
              </CollapsibleContent>
              <div className="mt-3">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="link"
                    className="text-primary/80 hover:text-primary text-xs p-0 h-auto data-[state=open]:hidden"
                  >
                    Learn more
                  </Button>
                </CollapsibleTrigger>
              </div>
            </Collapsible>
          </div>
        )}

        {hasDemos && (
          <div className="space-y-3">
            {!hasIntro && (
              <h4 className="text-sm font-medium text-muted-foreground">Try these examples:</h4>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {persona.demoPrompts?.map((prompt: string, i: number) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto whitespace-normal py-2 px-3 justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => onSendDemoPrompt(prompt)}
                >
                  {prompt}
                </Button>
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
  hasStartedChat,
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
    <div className="flex flex-col h-full" onClick={handleContainerClick}>
      {shouldShowIntroScreen ? (
        <IntroScreen persona={persona} onSendDemoPrompt={onSendDemoPrompt} />
      ) : (
        <div className="space-y-3 py-4">
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            const messageParts = parseMessageContent(message.content);

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
                    "relative max-w-[85%] rounded-xl px-3.5 py-2.5 transition-all duration-300 text-left",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/80 backdrop-blur-sm border shadow-sm",
                    isMobile && "cursor-pointer",
                  )}
                  onClick={(e) => handleMessageClick(e, message.id)}
                >
                  <div className="prose-xs text-sm break-words whitespace-pre-wrap">
                    {messageParts.map((part, partIndex) =>
                      part.type === "code" ? (
                        <CodeBlock key={partIndex} code={part.content} />
                      ) : (
                        <span key={partIndex}>{part.content}</span>
                      ),
                    )}
                  </div>
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
            <div className="flex w-full justify-start animate-in slide-in-from-bottom-2 duration-300">
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
