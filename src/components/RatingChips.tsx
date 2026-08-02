// RatingChips — shared rating chip row component.
// Used by both InlineCheckin and the full checkin screen.
// TypeScript strict mode.

import { colors } from "@/src/constants/theme";
import type React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Chip, Text } from "react-native-paper";

// ---------------------------------------------------------------------------
// Label maps — translated, memoized per render
// ---------------------------------------------------------------------------

export function useMoodLabels(): Record<number, string> {
	const { t } = useTranslation();
	return useMemo(
		() => ({
			1: t("ratingChips.mood.1"),
			2: t("ratingChips.mood.2"),
			3: t("ratingChips.mood.3"),
			4: t("ratingChips.mood.4"),
			5: t("ratingChips.mood.5"),
		}),
		[t],
	);
}

export function useFatigueLabels(): Record<number, string> {
	const { t } = useTranslation();
	return useMemo(
		() => ({
			1: t("ratingChips.fatigue.1"),
			2: t("ratingChips.fatigue.2"),
			3: t("ratingChips.fatigue.3"),
			4: t("ratingChips.fatigue.4"),
			5: t("ratingChips.fatigue.5"),
		}),
		[t],
	);
}

export function useUrgeLabels(): Record<number, string> {
	const { t } = useTranslation();
	return useMemo(
		() => ({
			1: t("ratingChips.urge.1"),
			2: t("ratingChips.urge.2"),
			3: t("ratingChips.urge.3"),
			4: t("ratingChips.urge.4"),
			5: t("ratingChips.urge.5"),
		}),
		[t],
	);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface RatingChipsProps {
	label: string;
	value: number;
	onChange: (v: number) => void;
	readonly?: boolean;
	labelMap?: Record<number, string>;
	subtitle?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RatingChips({
	label,
	value,
	onChange,
	readonly = false,
	labelMap,
	subtitle,
}: RatingChipsProps): React.ReactElement {
	return (
		<View style={styles.ratingRow}>
			<Text variant="labelLarge" style={styles.ratingLabel}>
				{label}
			</Text>
			{subtitle !== undefined && (
				<Text variant="bodySmall" style={styles.ratingSubtitle}>
					{subtitle}
				</Text>
			)}
			<View style={styles.chipRow}>
				{[1, 2, 3, 4, 5].map((n) => (
					<Chip
						key={n}
						selected={value === n}
						onPress={
							readonly
								? undefined
								: () => {
										onChange(n);
									}
						}
						style={[
							styles.ratingChip,
							labelMap !== undefined && styles.ratingChipWide,
							value === n && styles.ratingChipSelected,
							readonly && styles.ratingChipReadonly,
						]}
						textStyle={[
							styles.ratingChipText,
							value === n && styles.ratingChipTextSelected,
						]}
						compact
					>
						{labelMap !== undefined ? labelMap[n] : String(n)}
					</Chip>
				))}
			</View>
		</View>
	);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
	ratingRow: {
		paddingVertical: 12,
		gap: 10,
	},
	ratingLabel: {
		color: colors.text,
		fontWeight: "500",
	},
	ratingSubtitle: {
		color: colors.muted,
		marginTop: -6,
		marginBottom: 4,
	},
	chipRow: {
		flexDirection: "row",
		gap: 8,
		flexWrap: "wrap",
	},
	ratingChip: {
		backgroundColor: colors.background,
		borderColor: colors.border,
		borderWidth: 1,
		minWidth: 44,
	},
	ratingChipWide: {
		paddingHorizontal: 4,
	},
	ratingChipSelected: {
		backgroundColor: "#0F1D3A",
		borderColor: colors.primary,
	},
	ratingChipReadonly: {
		opacity: 0.8,
	},
	ratingChipText: {
		color: colors.muted,
	},
	ratingChipTextSelected: {
		color: colors.text,
		fontWeight: "600",
	},
});
