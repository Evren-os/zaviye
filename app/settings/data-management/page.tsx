"use client";

import { useState } from "react";
import { FileImportButton } from "@/components/settings/file-import-button";
import { SettingItem } from "@/components/settings/setting-item";
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
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useDataManagement } from "@/hooks/use-data-management";
import { usePersonas } from "@/hooks/use-personas";
import type { Persona } from "@/lib/types";

export default function DataManagementPage() {
	const { getAllPersonas } = usePersonas();
	const {
		handleExportAllData,
		handleExportPersonas,
		handleImportAllData,
		handleImportPersonas,
		finalizePersonaImport,
		handleClearAllHistory,
		handleClearPersonaHistory,
		handleClearAllLocalData,
		handleResetDefaults,
	} = useDataManagement();

	// Dialog states
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [isClearAllDataOpen, setIsClearAllDataOpen] = useState(false);
	const [isResetDefaultsOpen, setIsResetDefaultsOpen] = useState(false);
	const [isImportDupOpen, setIsImportDupOpen] = useState(false);
	const [pendingImportData, setPendingImportData] = useState<Array<
		Omit<Persona, "icon">
	> | null>(null);
	const [duplicateCount, setDuplicateCount] = useState(0);

	// Handlers
	const onImportAllData = (file: File) => {
		handleImportAllData(file);
	};

	const onImportPersonas = async (file: File) => {
		const result = await handleImportPersonas(file);
		if (result) {
			setPendingImportData(result.data);
			setDuplicateCount(result.duplicateCount);
			if (result.duplicateCount > 0) {
				setIsImportDupOpen(true);
			}
		}
	};

	const confirmFinalizePersonaImport = (overwrite: boolean) => {
		if (pendingImportData) {
			finalizePersonaImport(pendingImportData, overwrite);
		}
		setIsImportDupOpen(false);
		setPendingImportData(null);
		setDuplicateCount(0);
	};

	const confirmClearAllHistory = () => {
		handleClearAllHistory();
		setIsAlertOpen(false);
	};

	const confirmClearAllData = () => {
		handleClearAllLocalData();
		setIsClearAllDataOpen(false);
	};

	const confirmResetDefaults = () => {
		handleResetDefaults();
		setIsResetDefaultsOpen(false);
	};

	return (
		<>
			<div className="space-y-6">
				{/* Main Data Management Card */}
				<Card>
					<CardHeader>
						<CardTitle>Data Management</CardTitle>
						<CardDescription>
							Manage your application data. Actions here affect all personas.
						</CardDescription>
					</CardHeader>
					<CardContent className="divide-y divide-border p-0">
						<SettingItem
							title="Export All Zaviye Data"
							description="Download a single JSON file with all your data."
							control={
								<Button
									variant="outline"
									size="sm"
									onClick={handleExportAllData}
								>
									Export
								</Button>
							}
						/>
						<SettingItem
							title="Import Zaviye Data"
							description="Restore data from a backup file."
							control={
								<FileImportButton onFileSelect={onImportAllData}>
									Import
								</FileImportButton>
							}
						/>
						<SettingItem
							title="Export Personas Only"
							description="Download your custom personas as JSON."
							control={
								<Button
									variant="outline"
									size="sm"
									onClick={handleExportPersonas}
								>
									Export
								</Button>
							}
						/>
						<SettingItem
							title="Import Personas Only"
							description="Merge or overwrite custom personas from a file."
							control={
								<FileImportButton onFileSelect={onImportPersonas}>
									Import
								</FileImportButton>
							}
						/>
						<SettingItem
							title="Delete All Chat Histories"
							description="Permanently delete all conversation data."
							isDestructive
							control={
								<Button
									variant="destructive"
									size="sm"
									onClick={() => setIsAlertOpen(true)}
								>
									Delete
								</Button>
							}
						/>
						<SettingItem
							title="Clear All Local Data"
							description="Remove all Zaviye data from this browser and reload."
							isDestructive
							control={
								<Button
									variant="destructive"
									size="sm"
									onClick={() => setIsClearAllDataOpen(true)}
								>
									Clear
								</Button>
							}
						/>
						<SettingItem
							title="Reset Defaults"
							description="Restore default personas and default model. (Chat histories remain)"
							isDestructive
							control={
								<Button
									variant="destructive"
									size="sm"
									onClick={() => setIsResetDefaultsOpen(true)}
								>
									Reset
								</Button>
							}
						/>
					</CardContent>
				</Card>

				{/* Per-Persona History Card */}
				<Card>
					<CardHeader>
						<CardTitle>Per-Persona Chat History</CardTitle>
						<CardDescription>
							Delete chat history for a specific persona.
						</CardDescription>
					</CardHeader>
					<CardContent className="p-0 divide-y divide-border">
						{getAllPersonas().map((persona) => (
							<div
								key={persona.id}
								className="flex items-center justify-between p-4"
							>
								<div className="space-y-0.5">
									<p className="font-medium">{persona.name}</p>
									<p className="text-xs text-muted-foreground">
										ID: {persona.id}
									</p>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleClearPersonaHistory(persona.id)}
								>
									Delete History
								</Button>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			{/* Clear All History Dialog */}
			<AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will wipe the chat history for ALL personas. This action
							cannot be undone and will reload the application.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={confirmClearAllHistory}
						>
							Yes
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Clear All Data Dialog */}
			<AlertDialog
				open={isClearAllDataOpen}
				onOpenChange={setIsClearAllDataOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Clear all local data?</AlertDialogTitle>
						<AlertDialogDescription>
							This will remove all Zaviye data stored in your browser (personas,
							settings, and histories) and reload the app.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={confirmClearAllData}
						>
							Clear
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Reset Defaults Dialog */}
			<AlertDialog
				open={isResetDefaultsOpen}
				onOpenChange={setIsResetDefaultsOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Reset defaults?</AlertDialogTitle>
						<AlertDialogDescription>
							This will remove all custom personas and restore the default
							model. Chat histories will remain intact.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={confirmResetDefaults}
						>
							Reset
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Import Duplicates Dialog */}
			<AlertDialog open={isImportDupOpen} onOpenChange={setIsImportDupOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Overwrite duplicate personas?</AlertDialogTitle>
						<AlertDialogDescription>
							{duplicateCount} duplicate{duplicateCount === 1 ? "" : "s"}{" "}
							detected by id. Merge to keep existing, or overwrite to replace
							duplicates.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setPendingImportData(null)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => confirmFinalizePersonaImport(false)}
						>
							Merge (keep existing)
						</AlertDialogAction>
						<AlertDialogAction
							onClick={() => confirmFinalizePersonaImport(true)}
						>
							Overwrite duplicates
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
