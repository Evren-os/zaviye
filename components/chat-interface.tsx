"use client";

import { ChatInput } from "@/components/chat-input";
import { ChatMessages } from "@/components/chat-messages";
import { useChat } from "@/hooks/use-chat";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import type { ChatType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, SparklesIcon, SettingsIcon } from "lucide-react";
import { useState } from "react";
import { SettingsModal } from "./settings/settings-modal";
import { Button } from "./ui/button";
import { PersonaHub } from "./persona-hub";

interface ChatInterfaceProps {
  activeChat: ChatType;
  onChatChangeAction: (chat: ChatType) => void;
}

export function ChatInterface({ activeChat, onChatChangeAction }: ChatInterfaceProps) {
  const { messages, isLoading, sendMessage, regenerateLastResponse, stopGeneration } =
    useChat(activeChat);

  const { messagesContainerRef, isAtBottom, scrollToBottom } = useAutoScroll({
    messages,
    activeChat,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHubOpen, setIsHubOpen] = useState(false);

  return (
    <>
      <SettingsModal isOpen={isSettingsOpen} onCloseAction={() => setIsSettingsOpen(false)} />

      <PersonaHub
        isOpen={isHubOpen}
        onOpenChange={setIsHubOpen}
        onSelectPersona={onChatChangeAction}
        activeChatId={activeChat}
      />

      <div
        className={cn(
          "h-dvh w-full flex flex-col overflow-hidden relative",
          "animate-in fade-in duration-500",
        )}
      >
        <header className="absolute top-0 left-0 p-2 md:p-4 z-20 flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsSettingsOpen(true)}
            className="h-9 text-muted-foreground hover:text-foreground bg-background/60 backdrop-blur-sm shadow-md"
          >
            <SettingsIcon className="h-4 w-4 mr-2" />
            <span>Settings</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsHubOpen(true)}
            className="h-9 text-muted-foreground hover:text-foreground bg-background/60 backdrop-blur-sm shadow-md"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            <span>Persona Hub</span>
          </Button>
        </header>

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
            />
          </div>
        </div>
      </div>
    </>
  );
}
