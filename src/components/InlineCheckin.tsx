// InlineCheckin — inline daily check-in card for the home screen.
// Three states: collapsed CTA, expanded (editable), and completed (read-only).
// TypeScript strict mode.

import React, { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Divider, Surface, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '@/src/constants/theme';
import { RatingChips, MOOD_LABELS, FATIGUE_LABELS, URGE_LABELS } from '@/src/components/RatingChips';
import type { UseCheckinReturn } from '@/src/hooks/useCheckin';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface InlineCheckinProps {
  checkin: UseCheckinReturn;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InlineCheckin({ checkin }: InlineCheckinProps): React.ReactElement {
  const {
    mood,
    fatigue,
    urge,
    isComplete,
    isSubmitting,
    existingCheckin,
    setMood,
    setFatigue,
    setUrge,
    submit,
  } = checkin;

  const [expanded, setExpanded] = useState(false);

  const handleSave = useCallback((): void => {
    void submit();
  }, [submit]);

  const handleDetails = useCallback((): void => {
    router.push('/checkin');
  }, []);

  const handleExpand = useCallback((): void => {
    setExpanded(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Completed state
  // ---------------------------------------------------------------------------

  if (isComplete && existingCheckin !== null) {
    return (
      <Surface style={[styles.card, styles.cardDone]}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="check-circle"
            size={20}
            color={colors.success}
          />
          <Text variant="titleSmall" style={styles.titleDone}>
            Today's check-in
          </Text>
        </View>

        <RatingChips
          label="Mood"
          value={existingCheckin.mood}
          onChange={() => {}}
          readonly
          labelMap={MOOD_LABELS}
        />
        <Divider style={styles.divider} />
        <RatingChips
          label="Fatigue"
          value={existingCheckin.fatigue}
          onChange={() => {}}
          readonly
          labelMap={FATIGUE_LABELS}
        />
        <Divider style={styles.divider} />
        <RatingChips
          label="Urge level"
          value={existingCheckin.urge}
          onChange={() => {}}
          readonly
          labelMap={URGE_LABELS}
        />

        <Text
          variant="labelMedium"
          style={styles.detailsLink}
          onPress={handleDetails}
        >
          Edit details
        </Text>
      </Surface>
    );
  }

  // ---------------------------------------------------------------------------
  // Collapsed CTA state
  // ---------------------------------------------------------------------------

  if (!expanded) {
    return (
      <TouchableOpacity onPress={handleExpand} activeOpacity={0.7}>
        <Surface style={styles.card}>
          <View style={styles.collapsedRow}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={22}
              color={colors.primary}
            />
            <View style={styles.collapsedText}>
              <Text variant="titleSmall" style={styles.title}>
                Daily check-in
              </Text>
              <Text variant="bodySmall" style={styles.subtitle}>
                A quick self-reflection — private and offline
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
    );
  }

  // ---------------------------------------------------------------------------
  // Expanded editable state
  // ---------------------------------------------------------------------------

  return (
    <Surface style={styles.card}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons
          name="clipboard-text-outline"
          size={20}
          color={colors.primary}
        />
        <View>
          <Text variant="titleSmall" style={styles.title}>
            Daily check-in
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            How are you today?
          </Text>
        </View>
      </View>

      <RatingChips
        label="Mood"
        value={mood}
        onChange={setMood}
        labelMap={MOOD_LABELS}
      />
      <Divider style={styles.divider} />
      <RatingChips
        label="Fatigue"
        value={fatigue}
        onChange={setFatigue}
        labelMap={FATIGUE_LABELS}
      />
      <Divider style={styles.divider} />
      <RatingChips
        label="Urge level"
        value={urge}
        onChange={setUrge}
        labelMap={URGE_LABELS}
      />

      <Button
        mode="contained"
        onPress={handleSave}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.saveButton}
        contentStyle={styles.saveButtonContent}
        labelStyle={styles.saveButtonLabel}
      >
        Save reflection
      </Button>

      <Text
        variant="labelMedium"
        style={styles.detailsLink}
        onPress={handleDetails}
      >
        Add details
      </Text>
    </Surface>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  cardDone: {
    borderColor: '#1A3D2E',
    backgroundColor: '#0F1E18',
  },
  collapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  collapsedText: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  title: {
    color: colors.text,
    fontWeight: '600',
  },
  titleDone: {
    color: colors.text,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.muted,
    marginTop: 2,
  },
  divider: {
    backgroundColor: colors.border,
  },
  saveButton: {
    borderRadius: 14,
    marginTop: 12,
  },
  saveButtonContent: {
    paddingVertical: 6,
  },
  saveButtonLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  detailsLink: {
    color: colors.secondary,
    textAlign: 'center',
    marginTop: 12,
    paddingVertical: 4,
  },
});
