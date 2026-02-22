// Home tab screen.
// Shows Life Tree hero, streak + resist stats, today's course card, and Reset CTA.
// Phase 2A: display-size stat numbers with bolder weight + letter-spacing.
// Phase 4B: LifeTree + StatCards pulled out of ScrollView into fixed hero section.
// TypeScript strict mode.

import React, { useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Card, Chip, Surface, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppState } from '@/src/contexts/AppStateContext';
import { useContent } from '@/src/hooks/useContent';
import { useCheckin } from '@/src/hooks/useCheckin';
import { LifeTree } from '@/src/components/LifeTree';
import { colors } from '@/src/constants/theme';
import { UnswipeLogo } from '@/src/components/UnswipeLogo';
import { getCatalog } from '@/src/data/seed-loader';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HomeScreen(): React.ReactElement {
  const {
    streak,
    treeLevel,
    resistCount,
    todaySuccess,
    userProfile,
    isLoading,
  } = useAppState();

  const { allContent, currentDayIndex, isLoading: contentLoading } =
    useContent(userProfile?.created_at ?? null);

  const { isComplete: checkinComplete } = useCheckin();

  const catalog = getCatalog();
  const resetCtaLabel = catalog.copy['panicCta'] ?? 'Reset now';

  // Today's content card (day_index matches current day in the course).
  const todayContent = allContent.find((c) => c.day_index === currentDayIndex) ?? null;

  const handleResetPress = useCallback((): void => {
    router.push('/(tabs)/panic');
  }, []);

  const handleCheckinPress = useCallback((): void => {
    router.push('/checkin');
  }, []);

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading...
        </Text>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <View style={styles.root}>
      {/* Hero section — fixed above the scroll, not part of ScrollView */}
      <View style={styles.heroSection}>
        <LifeTree level={treeLevel} resistCount={resistCount} />
        <View style={styles.statsRow}>
          {/* Phase 2A: streak uses primary color */}
          <StatCard
            value={streak}
            label={streak === 1 ? 'day streak' : 'day streak'}
            valueColor={colors.primary}
          />
          {/* Phase 2A: resist count uses success color */}
          <StatCard
            value={resistCount}
            label={resistCount === 1 ? 'resist' : 'resists'}
            valueColor={colors.success}
          />
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <UnswipeLogo markSize={28} layout="horizontal" />
          {todaySuccess && (
            <Chip
              compact
              style={styles.successChip}
              textStyle={styles.successChipText}
            >
              Today done
            </Chip>
          )}
        </View>

        {/* Daily check-in card */}
        <TouchableOpacity
          onPress={handleCheckinPress}
          accessibilityLabel="Daily check-in"
          accessibilityHint="Open the daily self-reflection form"
        >
          <Surface style={[styles.checkinCard, checkinComplete && styles.checkinCardDone]}>
            <View style={styles.checkinCardInner}>
              <MaterialCommunityIcons
                name={checkinComplete ? 'check-circle' : 'clipboard-text-outline'}
                size={22}
                color={checkinComplete ? colors.success : colors.primary}
              />
              <View style={styles.checkinCardText}>
                <Text variant="titleSmall" style={styles.checkinCardTitle}>
                  Daily check-in
                </Text>
                <Text variant="bodySmall" style={styles.checkinCardSubtitle}>
                  {checkinComplete ? 'Done for today' : 'A quick self-reflection — private and offline'}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={colors.muted}
              />
            </View>
          </Surface>
        </TouchableOpacity>

        {/* Today's course card */}
        {!contentLoading && todayContent !== null && (
          <Card style={styles.courseCard} mode="contained">
            <Card.Content>
              <Text variant="labelSmall" style={styles.courseDayLabel}>
                Day {currentDayIndex} of 7
              </Text>
              <Text variant="titleMedium" style={styles.courseTitle}>
                {todayContent.title}
              </Text>
              <Text variant="bodySmall" style={styles.courseBody}>
                {todayContent.body}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Text variant="labelMedium" style={styles.courseAction}>
                {todayContent.action_text}
              </Text>
            </Card.Actions>
          </Card>
        )}

        {/* Spacer to prevent content from hiding behind sticky CTA */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky bottom Reset CTA */}
      <View style={styles.stickyBottom}>
        <Button
          mode="contained"
          onPress={handleResetPress}
          style={styles.resetButton}
          contentStyle={styles.resetButtonContent}
          labelStyle={styles.resetButtonLabel}
          accessibilityLabel="Open the reset flow"
          accessibilityHint="Starts the guided reset protocol"
        >
          {resetCtaLabel}
        </Button>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// StatCard sub-component
// ---------------------------------------------------------------------------

interface StatCardProps {
  value: number;
  label: string;
  valueColor: string;
}

function StatCard({ value, label, valueColor }: StatCardProps): React.ReactElement {
  return (
    <Surface style={styles.statCard} elevation={2}>
      {/* Phase 2A: fontWeight '800' and letterSpacing -1 for bolder display look */}
      <Text variant="displaySmall" style={[styles.statValue, { color: valueColor }]}>
        {value}
      </Text>
      <Text variant="labelMedium" style={styles.statLabel}>
        {label}
      </Text>
    </Surface>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.muted,
  },
  // Phase 4B: hero section sits above the ScrollView
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 8,
    gap: 12,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  // Phase 4B: paddingTop removed here since hero section already covers it
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  successChip: {
    backgroundColor: '#1A3D2E',
    borderColor: colors.success,
    borderWidth: 1,
  },
  successChipText: {
    color: colors.success,
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Phase 2A: fontWeight '800', letterSpacing -1
  statValue: {
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 52,
  },
  statLabel: {
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  courseCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  courseDayLabel: {
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  courseTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  courseBody: {
    color: colors.muted,
    lineHeight: 20,
  },
  courseAction: {
    color: colors.secondary,
    flex: 1,
    flexWrap: 'wrap',
  },
  checkinCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  checkinCardDone: {
    borderColor: '#1A3D2E',
    backgroundColor: '#0F1E18',
  },
  checkinCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkinCardText: {
    flex: 1,
    gap: 2,
  },
  checkinCardTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  checkinCardSubtitle: {
    color: colors.muted,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 80,
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    borderRadius: 14,
  },
  resetButtonContent: {
    paddingVertical: 8,
  },
  resetButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
