import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_MODEL_ID } from "@/lib/constants/rate-limits";
import {
	exportPersonas,
	findPersona,
	getAllPersonas,
	getCustomPersonas,
	saveCustomPersonas,
} from "@/lib/services/persona-service";
import { modelStorage } from "@/lib/services/storage-service";
import type { ModelId, Persona } from "@/lib/types";
import type { PersonasContextType } from "./personas-context";
import {
	createNewPersona,
	deleteExistingPersona,
	importExternalPersonas,
	markPersonaAsUsed,
	resetToDefaultPersona,
	updateExistingPersona,
} from "./personas-operations";

/**
 * Hook for managing personas state
 * Handles loading, saving, and all CRUD operations
 */
export function usePersonasState(): PersonasContextType {
	const [customPersonas, setCustomPersonas] = useState<Persona[]>([]);
	const [globalModel, setGlobalModelState] =
		useState<ModelId>(DEFAULT_MODEL_ID);
	const [isMounted, setIsMounted] = useState(false);

	// Load initial state from storage
	useEffect(() => {
		setIsMounted(true);
		const savedPersonas = getCustomPersonas();
		const savedModel = modelStorage.get();

		setCustomPersonas(savedPersonas);
		if (savedModel) {
			setGlobalModelState(savedModel);
		}
	}, []);

	// Save state to storage whenever it changes
	useEffect(() => {
		if (!isMounted) return;

		saveCustomPersonas(customPersonas);
		modelStorage.save(globalModel);
	}, [customPersonas, globalModel, isMounted]);

	// Merge custom personas with defaults and sort by lastUsed
	const allPersonas = useMemo<Persona[]>(() => {
		if (!isMounted) {
			// Return empty array during SSR to prevent hydration mismatch
			return [];
		}
		return getAllPersonas(customPersonas);
	}, [customPersonas, isMounted]);

	const getPersona = useCallback(
		(id: string): Persona | undefined => {
			return findPersona(allPersonas, id);
		},
		[allPersonas],
	);

	const getAllPersonasCallback = useCallback((): Persona[] => {
		return allPersonas;
	}, [allPersonas]);

	const getRawCustomPersonas = useCallback((): Persona[] => {
		return customPersonas;
	}, [customPersonas]);

	const exportCustomPersonas = useCallback((): Omit<Persona, "icon">[] => {
		return exportPersonas();
	}, []);

	const importCustomPersonas = useCallback(
		(
			data: Array<Omit<Persona, "icon">>,
			options?: { overwrite?: boolean },
		): { added: number; updated: number } => {
			const result = importExternalPersonas(customPersonas, data, options);
			setCustomPersonas(result.personas);
			return { added: result.added, updated: result.updated };
		},
		[customPersonas],
	);

	const createPersona = useCallback(
		(data: { name: string; prompt: string }): string => {
			const result = createNewPersona(customPersonas, data);
			setCustomPersonas(result.updatedPersonas);
			return result.newId;
		},
		[customPersonas],
	);

	const updatePersona = useCallback(
		(id: string, data: Partial<Omit<Persona, "id" | "isDefault">>) => {
			setCustomPersonas((prev) => updateExistingPersona(prev, id, data));
		},
		[],
	);

	const deletePersona = useCallback((id: string) => {
		setCustomPersonas((prev) => deleteExistingPersona(prev, id));
	}, []);

	const selectPersona = useCallback(
		(id: string) => {
			const persona = getPersona(id);
			if (!persona) return;

			setCustomPersonas((prev) => markPersonaAsUsed(prev, id));
		},
		[getPersona],
	);

	const resetPersonaToDefault = useCallback((id: string) => {
		setCustomPersonas((prev) => resetToDefaultPersona(prev, id));
	}, []);

	const setGlobalModel = useCallback((modelId: ModelId) => {
		setGlobalModelState(modelId);
	}, []);

	return useMemo(
		() => ({
			getPersona,
			getAllPersonas: getAllPersonasCallback,
			getRawCustomPersonas,
			exportCustomPersonas,
			importCustomPersonas,
			createPersona,
			updatePersona,
			deletePersona,
			selectPersona,
			resetPersonaToDefault,
			globalModel,
			setGlobalModel,
		}),
		[
			getPersona,
			getAllPersonasCallback,
			getRawCustomPersonas,
			exportCustomPersonas,
			importCustomPersonas,
			createPersona,
			updatePersona,
			deletePersona,
			selectPersona,
			resetPersonaToDefault,
			globalModel,
			setGlobalModel,
		],
	);
}
