import type { ElementType } from "react";

export type ChatType = string;

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
}

export interface Persona {
  id: string;
  name: string;
  prompt: string;
  isDefault: boolean;
  icon: ElementType;
  placeholder?: string;
  introMessage?: string;
  description?: string;
  lastUsed?: number;
  demoPrompts?: string[];
}
