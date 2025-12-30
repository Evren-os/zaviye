"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePersonaHub } from "@/hooks/use-persona-hub";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "./error-boundary";
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
	const isMobile = useIsMobile();
	const {
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
	} = usePersonaHub(activeChatId, onSelectPersona, () => onOpenChange(false));

	// Reset state when dialog closes
	useEffect(() => {
		if (!isOpen) {
			setTimeout(resetState, 200);
		}
	}, [isOpen, resetState]);

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
						<ErrorBoundary>
							{view === "list" ? (
								<PersonaList
									personas={personas}
									onSelect={handleSelect}
									onEdit={handleEdit}
									onDelete={handleDelete}
									onCreate={handleCreate}
									onUpdatePersonaModel={handleUpdatePersonaModel}
								/>
							) : (
								<PersonaEditor
									persona={editingPersona}
									onSave={handleSave}
									onBack={handleBack}
								/>
							)}
						</ErrorBoundary>
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
