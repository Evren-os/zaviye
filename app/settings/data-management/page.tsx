"use client";

import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
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
import { usePersonas } from "@/hooks/use-personas";
import type { Message, Persona } from "@/lib/types";

const SettingItem = ({
	title,
	description,
	control,
	isDestructive = false,
}: {
	title: string;
	description: string;
	control: React.ReactNode;
	isDestructive?: boolean;
}) => (
	<div className="flex items-center justify-between p-4">
		<div className="space-y-0.5">
			<p className={`font-medium ${isDestructive ? "text-destructive" : ""}`}>
				{title}
			</p>
			<p className="text-sm text-muted-foreground">{description}</p>
		</div>
		<div className="flex-shrink-0">{control}</div>
	</div>
);

export default function DataManagementPage() {
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [isClearAllDataOpen, setIsClearAllDataOpen] = useState(false);
	const [isResetDefaultsOpen, setIsResetDefaultsOpen] = useState(false);
	const [isImportDupOpen, setIsImportDupOpen] = useState(false);
	const [pendingImportData, setPendingImportData] = useState<Array<
		Omit<Persona, "icon">
	> | null>(null);
	const [duplicateCount, setDuplicateCount] = useState(0);

	const {
		getAllPersonas,
		getRawCustomPersonas,
		globalModel,
		exportCustomPersonas,
		importCustomPersonas,
	} = usePersonas();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const personaFileInputRef = useRef<HTMLInputElement>(null);

	const handleExportAllData = () => {
		try {
			const allPersonas = getAllPersonas();
			const customPersonasToExport = getRawCustomPersonas();
			const histories: Record<string, Message[]> = {};

			allPersonas.forEach((persona) => {
				const history = localStorage.getItem(`zaviye-${persona.id}-messages`);
				if (history) {
					histories[persona.id] = JSON.parse(history);
				}
			});

			const dataToExport = {
				globalModel,
				personas: customPersonasToExport,
				histories,
			};
			const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `zaviye-backup-${new Date().toISOString()}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			toast.success("Export Successful", {
				description: "All your data has been downloaded.",
			});
		} catch (error) {
			console.error("Export failed:", error);
			toast.error("Export Failed", {
				description: "Could not export your data.",
			});
		}
	};

	const handleExportPersonas = () => {
		try {
			const data = exportCustomPersonas();
			const blob = new Blob([JSON.stringify(data, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `zaviye-personas-${new Date().toISOString()}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			toast.success("Personas exported");
		} catch (error) {
			console.error("Export personas failed:", error);
			toast.error("Export failed");
		}
	};

	const handleImportPersonasClick = () => {
		personaFileInputRef.current?.click();
	};

	const handlePersonaFileChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const text = e.target?.result;
				if (typeof text !== "string") throw new Error("Invalid file content");
				const parsed = JSON.parse(text);
				const incoming = Array.isArray(parsed)
					? parsed
					: Array.isArray(parsed?.personas)
						? parsed.personas
						: null;
				if (!Array.isArray(incoming))
					throw new Error("Invalid personas file format");

				const existing = getRawCustomPersonas();
				const dup = incoming.filter((p: any) =>
					existing.some((e) => e.id === p.id),
				).length;
				setPendingImportData(incoming);
				setDuplicateCount(dup);
				if (dup > 0) {
					setIsImportDupOpen(true);
				} else {
					const res = importCustomPersonas(incoming as any, {
						overwrite: false,
					});
					toast.success("Import complete", {
						description: `Added ${res.added}.`,
					});
				}
				event.target.value = "";
			} catch (error) {
				console.error("Import personas failed:", error);
				toast.error("Import failed", {
					description: error instanceof Error ? error.message : undefined,
				});
			}
		};
		reader.readAsText(file);
	};

	const finalizePersonaImport = (overwrite: boolean) => {
		if (!pendingImportData) return;
		try {
			const res = importCustomPersonas(pendingImportData as any, { overwrite });
			toast.success("Import complete", {
				description: `Added ${res.added}${overwrite ? `, updated ${res.updated}` : ""}.`,
			});
		} catch (error) {
			console.error("Merge personas failed:", error);
			toast.error("Import failed");
		} finally {
			setIsImportDupOpen(false);
			setPendingImportData(null);
			setDuplicateCount(0);
		}
	};

	const handleClearAllLocalData = () => {
		setIsClearAllDataOpen(true);
	};

	const confirmClearAllLocalData = () => {
		try {
			const keysToRemove: string[] = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith("zaviye-")) keysToRemove.push(key);
			}
			keysToRemove.forEach((k) => localStorage.removeItem(k));
			toast.success("Cleared all local data", {
				description: "The app will now reload.",
				duration: 2500,
				onDismiss: () => window.location.reload(),
				onAutoClose: () => window.location.reload(),
			});
		} catch (error) {
			console.error("Failed to clear all local data:", error);
			toast.error("Operation Failed", {
				description: "Could not clear local data.",
			});
		} finally {
			setIsClearAllDataOpen(false);
		}
	};

	const handleResetDefaults = () => setIsResetDefaultsOpen(true);

	const confirmResetDefaults = () => {
		try {
			localStorage.removeItem("zaviye-custom-personas");
			localStorage.removeItem("zaviye-global-model");
			toast.success("Defaults restored", {
				description: "Default personas and model restored. Reloading...",
				duration: 2500,
				onDismiss: () => window.location.reload(),
				onAutoClose: () => window.location.reload(),
			});
		} catch (error) {
			console.error("Failed to reset defaults:", error);
			toast.error("Operation Failed", {
				description: "Could not reset defaults.",
			});
		} finally {
			setIsResetDefaultsOpen(false);
		}
	};

	const handleDeletePersonaHistory = (id: string) => {
		try {
			localStorage.removeItem(`zaviye-${id}-messages`);
			localStorage.removeItem(`zaviye-${id}-started`);
			toast.success("Chat history cleared", {
				description: `Cleared history for ${id}.`,
			});
		} catch (error) {
			console.error("Failed to delete history for", id, error);
			toast.error("Operation Failed", {
				description: "Could not delete history for persona.",
			});
		}
	};

	const handleImportClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const text = e.target?.result;
				if (typeof text !== "string") throw new Error("Invalid file content");

				const data = JSON.parse(text);
				if (!data.personas || !data.histories) {
					throw new Error("Invalid backup file format.");
				}

				if (data.globalModel) {
					localStorage.setItem("zaviye-global-model", data.globalModel);
				}
				localStorage.setItem(
					"zaviye-custom-personas",
					JSON.stringify(data.personas),
				);
				Object.entries(data.histories).forEach(([id, history]) => {
					localStorage.setItem(
						`zaviye-${id}-messages`,
						JSON.stringify(history),
					);
					localStorage.setItem(`zaviye-${id}-started`, "true");
				});

				toast.success("Import Successful", {
					description: "Your data has been restored. The app will now reload.",
					duration: 3000,
					onDismiss: () => window.location.reload(),
					onAutoClose: () => window.location.reload(),
				});
			} catch (error) {
				console.error("Import failed:", error);
				toast.error("Import Failed", {
					description:
						error instanceof Error ? error.message : "Could not import data.",
				});
			}
		};
		reader.readAsText(file);
	};

	const handleConfirmClearAllHistory = () => {
		try {
			const personas = getAllPersonas();
			personas.forEach((persona) => {
				localStorage.removeItem(`zaviye-${persona.id}-messages`);
				localStorage.removeItem(`zaviye-${persona.id}-started`);
			});
			toast.success("All Chat Histories Cleared", {
				description:
					"All conversations have been permanently deleted. The app will reload.",
				duration: 3000,
				onDismiss: () => window.location.reload(),
				onAutoClose: () => window.location.reload(),
			});
			setIsAlertOpen(false);
		} catch (error) {
			console.error("Failed to clear all histories:", error);
			toast.error("Operation Failed", {
				description: "Could not clear all chat histories.",
			});
		}
	};

	return (
		<>
			<div className="space-y-6">
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
								<>
									<input
										type="file"
										ref={fileInputRef}
										onChange={handleFileChange}
										accept=".json"
										className="hidden"
									/>
									<Button
										variant="outline"
										size="sm"
										onClick={handleImportClick}
									>
										Import
									</Button>
								</>
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
								<>
									<input
										type="file"
										ref={personaFileInputRef}
										onChange={handlePersonaFileChange}
										accept=".json"
										className="hidden"
									/>
									<Button
										variant="outline"
										size="sm"
										onClick={handleImportPersonasClick}
									>
										Import
									</Button>
								</>
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
									onClick={handleClearAllLocalData}
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
									onClick={handleResetDefaults}
								>
									Reset
								</Button>
							}
						/>
					</CardContent>
				</Card>

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
									onClick={() => handleDeletePersonaHistory(persona.id)}
								>
									Delete History
								</Button>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

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
							onClick={handleConfirmClearAllHistory}
						>
							Yes
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

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
							onClick={confirmClearAllLocalData}
						>
							Clear
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

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
						<AlertDialogAction onClick={() => finalizePersonaImport(false)}>
							Merge (keep existing)
						</AlertDialogAction>
						<AlertDialogAction onClick={() => finalizePersonaImport(true)}>
							Overwrite duplicates
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
