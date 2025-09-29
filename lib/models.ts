import type { ModelId } from "./types";

export interface Model {
	id: ModelId;
	name: string;
	rpm: number; // Internal requests per minute for client-side throttling
	provider: "Google";
}

export const MODELS: Model[] = [
	{
		id: "gemini-2.5-pro",
		name: "Gemini 2.5 Pro",
		rpm: 2,
		provider: "Google",
	},
	{
		id: "gemini-2.5-flash",
		name: "Gemini 2.5 Flash",
		rpm: 4,
		provider: "Google",
	},
	{
		id: "gemini-2.5-flash-lite-preview-06-17",
		name: "Gemini 2.5 Flash-Lite (Preview)",
		rpm: 7,
		provider: "Google",
	},
	{
		id: "gemini-2.0-flash",
		name: "Gemini 2.0 Flash",
		rpm: 7,
		provider: "Google",
	},
	{
		id: "gemini-2.0-flash-lite",
		name: "Gemini 2.0 Flash-Lite",
		rpm: 10,
		provider: "Google",
	},
];

export const getModelById = (id: ModelId): Model | undefined => {
	return MODELS.find((model) => model.id === id);
};
