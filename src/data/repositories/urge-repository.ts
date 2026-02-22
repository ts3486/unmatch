// Repository for the urge_event table.
// All functions accept a SQLiteDatabase instance directly.
// No default exports. TypeScript strict mode.

import type { SQLiteDatabase } from 'expo-sqlite';
import { randomUUID } from '@/src/utils/uuid';
import type { UrgeEvent } from '@/src/domain/types';

// ---------------------------------------------------------------------------
// Row shape
// ---------------------------------------------------------------------------

interface UrgeEventRow {
  id: string;
  started_at: string;
  from_screen: string;
  urge_level: number;
  protocol_completed: number;
  urge_kind: string;
  action_type: string | null;
  action_id: string | null;
  outcome: string | null;
  trigger_tag: string | null;
  spend_category: string | null;
  spend_item_type: string | null;
  spend_amount: number | null;
}

function rowToUrgeEvent(row: UrgeEventRow): UrgeEvent {
  return {
    id: row.id,
    started_at: row.started_at,
    from_screen: row.from_screen,
    urge_level: row.urge_level,
    protocol_completed: row.protocol_completed,
    urge_kind: row.urge_kind as UrgeEvent['urge_kind'],
    action_type: row.action_type ?? '',
    action_id: row.action_id ?? '',
    outcome: (row.outcome ?? 'ongoing') as UrgeEvent['outcome'],
    trigger_tag: row.trigger_tag,
    spend_category:
      row.spend_category !== null
        ? (row.spend_category as UrgeEvent['spend_category'])
        : null,
    spend_item_type:
      row.spend_item_type !== null
        ? (row.spend_item_type as UrgeEvent['spend_item_type'])
        : null,
    spend_amount: row.spend_amount,
  };
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/**
 * Returns the UTC ISO-8601 range that covers the given local date string
 * (YYYY-MM-DD) in the device timezone.
 *
 * Because SQLite stores started_at as UTC ISO-8601, we convert local date
 * boundaries to UTC for comparison. We use JavaScript's Date parsing:
 * "2024-01-15" interpreted as midnight local time.
 */
function localDateToUtcRange(dateLocal: string): { start: string; end: string } {
  const startMs = new Date(`${dateLocal}T00:00:00`).getTime();
  const endMs = startMs + 24 * 60 * 60 * 1000;
  return {
    start: new Date(startMs).toISOString(),
    end: new Date(endMs).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Repository functions
// ---------------------------------------------------------------------------

/**
 * Inserts a new urge event.
 * Generates a UUID automatically.
 * Returns the full inserted event.
 */
export async function createUrgeEvent(
  db: SQLiteDatabase,
  event: Omit<UrgeEvent, 'id'>,
): Promise<UrgeEvent> {
  const id = randomUUID();

  await db.runAsync(
    `INSERT INTO urge_event
       (id, started_at, from_screen, urge_level, protocol_completed,
        urge_kind, action_type, action_id, outcome, trigger_tag,
        spend_category, spend_item_type, spend_amount)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      event.started_at,
      event.from_screen,
      event.urge_level,
      event.protocol_completed,
      event.urge_kind,
      event.action_type,
      event.action_id,
      event.outcome,
      event.trigger_tag ?? null,
      event.spend_category ?? null,
      event.spend_item_type ?? null,
      event.spend_amount ?? null,
    ],
  );

  return { id, ...event };
}

/**
 * Returns all urge events whose started_at falls within the given local date
 * (device timezone), ordered by started_at ascending.
 */
export async function getUrgeEventsByDate(
  db: SQLiteDatabase,
  dateLocal: string,
): Promise<UrgeEvent[]> {
  const { start, end } = localDateToUtcRange(dateLocal);

  const rows = await db.getAllAsync<UrgeEventRow>(
    `SELECT * FROM urge_event
     WHERE started_at >= ? AND started_at < ?
     ORDER BY started_at ASC;`,
    [start, end],
  );

  return rows.map(rowToUrgeEvent);
}

/**
 * Counts urge events on a given local date where outcome = 'success'.
 * Used to determine whether that day is a "success day".
 */
export async function countSuccessesByDate(
  db: SQLiteDatabase,
  dateLocal: string,
): Promise<number> {
  const { start, end } = localDateToUtcRange(dateLocal);

  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM urge_event
     WHERE started_at >= ? AND started_at < ?
       AND outcome = 'success';`,
    [start, end],
  );

  return row?.count ?? 0;
}

/**
 * Counts urge events on a given local date where urge_kind = 'spend'
 * and outcome = 'success' (spend avoided).
 */
export async function countSpendAvoidedByDate(
  db: SQLiteDatabase,
  dateLocal: string,
): Promise<number> {
  const { start, end } = localDateToUtcRange(dateLocal);

  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM urge_event
     WHERE started_at >= ? AND started_at < ?
       AND urge_kind = 'spend'
       AND outcome = 'success';`,
    [start, end],
  );

  return row?.count ?? 0;
}

/**
 * Returns all urge events within an inclusive local date range [startDate, endDate],
 * ordered by started_at ascending.
 */
export async function getUrgeEventsInRange(
  db: SQLiteDatabase,
  startDate: string,
  endDate: string,
): Promise<UrgeEvent[]> {
  const rangeStart = localDateToUtcRange(startDate).start;
  const rangeEnd = localDateToUtcRange(endDate).end;

  const rows = await db.getAllAsync<UrgeEventRow>(
    `SELECT * FROM urge_event
     WHERE started_at >= ? AND started_at < ?
     ORDER BY started_at ASC;`,
    [rangeStart, rangeEnd],
  );

  return rows.map(rowToUrgeEvent);
}
