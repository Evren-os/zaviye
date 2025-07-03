"use client";

import { ChatInput } from "@/components/chat-input";
import { ChatMessages } from "@/components/chat-messages";
import { useChat } from "@/hooks/use-chat";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import type { ChatType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowDownIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { PersonaHub } from "./persona-hub";
import { useMounted } from "@/hooks/use-mounted";
import { Header } from "./header";

interface ChatInterfaceProps {
  activeChat: ChatType;
  onChatChangeAction: (chat: ChatType) => void;
}

export function ChatInterface({ activeChat, onChatChangeAction }: ChatInterfaceProps) {
  const {
    messages,
    isLoading,
    sendMessage,
    regenerateLastResponse,
    stopGeneration,
    throttleSeconds,
  } = useChat(activeChat);

  const { messagesContainerRef, isAtBottom, scrollToBottom } = useAutoScroll({
    messages,
    activeChat,
  });

  const [isHubOpen, setIsHubOpen] = useState(false);
  const isMounted = useMounted();

  return (
    <>
      {isMounted && (
        <PersonaHub
          isOpen={isHubOpen}
          onOpenChange={setIsHubOpen}
          onSelectPersona={onChatChangeAction}
          activeChatId={activeChat}
        />
      )}

      <div
        className={cn(
          "h-dvh w-full flex flex-col overflow-hidden relative",
          "animate-in fade-in duration-500",
        )}
      >
        <Header onOpenHubAction={() => setIsHubOpen(true)} />

        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto messages-container relative"
        >
          <div className="mx-auto max-w-3xl h-full p-2 md:p-4">
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              hasStartedChat={messages.length > 0}
              activeChat={activeChat}
              onRegenerateAction={regenerateLastResponse}
              onSendDemoPrompt={sendMessage}
            />
            <div className="h-4 flex-shrink-0" />
          </div>
        </div>

        <div className="relative flex-shrink-0 p-2 pb-4 md:p-4 md:pb-6 z-10">
          <div
            className={cn(
              "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 transition-all duration-300 ease-in-out",
              !isAtBottom
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none",
            )}
          >
            <Button
              onClick={() => scrollToBottom("smooth")}
              size="icon"
              variant="outline"
              className="rounded-full shadow-lg bg-background/80 backdrop-blur-sm h-10 w-10"
            >
              <ArrowDownIcon className="h-5 w-5" />
              <span className="sr-only">Scroll to bottom</span>
            </Button>
          </div>

          <div className="mx-auto max-w-3xl">
            <ChatInput
              onSendAction={sendMessage}
              isLoading={isLoading}
              activeChat={activeChat}
              onOpenHubAction={() => setIsHubOpen(true)}
              stopGeneration={stopGeneration}
              throttleSeconds={throttleSeconds}
            />
          </div>
        </div>
      </div>
    </>
  );
}
