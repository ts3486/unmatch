// Repository for coach mark persistence.
// Stores which coach marks the user has already seen in the user_profile table.
// All functions accept a SQLiteDatabase instance directly.
// No default exports. TypeScript strict mode.

import type { SQLiteDatabase } from "expo-sqlite";

// ---------------------------------------------------------------------------
// Repository functions
// ---------------------------------------------------------------------------

/**
 * Returns the set of coach mark IDs the user has already seen.
 * Falls back to an empty set if the column is null or unparseable.
 */
export async function getSeenCoachMarks(
	db: SQLiteDatabase,
): Promise<Set<string>> {
	const row = await db.getFirstAsync<{ coach_marks_seen: string | null }>(
		"SELECT coach_marks_seen FROM user_profile LIMIT 1;",
	);

	if (row === null || row.coach_marks_seen === null) {
		return new Set<string>();
	}

	try {
		const parsed: unknown = JSON.parse(row.coach_marks_seen);
		if (Array.isArray(parsed)) {
			return new Set<string>(parsed.filter((v) => typeof v === "string"));
		}
	} catch {
		// Corrupt JSON — treat as empty.
	}

	return new Set<string>();
}

/**
 * Adds a single coach mark ID to the seen set.
 * Reads the current set, appends the new ID, and writes back.
 */
export async function markCoachMarkSeen(
	db: SQLiteDatabase,
	markId: string,
): Promise<void> {
	const seen = await getSeenCoachMarks(db);
	seen.add(markId);
	const json = JSON.stringify([...seen]);
	await db.runAsync(
		"UPDATE user_profile SET coach_marks_seen = ? WHERE id = (SELECT id FROM user_profile LIMIT 1);",
		[json],
	);
}

/**
 * Resets all coach marks so they will show again.
 */
export async function resetCoachMarks(db: SQLiteDatabase): Promise<void> {
	await db.runAsync(
		"UPDATE user_profile SET coach_marks_seen = NULL WHERE id = (SELECT id FROM user_profile LIMIT 1);",
	);
}
