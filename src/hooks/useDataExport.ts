// Hook wrapping data export: gathers data, writes to file, opens share sheet.
// No default exports. TypeScript strict mode.

import { useAnalytics } from "@/src/contexts/AnalyticsContext";
import { useDatabaseContext } from "@/src/contexts/DatabaseContext";
import { exportToFile } from "@/src/services/data-export";
import * as Sharing from "expo-sharing";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

interface UseDataExportReturn {
	isExporting: boolean;
	handleExport: () => Promise<void>;
}

export function useDataExport(): UseDataExportReturn {
	const { db } = useDatabaseContext();
	const analytics = useAnalytics();
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = useCallback(async (): Promise<void> => {
		if (isExporting) return;
		setIsExporting(true);

		try {
			const uri = await exportToFile(db);
			await Sharing.shareAsync(uri, {
				mimeType: "application/json",
				dialogTitle: "Export Unmatch data",
				UTI: "public.json",
			});
			analytics.track({ name: "data_exported", props: {} });
		} catch {
			Alert.alert("Export failed", "Could not export data. Please try again.");
		} finally {
			setIsExporting(false);
		}
	}, [db, analytics, isExporting]);

	return { isExporting, handleExport };
}
