// Privacy and data settings screen.
// Lets users export (share sheet), import (document picker), or delete all local data.
// TypeScript strict mode.

import { colors } from "@/src/constants/theme";
import { useAnalytics } from "@/src/contexts/AnalyticsContext";
import { useDatabaseContext } from "@/src/contexts/DatabaseContext";
import { useDataExport } from "@/src/hooks/useDataExport";
import { useDataImport } from "@/src/hooks/useDataImport";
import type React from "react";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
	Button,
	Card,
	Dialog,
	Divider,
	Portal,
	Text,
} from "react-native-paper";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function deleteAllData(
	db: import("expo-sqlite").SQLiteDatabase,
): Promise<void> {
	await db.runAsync("DELETE FROM content_progress;");
	await db.runAsync("DELETE FROM urge_event;");
	await db.runAsync("DELETE FROM daily_checkin;");
	await db.runAsync("DELETE FROM progress;");
	await db.runAsync("DELETE FROM user_profile;");
	await db.runAsync("DELETE FROM subscription_state;");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PrivacyScreen(): React.ReactElement {
	const analytics = useAnalytics();
	const { db } = useDatabaseContext();

	const { isExporting, handleExport } = useDataExport();
	const {
		isImporting,
		importCounts,
		confirmVisible: importConfirmVisible,
		pickFile,
		confirmImport,
		cancelImport,
	} = useDataImport();

	const [isDeleting, setIsDeleting] = useState<boolean>(false);
	const [deleteDialogVisible, setDeleteDialogVisible] =
		useState<boolean>(false);

	const isBusy = isExporting || isImporting || isDeleting;

	// ---------------------------------------------------------------------------
	// Delete
	// ---------------------------------------------------------------------------

	const confirmDelete = useCallback((): void => {
		setDeleteDialogVisible(true);
	}, []);

	const handleDelete = useCallback(async (): Promise<void> => {
		setDeleteDialogVisible(false);
		if (isDeleting) {
			return;
		}
		setIsDeleting(true);
		try {
			await deleteAllData(db);
			analytics.track({ name: "data_deleted", props: {} });
			Alert.alert("Data deleted", "All local data has been removed.");
		} catch {
			Alert.alert("Delete failed", "Could not delete data. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	}, [db, analytics, isDeleting]);

	// ---------------------------------------------------------------------------
	// Import confirmation summary
	// ---------------------------------------------------------------------------

	function formatImportSummary(): string {
		if (!importCounts) return "";
		const parts: string[] = [];
		if (importCounts.urge_events > 0)
			parts.push(`${importCounts.urge_events} urge events`);
		if (importCounts.daily_checkins > 0)
			parts.push(`${importCounts.daily_checkins} check-ins`);
		if (importCounts.progress > 0)
			parts.push(`${importCounts.progress} progress records`);
		if (importCounts.content_progress > 0)
			parts.push(`${importCounts.content_progress} course completions`);
		if (importCounts.user_profile > 0)
			parts.push(`${importCounts.user_profile} profile`);
		if (importCounts.subscription_state > 0)
			parts.push(`${importCounts.subscription_state} subscription record`);
		return parts.length > 0 ? parts.join(", ") : "No data found in file";
	}

	// ---------------------------------------------------------------------------
	// Render
	// ---------------------------------------------------------------------------

	return (
		<>
			<ScrollView
				style={styles.root}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<Text variant="headlineMedium" style={styles.screenTitle}>
					Privacy and data
				</Text>

				<Card style={styles.infoCard} mode="contained">
					<Card.Content style={styles.infoContent}>
						<Text variant="bodyMedium" style={styles.infoText}>
							All your data is stored locally on your device.
						</Text>
						<Text variant="bodyMedium" style={styles.infoText}>
							No data is sent to any server in this version.
						</Text>
						<Divider style={styles.divider} />
						<Text variant="bodySmall" style={styles.infoNote}>
							Exports include all data (notes, amounts) as a personal backup.
							Use import to restore from a previous export.
						</Text>
					</Card.Content>
				</Card>

				<Text variant="titleMedium" style={styles.sectionTitle}>
					Your data
				</Text>

				<Card style={styles.card} mode="contained">
					<Card.Content style={styles.actionContent}>
						{/* Export */}
						<View style={styles.actionRow}>
							<View style={styles.actionText}>
								<Text variant="titleSmall" style={styles.actionTitle}>
									Export data
								</Text>
								<Text variant="bodySmall" style={styles.actionDesc}>
									Save a JSON backup via the share sheet.
								</Text>
							</View>
							<Button
								mode="outlined"
								onPress={() => {
									void handleExport();
								}}
								loading={isExporting}
								disabled={isBusy}
								style={styles.exportButton}
								textColor={colors.primary}
							>
								Export
							</Button>
						</View>

						<Divider style={styles.divider} />

						{/* Import */}
						<View style={styles.actionRow}>
							<View style={styles.actionText}>
								<Text variant="titleSmall" style={styles.actionTitle}>
									Import data
								</Text>
								<Text variant="bodySmall" style={styles.actionDesc}>
									Restore from a previous JSON backup.
								</Text>
							</View>
							<Button
								mode="outlined"
								onPress={() => {
									void pickFile();
								}}
								loading={isImporting}
								disabled={isBusy}
								style={styles.importButton}
								textColor={colors.primary}
							>
								Import
							</Button>
						</View>

						<Divider style={styles.divider} />

						{/* Delete */}
						<View style={styles.actionRow}>
							<View style={styles.actionText}>
								<Text variant="titleSmall" style={styles.deleteTitle}>
									Delete all data
								</Text>
								<Text variant="bodySmall" style={styles.actionDesc}>
									Permanently removes all local records. This cannot be undone.
								</Text>
							</View>
							<Button
								mode="outlined"
								onPress={confirmDelete}
								loading={isDeleting}
								disabled={isBusy}
								style={styles.deleteButton}
								textColor="#E05A5A"
							>
								Delete
							</Button>
						</View>
					</Card.Content>
				</Card>

				<View style={styles.bottomSpacer} />
			</ScrollView>

			{/* Delete confirmation dialog */}
			<Portal>
				<Dialog
					visible={deleteDialogVisible}
					onDismiss={() => {
						setDeleteDialogVisible(false);
					}}
					style={styles.dialog}
				>
					<Dialog.Title>
						<Text variant="titleMedium" style={styles.dialogTitle}>
							Delete all data?
						</Text>
					</Dialog.Title>
					<Dialog.Content>
						<Text variant="bodyMedium" style={styles.dialogBody}>
							This will permanently remove all your local records including
							check-ins, urge events, and progress. This action cannot be
							undone.
						</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button
							onPress={() => {
								setDeleteDialogVisible(false);
							}}
							textColor={colors.muted}
						>
							Cancel
						</Button>
						<Button
							onPress={() => {
								void handleDelete();
							}}
							textColor="#E05A5A"
						>
							Delete all
						</Button>
					</Dialog.Actions>
				</Dialog>

				{/* Import confirmation dialog */}
				<Dialog
					visible={importConfirmVisible}
					onDismiss={cancelImport}
					style={styles.dialog}
				>
					<Dialog.Title>
						<Text variant="titleMedium" style={styles.dialogTitle}>
							Import data?
						</Text>
					</Dialog.Title>
					<Dialog.Content>
						<Text variant="bodyMedium" style={styles.dialogBody}>
							This will replace all current data with the backup file. Found:
						</Text>
						<Text variant="bodyMedium" style={styles.importSummary}>
							{formatImportSummary()}
						</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={cancelImport} textColor={colors.muted}>
							Cancel
						</Button>
						<Button
							onPress={() => {
								void confirmImport();
							}}
							textColor={colors.primary}
						>
							Import
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</>
	);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: colors.background,
	},
	content: {
		paddingHorizontal: 16,
		paddingTop: 20,
		paddingBottom: 40,
		gap: 16,
	},
	screenTitle: {
		color: colors.text,
		fontWeight: "700",
	},
	infoCard: {
		backgroundColor: "#0F1D3A",
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.primary,
	},
	infoContent: {
		gap: 8,
	},
	infoText: {
		color: colors.text,
		lineHeight: 22,
	},
	infoNote: {
		color: colors.muted,
		lineHeight: 18,
	},
	divider: {
		backgroundColor: colors.border,
		marginVertical: 4,
	},
	sectionTitle: {
		color: colors.text,
		fontWeight: "600",
		marginTop: 4,
	},
	card: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
	},
	actionContent: {
		paddingVertical: 4,
	},
	actionRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 12,
		gap: 12,
	},
	actionText: {
		flex: 1,
		gap: 4,
	},
	actionTitle: {
		color: colors.text,
		fontWeight: "600",
	},
	deleteTitle: {
		color: "#E05A5A",
		fontWeight: "600",
	},
	actionDesc: {
		color: colors.muted,
		lineHeight: 18,
	},
	exportButton: {
		borderColor: colors.primary,
		flexShrink: 0,
	},
	importButton: {
		borderColor: colors.primary,
		flexShrink: 0,
	},
	deleteButton: {
		borderColor: "#E05A5A",
		flexShrink: 0,
	},
	dialog: {
		backgroundColor: colors.surface,
		borderRadius: 16,
	},
	dialogTitle: {
		color: colors.text,
		fontWeight: "700",
	},
	dialogBody: {
		color: colors.muted,
		lineHeight: 22,
	},
	importSummary: {
		color: colors.text,
		lineHeight: 22,
		marginTop: 8,
		fontWeight: "600",
	},
	bottomSpacer: {
		height: 24,
	},
});
