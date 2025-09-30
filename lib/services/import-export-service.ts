import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { exportPersonas } from "@/lib/services/persona-service";
import { storageUtils } from "@/lib/services/storage-service";
import type { Message, ModelId, Persona } from "@/lib/types";

/**
 * Service for importing and exporting application data
 */

export interface ExportData {
	globalModel: ModelId | null;
	personas: Omit<Persona, "icon">[];
	histories: Record<string, Message[]>;
}

/**
 * Export all application data
 * Returns data structure ready for JSON serialization
 */
export function exportAllData(
	allPersonas: Persona[],
	globalModel: ModelId,
): ExportData {
	const customPersonasToExport = exportPersonas();
	const histories: Record<string, Message[]> = {};

	allPersonas.forEach((persona) => {
		const historyKey = STORAGE_KEYS.chatMessages(persona.id);
		const history = localStorage.getItem(historyKey);
		if (history) {
			try {
				histories[persona.id] = JSON.parse(history);
			} catch (error) {
				console.error(`Failed to parse history for ${persona.id}:`, error);
			}
		}
	});

	return {
		globalModel,
		personas: customPersonasToExport,
		histories,
	};
}

/**
 * Import all application data from exported data
 * Validates data structure before importing
 */
export function importAllData(data: unknown): void {
	if (
		typeof data !== "object" ||
		data === null ||
		!("personas" in data) ||
		!("histories" in data)
	) {
		throw new Error("Invalid backup file format.");
	}

	const importData = data as ExportData;

	if (importData.globalModel) {
		localStorage.setItem(STORAGE_KEYS.GLOBAL_MODEL, importData.globalModel);
	}

	localStorage.setItem(
		STORAGE_KEYS.CUSTOM_PERSONAS,
		JSON.stringify(importData.personas),
	);

	Object.entries(importData.histories).forEach(([id, history]) => {
		localStorage.setItem(
			STORAGE_KEYS.chatMessages(id),
			JSON.stringify(history),
		);
		localStorage.setItem(STORAGE_KEYS.chatStarted(id), JSON.stringify(true));
	});
}

/**
 * Create a downloadable JSON file from data
 */
export function downloadJSON(data: unknown, filename: string): void {
	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * Read and parse a JSON file
 * Returns a promise that resolves with the parsed data
 */
export function readJSONFile(file: File): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const text = e.target?.result;
				if (typeof text !== "string") {
					throw new Error("Invalid file content");
				}
				const parsed = JSON.parse(text);
				resolve(parsed);
			} catch (error) {
				reject(error);
			}
		};
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsText(file);
	});
}

/**
 * Clear all application data
 */
export function clearAllData(): void {
	storageUtils.clearAll();
}
