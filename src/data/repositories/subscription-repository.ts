// Repository for the subscription_state table.
// There is at most one row; the singleton ID is fixed as 'singleton'.
// All functions accept a SQLiteDatabase instance directly.
// No default exports. TypeScript strict mode.

import type { SQLiteDatabase } from 'expo-sqlite';
import type { SubscriptionState } from '@/src/domain/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SINGLETON_ID = 'singleton';

// ---------------------------------------------------------------------------
// Row shape
// ---------------------------------------------------------------------------

interface SubscriptionStateRow {
  id: string;
  status: string;
  product_id: string | null;
  period: string | null;
  started_at: string | null;
  expires_at: string | null;
}

function rowToSubscriptionState(row: SubscriptionStateRow): SubscriptionState {
  return {
    id: row.id,
    status: row.status as SubscriptionState['status'],
    product_id: row.product_id ?? '',
    period: (row.period ?? 'monthly') as SubscriptionState['period'],
    started_at: row.started_at ?? '',
    expires_at: row.expires_at ?? '',
  };
}

// ---------------------------------------------------------------------------
// Repository functions
// ---------------------------------------------------------------------------

/**
 * Returns the subscription state record, or null if it has never been set.
 */
export async function getSubscription(
  db: SQLiteDatabase,
): Promise<SubscriptionState | null> {
  const row = await db.getFirstAsync<SubscriptionStateRow>(
    'SELECT * FROM subscription_state WHERE id = ? LIMIT 1;',
    [SINGLETON_ID],
  );

  return row !== null ? rowToSubscriptionState(row) : null;
}

/**
 * Inserts or replaces the subscription state.
 * Always uses the fixed singleton ID so only one row ever exists.
 */
export async function upsertSubscription(
  db: SQLiteDatabase,
  state: Omit<SubscriptionState, 'id'>,
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO subscription_state
       (id, status, product_id, period, started_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [
      SINGLETON_ID,
      state.status,
      state.product_id,
      state.period,
      state.started_at,
      state.expires_at,
    ],
  );
}
