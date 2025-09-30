import { useCallback } from "react";
import { toast } from "sonner";
import { usePersonas } from "@/hooks/use-personas";
import { clearChatHistory } from "@/lib/services/chat-history-service";
import {
	clearAllData,
	downloadJSON,
	exportAllData,
	importAllData,
	readJSONFile,
} from "@/lib/services/import-export-service";
import { clearAllPersonas } from "@/lib/services/persona-service";
import { modelStorage } from "@/lib/services/storage-service";
import type { Persona } from "@/lib/types";

/**
 * Hook for managing data import/export operations
 */
export function useDataManagement() {
	const {
		getAllPersonas,
		exportCustomPersonas,
		importCustomPersonas,
		globalModel,
	} = usePersonas();

	const handleExportAllData = useCallback(() => {
		try {
			const allPersonas = getAllPersonas();
			const data = exportAllData(allPersonas, globalModel);
			downloadJSON(data, `zaviye-backup-${new Date().toISOString()}.json`);
			toast.success("Export Successful", {
				description: "All your data has been downloaded.",
			});
		} catch (error) {
			console.error("Export failed:", error);
			toast.error("Export Failed", {
				description: "Could not export your data.",
			});
		}
	}, [getAllPersonas, globalModel]);

	const handleExportPersonas = useCallback(() => {
		try {
			const data = exportCustomPersonas();
			downloadJSON(data, `zaviye-personas-${new Date().toISOString()}.json`);
			toast.success("Personas exported");
		} catch (error) {
			console.error("Export personas failed:", error);
			toast.error("Export failed");
		}
	}, [exportCustomPersonas]);

	const handleImportAllData = useCallback(async (file: File) => {
		try {
			const data = await readJSONFile(file);
			importAllData(data);
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
	}, []);

	const handleImportPersonas = useCallback(
		async (
			file: File,
		): Promise<{
			data: Array<Omit<Persona, "icon">>;
			duplicateCount: number;
		} | null> => {
			try {
				const parsed = await readJSONFile(file);
				const parsedData = parsed as {
					personas?: Array<Omit<Persona, "icon">>;
				};
				const incoming = Array.isArray(parsed)
					? parsed
					: Array.isArray(parsedData?.personas)
						? parsedData.personas
						: null;

				if (!Array.isArray(incoming)) {
					throw new Error("Invalid personas file format");
				}

				// Check for duplicates
				const customPersonas = exportCustomPersonas();
				const duplicates = incoming.filter((p) =>
					customPersonas.some((e) => e.id === p.id),
				);

				return {
					data: incoming,
					duplicateCount: duplicates.length,
				};
			} catch (error) {
				console.error("Import personas failed:", error);
				toast.error("Import failed", {
					description: error instanceof Error ? error.message : undefined,
				});
				return null;
			}
		},
		[exportCustomPersonas],
	);

	const finalizePersonaImport = useCallback(
		(data: Array<Omit<Persona, "icon">>, overwrite: boolean) => {
			try {
				const res = importCustomPersonas(data, { overwrite });
				toast.success("Import complete", {
					description: `Added ${res.added}${overwrite ? `, updated ${res.updated}` : ""}.`,
				});
			} catch (error) {
				console.error("Merge personas failed:", error);
				toast.error("Import failed");
			}
		},
		[importCustomPersonas],
	);

	const handleClearAllHistory = useCallback(() => {
		try {
			const personas = getAllPersonas();
			personas.forEach((persona) => {
				clearChatHistory(persona.id);
			});
			toast.success("All Chat Histories Cleared", {
				description:
					"All conversations have been permanently deleted. The app will reload.",
				duration: 3000,
				onDismiss: () => window.location.reload(),
				onAutoClose: () => window.location.reload(),
			});
		} catch (error) {
			console.error("Failed to clear all histories:", error);
			toast.error("Operation Failed", {
				description: "Could not clear all chat histories.",
			});
		}
	}, [getAllPersonas]);

	const handleClearPersonaHistory = useCallback((id: string) => {
		try {
			clearChatHistory(id);
			toast.success("Chat history cleared", {
				description: `Cleared history for ${id}.`,
			});
		} catch (error) {
			console.error("Failed to delete history for", id, error);
			toast.error("Operation Failed", {
				description: "Could not delete history for persona.",
			});
		}
	}, []);

	const handleClearAllLocalData = useCallback(() => {
		try {
			clearAllData();
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
		}
	}, []);

	const handleResetDefaults = useCallback(() => {
		try {
			clearAllPersonas();
			modelStorage.clear();
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
		}
	}, []);

	return {
		handleExportAllData,
		handleExportPersonas,
		handleImportAllData,
		handleImportPersonas,
		finalizePersonaImport,
		handleClearAllHistory,
		handleClearPersonaHistory,
		handleClearAllLocalData,
		handleResetDefaults,
	};
}
