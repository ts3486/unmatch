// CheckinOverlay — full-screen daily check-in overlay.
// Covers the tab content area (tab bar remains visible).
// Auto-dismisses on successful save.
// TypeScript strict mode.

import {
	RatingChips,
	useFatigueLabels,
	useMoodLabels,
	useUrgeLabels,
} from "@/src/components/RatingChips";
import { colors } from "@/src/constants/theme";
import type { UseCheckinReturn } from "@/src/hooks/useCheckin";
import { router } from "expo-router";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import {
	Button,
	Chip,
	Divider,
	IconButton,
	Text,
	TextInput,
} from "react-native-paper";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CheckinOverlayProps {
	checkin: UseCheckinReturn;
	onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CheckinOverlay({
	checkin,
	onClose,
}: CheckinOverlayProps): React.ReactElement {
	const { t } = useTranslation();
	const moodLabels = useMoodLabels();
	const fatigueLabels = useFatigueLabels();
	const urgeLabels = useUrgeLabels();
	const appOpensLabels = useMemo(
		() => ({
			1: t("checkin.appOpensLabels.1"),
			2: t("checkin.appOpensLabels.2"),
			3: t("checkin.appOpensLabels.3"),
			4: t("checkin.appOpensLabels.4"),
			5: t("checkin.appOpensLabels.5"),
		}),
		[t],
	);
	const {
		mood,
		fatigue,
		urge,
		openedAtNight,
		spentToday,
		spentAmount,
		isComplete,
		isSubmitting,
		setMood,
		setFatigue,
		setUrge,
		setOpenedAtNight,
		setSpentToday,
		setSpentAmount,
		submit,
	} = checkin;

	// Local state for app opens frequency (1-5 scale).
	const [appOpens, setAppOpens] = useState(1);

	// Map openedAtNight boolean to the rating: true = opened (default 3), false = none (1).
	useEffect(() => {
		if (openedAtNight === true) {
			setAppOpens(3);
		} else if (openedAtNight === false) {
			setAppOpens(1);
		}
	}, [openedAtNight]);

	const handleAppOpensChange = useCallback(
		(v: number) => {
			setAppOpens(v);
			setOpenedAtNight(v > 1);
		},
		[setOpenedAtNight],
	);

	// Local string for spend amount input.
	const [spendAmountText, setSpendAmountText] = useState(
		spentAmount !== null ? String(spentAmount) : "",
	);

	const wasComplete = useRef(isComplete);

	// Auto-dismiss when save completes.
	useEffect(() => {
		if (isComplete && !wasComplete.current) {
			onClose();
		}
		wasComplete.current = isComplete;
	}, [isComplete, onClose]);

	const handleSave = useCallback((): void => {
		void submit();
	}, [submit]);

	const handleDetails = useCallback((): void => {
		onClose();
		router.push("/checkin");
	}, [onClose]);

	return (
		<View style={styles.overlay}>
			{/* Header */}
			<View style={styles.header}>
				<View style={styles.headerLeft}>
					<View>
						<Text variant="titleLarge" style={styles.title}>
							{t("checkin.title")}
						</Text>
						<Text variant="bodyMedium" style={styles.subtitle}>
							{t("checkin.howAreYouToday")}
						</Text>
					</View>
				</View>
				<IconButton
					icon="close"
					iconColor={colors.muted}
					size={24}
					onPress={onClose}
				/>
			</View>

			{/* Content */}
			<ScrollView
				style={styles.content}
				contentContainerStyle={styles.contentScroll}
				showsVerticalScrollIndicator={false}
			>
				<RatingChips
					label={t("checkin.mood")}
					value={mood}
					onChange={setMood}
					labelMap={moodLabels}
				/>
				<Divider style={styles.divider} />
				<RatingChips
					label={t("checkin.fatigue")}
					value={fatigue}
					onChange={setFatigue}
					labelMap={fatigueLabels}
				/>
				<Divider style={styles.divider} />
				<RatingChips
					label={t("checkin.urgeLevel")}
					value={urge}
					onChange={setUrge}
					labelMap={urgeLabels}
				/>
				<Divider style={styles.divider} />

				{/* App opens frequency */}
				<RatingChips
					label={t("checkin.appOpens")}
					value={appOpens}
					onChange={handleAppOpensChange}
					labelMap={appOpensLabels}
				/>
				<Divider style={styles.divider} />

				{/* Spending */}
				<View style={styles.spendSection}>
					<Text variant="labelLarge" style={styles.spendLabel}>
						{t("checkin.spentOnApps")}
					</Text>
					<View style={styles.spendChipRow}>
						<Chip
							selected={spentToday === false}
							onPress={() => {
								setSpentToday(false);
								setSpentAmount(0);
								setSpendAmountText("");
							}}
							style={[
								styles.spendChip,
								spentToday === false && styles.spendChipSelected,
							]}
							textStyle={[
								styles.spendChipText,
								spentToday === false && styles.spendChipTextSelected,
							]}
							compact
						>
							{t("checkin.nothing")}
						</Chip>
						<Chip
							selected={spentToday === true}
							onPress={() => setSpentToday(true)}
							style={[
								styles.spendChip,
								spentToday === true && styles.spendChipSelected,
							]}
							textStyle={[
								styles.spendChipText,
								spentToday === true && styles.spendChipTextSelected,
							]}
							compact
						>
							{t("common.yes")}
						</Chip>
					</View>
					{spentToday === true && (
						<TextInput
							mode="outlined"
							label={t("checkin.amount")}
							value={spendAmountText}
							onChangeText={(text) => {
								setSpendAmountText(text);
								const num = Number.parseFloat(text);
								if (!Number.isNaN(num) && num >= 0) {
									setSpentAmount(num);
								}
							}}
							keyboardType="numeric"
							style={styles.spendInput}
							outlineColor={colors.border}
							activeOutlineColor={colors.primary}
							textColor={colors.text}
							theme={{
								colors: {
									onSurfaceVariant: colors.muted,
									surfaceVariant: colors.surface,
								},
							}}
						/>
					)}
				</View>
			</ScrollView>

			{/* Footer actions */}
			<View style={styles.footer}>
				<Button
					mode="contained"
					onPress={handleSave}
					loading={isSubmitting}
					disabled={isSubmitting}
					style={styles.saveButton}
					contentStyle={styles.saveButtonContent}
					labelStyle={styles.saveButtonLabel}
				>
					{t("checkin.saveShort")}
				</Button>
				<Text
					variant="labelMedium"
					style={styles.detailsLink}
					onPress={handleDetails}
				>
					{t("checkin.addDetails")}
				</Text>
			</View>
		</View>
	);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: colors.background,
		paddingTop: 56,
		paddingHorizontal: 20,
		zIndex: 10,
	},
	header: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		flex: 1,
	},
	title: {
		color: colors.text,
		fontWeight: "700",
	},
	subtitle: {
		color: colors.muted,
		marginTop: 2,
	},
	content: {
		flex: 1,
		paddingTop: 8,
	},
	contentScroll: {
		paddingBottom: 16,
	},
	divider: {
		backgroundColor: colors.border,
	},
	spendSection: {
		gap: 10,
		paddingVertical: 8,
	},
	spendLabel: {
		color: colors.text,
		fontWeight: "600",
	},
	spendChipRow: {
		flexDirection: "row",
		gap: 8,
	},
	spendChip: {
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
	},
	spendChipSelected: {
		backgroundColor: "#1A3366",
		borderColor: colors.primary,
	},
	spendChipText: {
		color: colors.muted,
	},
	spendChipTextSelected: {
		color: colors.primary,
	},
	spendInput: {
		backgroundColor: colors.surface,
		marginTop: 4,
	},
	footer: {
		paddingBottom: 24,
	},
	saveButton: {
		borderRadius: 14,
	},
	saveButtonContent: {
		paddingVertical: 8,
	},
	saveButtonLabel: {
		fontSize: 16,
		fontWeight: "700",
		letterSpacing: 0.3,
	},
	detailsLink: {
		color: colors.secondary,
		textAlign: "center",
		marginTop: 14,
		paddingVertical: 4,
	},
});
