import type { ModelId } from "./types";

export interface Model {
	id: ModelId;
	name: string;
	rpm: number; // Internal requests per minute for client-side throttling
	provider: "Google";
}

export const MODELS: Model[] = [
	{
		id: "gemini-3-flash-preview",
		name: "Gemini 3 Flash Preview",
		rpm: 3,
		provider: "Google",
	},
];

export const getModelById = (id: ModelId): Model | undefined => {
	return MODELS.find((model) => model.id === id);
};
