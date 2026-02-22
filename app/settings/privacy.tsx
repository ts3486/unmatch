// Privacy and data settings screen.
// Lets users export or delete all local data.
// TypeScript strict mode.

import React, { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Portal, Dialog, Text } from 'react-native-paper';
import { useAnalytics } from '@/src/contexts/AnalyticsContext';
import { useDatabaseContext } from '@/src/contexts/DatabaseContext';
import { colors } from '@/src/constants/theme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function gatherAllData(db: import('expo-sqlite').SQLiteDatabase): Promise<Record<string, unknown>> {
  const [profile, urgeEvents, checkins, progress, contentProgress] = await Promise.all([
    db.getAllAsync('SELECT * FROM user_profile;'),
    db.getAllAsync('SELECT id, started_at, from_screen, urge_level, protocol_completed, urge_kind, action_type, action_id, outcome, trigger_tag, spend_category, spend_item_type FROM urge_event ORDER BY started_at ASC;'),
    db.getAllAsync('SELECT id, date_local, mood, fatigue, urge, opened_at_night, spent_today FROM daily_checkin ORDER BY date_local ASC;'),
    db.getAllAsync('SELECT * FROM progress ORDER BY date_local ASC;'),
    db.getAllAsync('SELECT * FROM content_progress ORDER BY completed_at ASC;'),
  ]);

  return {
    exported_at: new Date().toISOString(),
    note: 'Note and spend_amount fields are excluded from exports.',
    user_profile: profile,
    urge_events: urgeEvents,
    daily_checkins: checkins,
    progress,
    content_progress: contentProgress,
  };
}

async function deleteAllData(db: import('expo-sqlite').SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM content_progress;');
  await db.runAsync('DELETE FROM urge_event;');
  await db.runAsync('DELETE FROM daily_checkin;');
  await db.runAsync('DELETE FROM progress;');
  await db.runAsync('DELETE FROM user_profile;');
  await db.runAsync('DELETE FROM subscription_state;');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PrivacyScreen(): React.ReactElement {
  const analytics = useAnalytics();
  const { db } = useDatabaseContext();

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);
  const [exportedJson, setExportedJson] = useState<string | null>(null);
  const [exportDialogVisible, setExportDialogVisible] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  const handleExport = useCallback(async (): Promise<void> => {
    if (isExporting) {
      return;
    }
    setIsExporting(true);
    try {
      const data = await gatherAllData(db);
      const json = JSON.stringify(data, null, 2);
      setExportedJson(json);
      setExportDialogVisible(true);

      analytics.track({ name: 'data_exported', props: {} });
    } catch (err) {
      Alert.alert('Export failed', 'Could not gather data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [db, analytics, isExporting]);

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
      analytics.track({ name: 'data_deleted', props: {} });
      Alert.alert('Data deleted', 'All local data has been removed.');
    } catch {
      Alert.alert('Delete failed', 'Could not delete data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }, [db, analytics, isDeleting]);

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
              Note fields and spending amounts are excluded from exported files to protect your privacy.
            </Text>
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Your data
        </Text>

        <Card style={styles.card} mode="contained">
          <Card.Content style={styles.actionContent}>
            <View style={styles.actionRow}>
              <View style={styles.actionText}>
                <Text variant="titleSmall" style={styles.actionTitle}>
                  Export data
                </Text>
                <Text variant="bodySmall" style={styles.actionDesc}>
                  Download a JSON snapshot of your local records.
                </Text>
              </View>
              <Button
                mode="outlined"
                onPress={() => { void handleExport(); }}
                loading={isExporting}
                disabled={isExporting || isDeleting}
                style={styles.exportButton}
                textColor={colors.primary}
              >
                Export
              </Button>
            </View>

            <Divider style={styles.divider} />

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
                disabled={isExporting || isDeleting}
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
          onDismiss={() => { setDeleteDialogVisible(false); }}
          style={styles.dialog}
        >
          <Dialog.Title>
            <Text variant="titleMedium" style={styles.dialogTitle}>
              Delete all data?
            </Text>
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogBody}>
              This will permanently remove all your local records including check-ins, urge events, and progress. This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => { setDeleteDialogVisible(false); }}
              textColor={colors.muted}
            >
              Cancel
            </Button>
            <Button
              onPress={() => { void handleDelete(); }}
              textColor="#E05A5A"
            >
              Delete all
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Export preview dialog */}
        <Dialog
          visible={exportDialogVisible}
          onDismiss={() => { setExportDialogVisible(false); setExportedJson(null); }}
          style={styles.dialog}
        >
          <Dialog.Title>
            <Text variant="titleMedium" style={styles.dialogTitle}>
              Data exported
            </Text>
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogBody}>
              Your data has been gathered. In a future version this will be saved or shared as a file. Below is a preview:
            </Text>
            <ScrollView style={styles.jsonPreview} nestedScrollEnabled>
              <Text style={styles.jsonText} selectable>
                {exportedJson?.slice(0, 800) ?? ''}
                {(exportedJson?.length ?? 0) > 800 ? '\n...(truncated)' : ''}
              </Text>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => { setExportDialogVisible(false); setExportedJson(null); }}
              textColor={colors.primary}
            >
              Close
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
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#0F1D3A',
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
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 12,
  },
  actionText: {
    flex: 1,
    gap: 4,
  },
  actionTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  deleteTitle: {
    color: '#E05A5A',
    fontWeight: '600',
  },
  actionDesc: {
    color: colors.muted,
    lineHeight: 18,
  },
  exportButton: {
    borderColor: colors.primary,
    flexShrink: 0,
  },
  deleteButton: {
    borderColor: '#E05A5A',
    flexShrink: 0,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: 16,
  },
  dialogTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  dialogBody: {
    color: colors.muted,
    lineHeight: 22,
  },
  jsonPreview: {
    maxHeight: Platform.OS === 'ios' ? 200 : 180,
    marginTop: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 8,
  },
  jsonText: {
    color: colors.muted,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 16,
  },
  bottomSpacer: {
    height: 24,
  },
});
