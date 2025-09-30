"use client";

import { createContext, useContext } from "react";
import type { ModelId, Persona } from "@/lib/types";

/**
 * Context type for persona management
 */
export interface PersonasContextType {
	getPersona: (id: string) => Persona | undefined;
	getAllPersonas: () => Persona[];
	getRawCustomPersonas: () => Persona[];
	exportCustomPersonas: () => Omit<Persona, "icon">[];
	importCustomPersonas: (
		data: Array<Omit<Persona, "icon">>,
		options?: { overwrite?: boolean },
	) => { added: number; updated: number };
	createPersona: (data: { name: string; prompt: string }) => string;
	updatePersona: (
		id: string,
		data: Partial<Omit<Persona, "id" | "isDefault">>,
	) => void;
	deletePersona: (id: string) => void;
	selectPersona: (id: string) => void;
	resetPersonaToDefault: (id: string) => void;
	globalModel: ModelId;
	setGlobalModel: (modelId: ModelId) => void;
}

/**
 * Personas context for accessing persona state throughout the app
 */
export const PersonasContext = createContext<PersonasContextType | null>(null);

/**
 * Hook to access personas context
 * Must be used within PersonasProvider
 */
export function usePersonas(): PersonasContextType {
	const context = useContext(PersonasContext);
	if (!context) {
		throw new Error("usePersonas must be used within a PersonasProvider");
	}
	return context;
}
