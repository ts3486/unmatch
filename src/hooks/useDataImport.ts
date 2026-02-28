// Hook wrapping data import: picks file, validates, confirms, imports.
// No default exports. TypeScript strict mode.

import { useAppState } from "@/src/contexts/AppStateContext";
import { useDatabaseContext } from "@/src/contexts/DatabaseContext";
import { importData, validateImportData } from "@/src/services/data-import";
import type {
	ImportEnvelope,
	ImportTableCounts,
} from "@/src/services/data-import";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

interface UseDataImportReturn {
	isImporting: boolean;
	/** Table counts from validation, shown in confirmation dialog. */
	importCounts: ImportTableCounts | null;
	/** True when the confirmation dialog should be visible. */
	confirmVisible: boolean;
	/** Initiates the document picker flow. */
	pickFile: () => Promise<void>;
	/** User confirmed import — runs the actual import. */
	confirmImport: () => Promise<void>;
	/** User cancelled the confirmation dialog. */
	cancelImport: () => void;
}

export function useDataImport(): UseDataImportReturn {
	const { db } = useDatabaseContext();
	const { refreshProgress, refreshProfile, refreshPremiumStatus } =
		useAppState();

	const [isImporting, setIsImporting] = useState(false);
	const [importCounts, setImportCounts] = useState<ImportTableCounts | null>(
		null,
	);
	const [confirmVisible, setConfirmVisible] = useState(false);
	const [pendingEnvelope, setPendingEnvelope] = useState<ImportEnvelope | null>(
		null,
	);

	const pickFile = useCallback(async (): Promise<void> => {
		if (isImporting) return;

		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: "application/json",
				copyToCacheDirectory: true,
			});

			if (result.canceled || !result.assets?.[0]) return;

			const fileUri = result.assets[0].uri;
			const content = await FileSystem.readAsStringAsync(fileUri);

			let parsed: unknown;
			try {
				parsed = JSON.parse(content);
			} catch {
				Alert.alert("Invalid file", "The selected file is not valid JSON.");
				return;
			}

			const counts = validateImportData(parsed);
			setImportCounts(counts);
			setPendingEnvelope(parsed as ImportEnvelope);
			setConfirmVisible(true);
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : "Unknown error";
			Alert.alert("Import failed", msg);
		}
	}, [isImporting]);

	const confirmImport = useCallback(async (): Promise<void> => {
		if (!pendingEnvelope) return;
		setConfirmVisible(false);
		setIsImporting(true);

		try {
			await importData(db, pendingEnvelope);
			await Promise.all([
				refreshProfile(),
				refreshProgress(),
				refreshPremiumStatus(),
			]);
			Alert.alert("Import complete", "Your data has been restored.");
		} catch {
			Alert.alert(
				"Import failed",
				"Could not import data. Your previous data is unchanged.",
			);
		} finally {
			setIsImporting(false);
			setPendingEnvelope(null);
			setImportCounts(null);
		}
	}, [
		db,
		pendingEnvelope,
		refreshProfile,
		refreshProgress,
		refreshPremiumStatus,
	]);

	const cancelImport = useCallback((): void => {
		setConfirmVisible(false);
		setPendingEnvelope(null);
		setImportCounts(null);
	}, []);

	return {
		isImporting,
		importCounts,
		confirmVisible,
		pickFile,
		confirmImport,
		cancelImport,
	};
}
