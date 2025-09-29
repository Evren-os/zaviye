"use client";

import * as React from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePersonas } from "@/hooks/use-personas";
import type { Persona } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PersonaActions } from "./persona-actions";
import { PersonaEditor } from "./persona-editor";
import { PersonaList } from "./persona-list";

interface PersonaHubProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSelectPersona: (id: string) => void;
	activeChatId: string;
}

export function PersonaHub({
	isOpen,
	onOpenChange,
	onSelectPersona,
	activeChatId,
}: PersonaHubProps) {
	const {
		getAllPersonas,
		selectPersona,
		deletePersona,
		createPersona,
		updatePersona,
		getPersona,
		globalModel,
	} = usePersonas();
	const isMobile = useIsMobile();

	const [view, setView] = React.useState<"list" | "edit">("list");
	const [editingPersona, setEditingPersona] =
		React.useState<Partial<Persona> | null>(null);
	const [isAlertOpen, setIsAlertOpen] = React.useState(false);
	const [personaToDelete, setPersonaToDelete] = React.useState<Persona | null>(
		null,
	);

	const personas = getAllPersonas();

	const runCommand = React.useCallback(
		(command: () => void) => {
			command();
			onOpenChange(false);
		},
		[onOpenChange],
	);

	const handleSelect = (id: string) => {
		runCommand(() => {
			onSelectPersona(id);
			selectPersona(id);
		});
	};

	const handleEdit = (id: string) => {
		const persona = getPersona(id);
		if (persona) {
			setEditingPersona(persona);
			setView("edit");
		}
	};

	const handleDelete = (id: string) => {
		const persona = getPersona(id);
		if (persona && !persona.isDefault) {
			setPersonaToDelete(persona);
			setIsAlertOpen(true);
		}
	};

	const handleConfirmDelete = () => {
		if (personaToDelete) {
			const isDeletingActive = personaToDelete.id === activeChatId;
			deletePersona(personaToDelete.id);
			setIsAlertOpen(false);
			setPersonaToDelete(null);
			if (isDeletingActive) {
				onSelectPersona("glitch");
			}
		}
	};

	const handleCreate = () => {
		setEditingPersona(null);
		setView("edit");
	};

	const handleSave = (data: { name: string; prompt: string }) => {
		if (editingPersona?.id) {
			updatePersona(editingPersona.id, data);
		} else {
			const newId = createPersona(data);
			onSelectPersona(newId);
		}
		setView("list");
		setEditingPersona(null);
		onOpenChange(false);
	};

	React.useEffect(() => {
		if (!isOpen) {
			setTimeout(() => {
				setView("list");
				setEditingPersona(null);
			}, 200);
		}
	}, [isOpen]);

	return (
		<>
			<TooltipProvider delayDuration={150}>
				<Dialog open={isOpen} onOpenChange={onOpenChange}>
					<DialogContent
						showCloseButton={isMobile}
						className={cn(
							"p-0 shadow-lg overflow-hidden flex flex-col hub-radial-bg",
							isMobile
								? "h-dvh w-screen max-h-dvh max-w-full rounded-none border-none"
								: "w-[95vw] max-w-[640px] h-[70vh] max-h-[550px] rounded-lg",
						)}
						onInteractOutside={(e) => {
							if (view === "edit") e.preventDefault();
						}}
					>
						<DialogTitle className="sr-only">Persona Hub</DialogTitle>
						{view === "list" ? (
							<PersonaList
								personas={personas}
								onSelect={handleSelect}
								onEdit={handleEdit}
								onDelete={handleDelete}
								onCreate={handleCreate}
								activeChatId={activeChatId}
								onUpdatePersonaModel={(id, model) =>
									updatePersona(id, { model })
								}
							/>
						) : (
							<PersonaEditor
								persona={editingPersona}
								onSave={handleSave}
								onBack={() => setView("list")}
							/>
						)}
					</DialogContent>
				</Dialog>
			</TooltipProvider>

			<PersonaActions
				isAlertOpen={isAlertOpen}
				setIsAlertOpen={setIsAlertOpen}
				personaToDelete={personaToDelete}
				onConfirmDelete={handleConfirmDelete}
			/>
		</>
	);
}
