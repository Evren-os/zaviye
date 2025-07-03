"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat-interface";
import type { ChatType } from "@/lib/types";

export default function Home() {
  const [activeChat, setActiveChat] = useState<ChatType>("glitch");

  return (
    <main className="flex flex-1 flex-col bg-background">
      <ChatInterface activeChat={activeChat} onChatChangeAction={setActiveChat} />
    </main>
  );
}
