import { useCallback, useState } from "react";
import { usePersonas } from "@/hooks/use-personas";
import type { ModelId, Persona } from "@/lib/types";

/**
 * Hook for managing persona hub state and operations
 */
export function usePersonaHub(
	activeChatId: string,
	onSelectPersona: (id: string) => void,
	onClose: () => void,
) {
	const {
		getAllPersonas,
		selectPersona,
		deletePersona,
		createPersona,
		updatePersona,
		getPersona,
	} = usePersonas();

	const [view, setView] = useState<"list" | "edit">("list");
	const [editingPersona, setEditingPersona] = useState<Partial<Persona> | null>(
		null,
	);
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null);

	const personas = getAllPersonas();

	const runCommandAndClose = useCallback(
		(command: () => void) => {
			command();
			onClose();
		},
		[onClose],
	);

	const handleSelect = useCallback(
		(id: string) => {
			runCommandAndClose(() => {
				onSelectPersona(id);
				selectPersona(id);
			});
		},
		[runCommandAndClose, onSelectPersona, selectPersona],
	);

	const handleEdit = useCallback(
		(id: string) => {
			const persona = getPersona(id);
			if (persona) {
				setEditingPersona(persona);
				setView("edit");
			}
		},
		[getPersona],
	);

	const handleDelete = useCallback(
		(id: string) => {
			const persona = getPersona(id);
			if (persona && !persona.isDefault) {
				setPersonaToDelete(persona);
				setIsAlertOpen(true);
			}
		},
		[getPersona],
	);

	const handleConfirmDelete = useCallback(() => {
		if (personaToDelete) {
			const isDeletingActive = personaToDelete.id === activeChatId;
			deletePersona(personaToDelete.id);
			setIsAlertOpen(false);
			setPersonaToDelete(null);
			if (isDeletingActive) {
				onSelectPersona("glitch");
			}
		}
	}, [personaToDelete, activeChatId, deletePersona, onSelectPersona]);

	const handleCreate = useCallback(() => {
		setEditingPersona(null);
		setView("edit");
	}, []);

	const handleSave = useCallback(
		(data: { name: string; prompt: string }) => {
			if (editingPersona?.id) {
				updatePersona(editingPersona.id, data);
			} else {
				const newId = createPersona(data);
				onSelectPersona(newId);
			}
			setView("list");
			setEditingPersona(null);
			onClose();
		},
		[editingPersona, updatePersona, createPersona, onSelectPersona, onClose],
	);

	const handleBack = useCallback(() => {
		setView("list");
	}, []);

	const handleUpdatePersonaModel = useCallback(
		(id: string, model: ModelId | undefined) => {
			updatePersona(id, { model });
		},
		[updatePersona],
	);

	const resetState = useCallback(() => {
		setView("list");
		setEditingPersona(null);
	}, []);

	return {
		view,
		editingPersona,
		personas,
		isAlertOpen,
		setIsAlertOpen,
		personaToDelete,
		handleSelect,
		handleEdit,
		handleDelete,
		handleConfirmDelete,
		handleCreate,
		handleSave,
		handleBack,
		handleUpdatePersonaModel,
		resetState,
	};
}
