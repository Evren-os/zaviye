import type { ElementType } from "react";

export type ChatType = string;

export type ModelId = "gemini-3-flash-preview";

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
	model?: ModelId;
	placeholder?: string;
	introMessage?: string;
	description?: string;
	lastUsed?: number;
	demoPrompts?: string[];
}
