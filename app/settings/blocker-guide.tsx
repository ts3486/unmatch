// Blocker guide settings screen.
// Explains how to limit dating app access via iOS Screen Time and Android Digital Wellbeing.
// TypeScript strict mode.

import { colors } from "@/src/constants/theme";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Card, Divider, Text } from "react-native-paper";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BlockerGuideScreen(): React.ReactElement {
	const { t } = useTranslation();
	const iosSteps = t("blockerGuide.iosSteps", {
		returnObjects: true,
	}) as string[];
	const androidSteps = t("blockerGuide.androidSteps", {
		returnObjects: true,
	}) as string[];

	return (
		<ScrollView
			style={styles.root}
			contentContainerStyle={styles.content}
			showsVerticalScrollIndicator={false}
		>
			<Text variant="headlineMedium" style={styles.screenTitle}>
				{t("blockerGuide.title")}
			</Text>
			<Text variant="bodyMedium" style={styles.intro}>
				{t("blockerGuide.intro")}
			</Text>

			<View style={styles.disclaimerBox}>
				<Text variant="bodySmall" style={styles.disclaimerText}>
					{t("blockerGuide.disclaimer")}
				</Text>
			</View>

			<Divider style={styles.divider} />

			{Platform.OS === "ios" && (
				<>
					{/* iOS Section */}
					<Text variant="titleLarge" style={styles.platformTitle}>
						{t("blockerGuide.screenTime")}
					</Text>

					<Card style={styles.card} mode="contained">
						<Card.Content style={styles.stepsContent}>
							{iosSteps.map((step, idx) => (
								<StepRow
									key={idx}
									number={idx + 1}
									text={step}
									isLast={idx === iosSteps.length - 1}
								/>
							))}
						</Card.Content>
					</Card>

					<Divider style={styles.divider} />
				</>
			)}

			{Platform.OS === "android" && (
				<>
					{/* Android Section */}
					<Text variant="titleLarge" style={styles.platformTitle}>
						{t("blockerGuide.digitalWellbeing")}
					</Text>

					<Card style={styles.card} mode="contained">
						<Card.Content style={styles.stepsContent}>
							{androidSteps.map((step, idx) => (
								<StepRow
									key={idx}
									number={idx + 1}
									text={step}
									isLast={idx === androidSteps.length - 1}
								/>
							))}
						</Card.Content>
					</Card>

					<Divider style={styles.divider} />
				</>
			)}

			<View style={styles.tipBox}>
				<Text variant="labelMedium" style={styles.tipLabel}>
					{t("blockerGuide.tip")}
				</Text>
				<Text variant="bodyMedium" style={styles.tipText}>
					{t("blockerGuide.tipText")}
				</Text>
			</View>

			<View style={styles.bottomSpacer} />
		</ScrollView>
	);
}

// ---------------------------------------------------------------------------
// StepRow sub-component
// ---------------------------------------------------------------------------

interface StepRowProps {
	number: number;
	text: string;
	isLast: boolean;
}

function StepRow({ number, text, isLast }: StepRowProps): React.ReactElement {
	return (
		<>
			<View style={styles.stepRow}>
				<View style={styles.stepNumber}>
					<Text style={styles.stepNumberText}>{number}</Text>
				</View>
				<Text variant="bodyMedium" style={styles.stepText}>
					{text}
				</Text>
			</View>
			{!isLast && <Divider style={styles.stepDivider} />}
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
	intro: {
		color: colors.muted,
		lineHeight: 22,
	},
	disclaimerBox: {
		backgroundColor: "#1A2D4D",
		borderRadius: 10,
		padding: 12,
		borderWidth: 1,
		borderColor: colors.border,
	},
	disclaimerText: {
		color: colors.muted,
		lineHeight: 18,
	},
	divider: {
		backgroundColor: colors.border,
		marginVertical: 4,
	},
	platformTitle: {
		color: colors.text,
		fontWeight: "700",
		marginTop: 4,
	},
	card: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
	},
	stepsContent: {
		paddingVertical: 4,
	},
	stepRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 12,
		paddingVertical: 12,
	},
	stepNumber: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: colors.primary,
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
		marginTop: 1,
	},
	stepNumberText: {
		color: "#FFFFFF",
		fontSize: 12,
		fontWeight: "700",
	},
	stepText: {
		color: colors.text,
		flex: 1,
		lineHeight: 22,
	},
	stepDivider: {
		backgroundColor: colors.border,
		marginLeft: 36,
	},
	tipBox: {
		backgroundColor: "#1A2D4D",
		borderRadius: 10,
		padding: 14,
		borderWidth: 1,
		borderColor: colors.secondary,
		gap: 6,
	},
	tipLabel: {
		color: colors.secondary,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	tipText: {
		color: colors.text,
		lineHeight: 22,
	},
	bottomSpacer: {
		height: 24,
	},
});
