// Unit tests for src/data/repositories/coach-mark-repository.ts.
// The SQLiteDatabase is mocked so tests run in Node without native modules.

import {
	getSeenCoachMarks,
	markCoachMarkSeen,
	resetCoachMarks,
} from "@/src/data/repositories/coach-mark-repository";
import type { SQLiteDatabase } from "expo-sqlite";

// ---------------------------------------------------------------------------
// SQLiteDatabase mock factory
// ---------------------------------------------------------------------------

function makeMockDb(
	overrides?: Partial<{
		getFirstAsync: jest.Mock;
		runAsync: jest.Mock;
	}>,
): SQLiteDatabase {
	return {
		getFirstAsync: jest.fn().mockResolvedValue(null),
		runAsync: jest.fn().mockResolvedValue(undefined),
		...overrides,
	} as unknown as SQLiteDatabase;
}

// ---------------------------------------------------------------------------
// getSeenCoachMarks
// ---------------------------------------------------------------------------

describe("getSeenCoachMarks", () => {
	it("returns empty set when no profile exists", async () => {
		const db = makeMockDb();
		const result = await getSeenCoachMarks(db);
		expect(result.size).toBe(0);
	});

	it("returns empty set when coach_marks_seen is null", async () => {
		const db = makeMockDb({
			getFirstAsync: jest.fn().mockResolvedValue({ coach_marks_seen: null }),
		});
		const result = await getSeenCoachMarks(db);
		expect(result.size).toBe(0);
	});

	it("parses a valid JSON array of mark IDs", async () => {
		const db = makeMockDb({
			getFirstAsync: jest.fn().mockResolvedValue({
				coach_marks_seen: '["reset_button","checkin"]',
			}),
		});
		const result = await getSeenCoachMarks(db);
		expect(result.size).toBe(2);
		expect(result.has("reset_button")).toBe(true);
		expect(result.has("checkin")).toBe(true);
	});

	it("returns empty set for corrupt JSON", async () => {
		const db = makeMockDb({
			getFirstAsync: jest
				.fn()
				.mockResolvedValue({ coach_marks_seen: "not-json" }),
		});
		const result = await getSeenCoachMarks(db);
		expect(result.size).toBe(0);
	});

	it("filters out non-string values from the array", async () => {
		const db = makeMockDb({
			getFirstAsync: jest.fn().mockResolvedValue({
				coach_marks_seen: '["reset_button", 42, null]',
			}),
		});
		const result = await getSeenCoachMarks(db);
		expect(result.size).toBe(1);
		expect(result.has("reset_button")).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// markCoachMarkSeen
// ---------------------------------------------------------------------------

describe("markCoachMarkSeen", () => {
	it("writes the mark ID as a JSON array", async () => {
		const db = makeMockDb();
		await markCoachMarkSeen(db, "reset_button");
		const [sql, params] = (db.runAsync as jest.Mock).mock.calls[0] as [
			string,
			unknown[],
		];
		expect(sql).toMatch(/UPDATE user_profile/i);
		expect(params[0]).toBe('["reset_button"]');
	});

	it("appends to existing seen marks", async () => {
		const db = makeMockDb({
			getFirstAsync: jest.fn().mockResolvedValue({
				coach_marks_seen: '["reset_button"]',
			}),
		});
		await markCoachMarkSeen(db, "checkin");
		const params = (db.runAsync as jest.Mock).mock.calls[0][1] as unknown[];
		const written = JSON.parse(params[0] as string) as string[];
		expect(written).toContain("reset_button");
		expect(written).toContain("checkin");
	});

	it("does not duplicate an already-seen mark", async () => {
		const db = makeMockDb({
			getFirstAsync: jest.fn().mockResolvedValue({
				coach_marks_seen: '["reset_button"]',
			}),
		});
		await markCoachMarkSeen(db, "reset_button");
		const params = (db.runAsync as jest.Mock).mock.calls[0][1] as unknown[];
		const written = JSON.parse(params[0] as string) as string[];
		expect(written).toEqual(["reset_button"]);
	});
});

// ---------------------------------------------------------------------------
// resetCoachMarks
// ---------------------------------------------------------------------------

describe("resetCoachMarks", () => {
	it("sets coach_marks_seen to NULL", async () => {
		const db = makeMockDb();
		await resetCoachMarks(db);
		const [sql] = (db.runAsync as jest.Mock).mock.calls[0] as [string];
		expect(sql).toMatch(/coach_marks_seen = NULL/i);
	});
});
