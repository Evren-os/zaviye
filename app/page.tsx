"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat-interface";
import type { ChatType } from "@/lib/types";
import { Toaster } from "@/components/ui/sonner";
import { PersonasProvider } from "@/hooks/use-personas";

export default function Home() {
  const [activeChat, setActiveChat] = useState<ChatType>("glitch");

  return (
    <PersonasProvider>
      <main className="flex flex-1 flex-col bg-background">
        <ChatInterface activeChat={activeChat} onChatChangeAction={setActiveChat} />
      </main>
      <Toaster richColors position="top-center" />
    </PersonasProvider>
  );
}