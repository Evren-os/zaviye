import {
	CUSTOM_PERSONA_ICON,
	DEFAULT_PERSONAS,
} from "@/lib/constants/default-personas";
import { personasStorage } from "@/lib/services/storage-service";
import type { Persona } from "@/lib/types";

/**
 * Service for managing persona operations
 * Handles persona CRUD operations and merging with defaults
 */

/**
 * Get all custom personas from storage (without icons)
 */
export function getRawCustomPersonas(): Omit<Persona, "icon">[] {
	return personasStorage.getAll();
}

/**
 * Get all custom personas with icons attached
 */
export function getCustomPersonas(): Persona[] {
	const raw = personasStorage.getAll();
	return raw.map((p) => ({
		...p,
		icon: CUSTOM_PERSONA_ICON,
	}));
}

/**
 * Save custom personas to storage (strips icons)
 */
export function saveCustomPersonas(personas: Persona[]): void {
	const toSave = personas.map(({ icon: _icon, ...rest }) => rest);
	personasStorage.saveAll(toSave);
}

/**
 * Merge default personas with custom overrides
 * Custom personas can override default persona properties by matching ID
 * Returns all personas sorted by lastUsed
 */
export function getAllPersonas(customPersonas: Persona[]): Persona[] {
	const defaultMap = new Map(DEFAULT_PERSONAS.map((p) => [p.id, p]));
	const customMap = new Map(customPersonas.map((p) => [p.id, p]));

	// Merge defaults with custom overrides
	const merged = DEFAULT_PERSONAS.map((defaultPersona) => {
		const customOverride = customMap.get(defaultPersona.id);
		if (customOverride) {
			return {
				...defaultPersona,
				name: customOverride.name || defaultPersona.name,
				prompt: customOverride.prompt || defaultPersona.prompt,
				placeholder: customOverride.placeholder || defaultPersona.placeholder,
				lastUsed: customOverride.lastUsed,
				model: customOverride.model,
			};
		}
		return defaultPersona;
	});

	// Add non-overriding custom personas
	const nonOverridingCustom = customPersonas.filter(
		(p) => !defaultMap.has(p.id),
	);

	// Sort by lastUsed descending
	return [...merged, ...nonOverridingCustom].sort(
		(a, b) => (b.lastUsed ?? 0) - (a.lastUsed ?? 0),
	);
}

/**
 * Find a specific persona by ID
 */
export function findPersona(
	personas: Persona[],
	id: string,
): Persona | undefined {
	return personas.find((p) => p.id === id);
}

/**
 * Export custom personas for backup (without icons)
 */
export function exportPersonas(): Omit<Persona, "icon">[] {
	return personasStorage.getAll();
}

/**
 * Import personas with duplicate handling
 * Returns count of added and updated personas
 */
export function importPersonas(
	currentCustomPersonas: Persona[],
	incomingData: Array<Omit<Persona, "icon">>,
	options?: { overwrite?: boolean },
): { added: number; updated: number; personas: Persona[] } {
	const overwrite = options?.overwrite ?? false;
	let added = 0;
	let updated = 0;

	const map = new Map<string, Persona>(
		currentCustomPersonas.map((p) => [p.id, p]),
	);

	incomingData.forEach((incoming) => {
		const existing = map.get(incoming.id);
		if (existing) {
			if (overwrite) {
				map.set(incoming.id, {
					...existing,
					...incoming,
					icon: CUSTOM_PERSONA_ICON,
				});
				updated += 1;
			}
		} else {
			map.set(incoming.id, { ...incoming, icon: CUSTOM_PERSONA_ICON });
			added += 1;
		}
	});

	return { added, updated, personas: Array.from(map.values()) };
}

/**
 * Check if a persona is a default persona
 */
export function isDefaultPersona(id: string): boolean {
	return DEFAULT_PERSONAS.some((p) => p.id === id);
}

/**
 * Clear all custom personas from storage
 */
export function clearAllPersonas(): void {
	personasStorage.clear();
}
