import { CUSTOM_PERSONA_ICON } from "@/lib/constants/default-personas";
import {
	findPersona,
	getAllPersonas as getAllPersonasFromService,
	importPersonas,
	isDefaultPersona,
} from "@/lib/services/persona-service";
import type { Persona } from "@/lib/types";
import { generateUUID } from "@/lib/utils/id-utils";

/**
 * Create a new persona
 * Returns the new persona ID
 */
export function createNewPersona(
	customPersonas: Persona[],
	data: { name: string; prompt: string },
): { newId: string; updatedPersonas: Persona[] } {
	const newId = generateUUID();
	const newPersona: Persona = {
		...data,
		id: newId,
		isDefault: false,
		icon: CUSTOM_PERSONA_ICON,
		lastUsed: Date.now(),
	};

	return {
		newId,
		updatedPersonas: [...customPersonas, newPersona],
	};
}

/**
 * Update an existing persona
 * Can update custom personas or override default ones
 */
export function updateExistingPersona(
	customPersonas: Persona[],
	id: string,
	data: Partial<Omit<Persona, "id" | "isDefault">>,
): Persona[] {
	const existing = customPersonas.find((p) => p.id === id);

	if (existing) {
		// Update existing custom persona
		return customPersonas.map((p) => (p.id === id ? { ...p, ...data } : p));
	}

	// Check if it's a default persona we're overriding
	if (isDefaultPersona(id)) {
		const allPersonas = getAllPersonasFromService(customPersonas);
		const defaultPersona = findPersona(allPersonas, id);

		if (defaultPersona) {
			const newOverride: Persona = {
				id,
				name: data.name ?? defaultPersona.name,
				prompt: data.prompt ?? defaultPersona.prompt,
				placeholder: data.placeholder,
				isDefault: true,
				icon: CUSTOM_PERSONA_ICON,
				lastUsed: data.lastUsed,
				model: data.model,
			};
			return [...customPersonas, newOverride];
		}
	}

	return customPersonas;
}

/**
 * Delete a custom persona
 * Cannot delete default personas
 */
export function deleteExistingPersona(
	customPersonas: Persona[],
	id: string,
): Persona[] {
	return customPersonas.filter((p) => p.id !== id);
}

/**
 * Mark a persona as recently used
 */
export function markPersonaAsUsed(
	customPersonas: Persona[],
	id: string,
): Persona[] {
	return updateExistingPersona(customPersonas, id, { lastUsed: Date.now() });
}

/**
 * Reset a default persona to its original state
 * Removes any custom overrides
 */
export function resetToDefaultPersona(
	customPersonas: Persona[],
	id: string,
): Persona[] {
	if (!isDefaultPersona(id)) {
		return customPersonas;
	}
	return customPersonas.filter((p) => p.id !== id);
}

/**
 * Import personas from external data
 */
export function importExternalPersonas(
	customPersonas: Persona[],
	data: Array<Omit<Persona, "icon">>,
	options?: { overwrite?: boolean },
): { added: number; updated: number; personas: Persona[] } {
	return importPersonas(customPersonas, data, options);
}
