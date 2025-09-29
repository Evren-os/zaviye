"use client";

import React from "react";
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
import type { Persona } from "@/lib/types";

interface PersonaActionsProps {
	isAlertOpen: boolean;
	setIsAlertOpen: (open: boolean) => void;
	personaToDelete: Persona | null;
	onConfirmDelete: () => void;
}

const PersonaActionsComponent = React.memo(function PersonaActions({
	isAlertOpen,
	setIsAlertOpen,
	personaToDelete,
	onConfirmDelete,
}: PersonaActionsProps) {
	return (
		<AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently delete the &apos;{personaToDelete?.name}&apos;
						persona. This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction variant="destructive" onClick={onConfirmDelete}>
						Yes
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
});

export { PersonaActionsComponent as PersonaActions };
