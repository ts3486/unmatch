// Unit tests for subscription-repository.
// SQLiteDatabase is mocked so tests run in Node without native modules.

import {
	getHasEverSubscribed,
	getIsPremium,
	getSubscription,
	recordMonthlySubscription,
	upsertSubscription,
} from "@/src/data/repositories/subscription-repository";
import type { SQLiteDatabase } from "expo-sqlite";

// ---------------------------------------------------------------------------
// Mock DB factory
// ---------------------------------------------------------------------------

function makeMockDb(
	overrides?: Partial<{
		getFirstAsync: jest.Mock;
		getAllAsync: jest.Mock;
		runAsync: jest.Mock;
	}>,
): SQLiteDatabase {
	return {
		getFirstAsync: jest.fn().mockResolvedValue(null),
		getAllAsync: jest.fn().mockResolvedValue([]),
		runAsync: jest.fn().mockResolvedValue(undefined),
		...overrides,
	} as unknown as SQLiteDatabase;
}

// ---------------------------------------------------------------------------
// getIsPremium
// ---------------------------------------------------------------------------

describe("getIsPremium", () => {
	it("returns true for active subscription", async () => {
		const db = makeMockDb({
			getFirstAsync: jest.fn().mockResolvedValue({
				id: "singleton",
				status: "active",
				product_id: "unmatch_monthly_499",
				period: "monthly",
				started_at: new Date().toISOString(),
				expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
				is_premium: 1,
				trial_started_at: "",
				trial_ends_at: "",
			}),
		});

		expect(await getIsPremium(db)).toBe(true);
	});

	it("returns true for lifetime subscription", async () => {
		const db = makeMockDb({
			getFirstAsync: jest.fn().mockResolvedValue({
				id: "singleton",
				status: "lifetime",
				product_id: "unmatch_lifetime_2999",
				period: "lifetime",
				started_at: new Date().toISOString(),
				expires_at: "",
				is_premium: 1,
				trial_started_at: "",
				trial_ends_at: "",
			}),
		});

		expect(await getIsPremium(db)).toBe(true);
	});

	it("returns false when no subscription exists", async () => {
		const db = makeMockDb();

		expect(await getIsPremium(db)).toBe(false);
	});

	it("returns false for expired subscription", async () => {
		const db = makeMockDb({
			getFirstAsync: jest.fn().mockResolvedValue({
				id: "singleton",
				status: "expired",
				product_id: "unmatch_monthly_499",
				period: "monthly",
				started_at: new Date().toISOString(),
				expires_at: new Date(Date.now() - 86400000).toISOString(),
				is_premium: 0,
				trial_started_at: "",
				trial_ends_at: "",
			}),
		});

		expect(await getIsPremium(db)).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// getHasEverSubscribed
// ---------------------------------------------------------------------------

describe("getHasEverSubscribed", () => {
	it("returns false when no subscription record exists", async () => {
		const db = makeMockDb();

		expect(await getHasEverSubscribed(db)).toBe(false);
	});

	it("returns false when status is none and no product_id", async () => {
		const db = makeMockDb({
			getFirstAsync: jest.fn().mockResolvedValue({
				id: "singleton",
				status: "none",
				product_id: "",
				period: null,
				started_at: null,
				expires_at: null,
				is_premium: 0,
				trial_started_at: null,
				trial_ends_at: null,
			}),
		});

		expect(await getHasEverSubscribed(db)).toBe(false);
	});

	it("returns true when product_id is set", async () => {
		const db = makeMockDb({
			getFirstAsync: jest.fn().mockResolvedValue({
				id: "singleton",
				status: "none",
				product_id: "unmatch_monthly_499",
				period: "monthly",
				started_at: "2025-01-01T00:00:00Z",
				expires_at: "2025-02-01T00:00:00Z",
				is_premium: 0,
				trial_started_at: "",
				trial_ends_at: "",
			}),
		});

		expect(await getHasEverSubscribed(db)).toBe(true);
	});

	it("returns true when status is active", async () => {
		const db = makeMockDb({
			getFirstAsync: jest.fn().mockResolvedValue({
				id: "singleton",
				status: "active",
				product_id: "unmatch_monthly_499",
				period: "monthly",
				started_at: "2025-01-01T00:00:00Z",
				expires_at: "2099-01-01T00:00:00Z",
				is_premium: 1,
				trial_started_at: "",
				trial_ends_at: "",
			}),
		});

		expect(await getHasEverSubscribed(db)).toBe(true);
	});

	it("returns true when status is expired", async () => {
		const db = makeMockDb({
			getFirstAsync: jest.fn().mockResolvedValue({
				id: "singleton",
				status: "expired",
				product_id: "unmatch_monthly_499",
				period: "monthly",
				started_at: "2025-01-01T00:00:00Z",
				expires_at: "2025-02-01T00:00:00Z",
				is_premium: 0,
				trial_started_at: "",
				trial_ends_at: "",
			}),
		});

		expect(await getHasEverSubscribed(db)).toBe(true);
	});

	it("returns true when status is lifetime", async () => {
		const db = makeMockDb({
			getFirstAsync: jest.fn().mockResolvedValue({
				id: "singleton",
				status: "lifetime",
				product_id: "unmatch_lifetime_2999",
				period: "lifetime",
				started_at: "2025-01-01T00:00:00Z",
				expires_at: "",
				is_premium: 1,
				trial_started_at: "",
				trial_ends_at: "",
			}),
		});

		expect(await getHasEverSubscribed(db)).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// upsertSubscription includes trial fields
// ---------------------------------------------------------------------------

describe("upsertSubscription with trial fields", () => {
	it("passes trial fields to SQL", async () => {
		const db = makeMockDb();

		await upsertSubscription(db, {
			status: "active",
			product_id: "unmatch_monthly_499",
			period: "monthly",
			started_at: "2025-01-01T00:00:00Z",
			expires_at: "2025-02-01T00:00:00Z",
			is_premium: true,
			trial_started_at: "2025-01-01T00:00:00Z",
			trial_ends_at: "2025-01-08T00:00:00Z",
		});

		expect(db.runAsync).toHaveBeenCalledTimes(1);
		const call = (db.runAsync as jest.Mock).mock.calls[0] as [string, unknown[]];
		const params = call[1];
		expect(params[7]).toBe("2025-01-01T00:00:00Z"); // trial_started_at
		expect(params[8]).toBe("2025-01-08T00:00:00Z"); // trial_ends_at
	});
});

// ---------------------------------------------------------------------------
// recordMonthlySubscription preserves trial fields
// ---------------------------------------------------------------------------

describe("recordMonthlySubscription preserves trial fields", () => {
	it("carries forward trial_started_at and trial_ends_at", async () => {
		const trialStarted = "2025-01-01T00:00:00Z";
		const trialEnds = "2025-01-08T00:00:00Z";

		const db = makeMockDb({
			getFirstAsync: jest.fn().mockResolvedValue({
				id: "singleton",
				status: "active",
				product_id: "",
				period: "monthly",
				started_at: trialStarted,
				expires_at: "",
				is_premium: 1,
				trial_started_at: trialStarted,
				trial_ends_at: trialEnds,
			}),
		});

		await recordMonthlySubscription(db, "unmatch_monthly_499");

		// runAsync is called by upsertSubscription
		const call = (db.runAsync as jest.Mock).mock.calls[0] as [string, unknown[]];
		const params = call[1];
		expect(params[1]).toBe("active"); // status
		expect(params[7]).toBe(trialStarted); // trial_started_at preserved
		expect(params[8]).toBe(trialEnds); // trial_ends_at preserved
	});
});
