// Unit tests for src/utils/date.ts.
// Pure unit tests — no database, no async, no network.
// All date arithmetic is validated against known fixed values.

import {
	getDaysBetween,
	getLocalDateString,
	getLocalDateStringForDate,
	isSameDay,
	isToday,
	parseLocalDate,
} from "@/src/utils/date";

// ---------------------------------------------------------------------------
// getLocalDateString
// ---------------------------------------------------------------------------

describe("getLocalDateString", () => {
	it("returns a string in YYYY-MM-DD format", () => {
		const result = getLocalDateString();
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	it("returns a plausible year (>= 2024)", () => {
		const result = getLocalDateString();
		const year = Number.parseInt(result.slice(0, 4), 10);
		expect(year).toBeGreaterThanOrEqual(2024);
	});
});

// ---------------------------------------------------------------------------
// getLocalDateStringForDate
// ---------------------------------------------------------------------------

describe("getLocalDateStringForDate", () => {
	it("returns YYYY-MM-DD format for a given Date", () => {
		// Use a fixed UTC midnight value; local timezone may shift the day but
		// the format must always be valid YYYY-MM-DD.
		const date = new Date("2026-02-18T12:00:00Z");
		const result = getLocalDateStringForDate(date);
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	it('agrees with getLocalDateString when called with "now"', () => {
		// Both functions should produce the same date string for the current moment.
		const before = getLocalDateString();
		const fromDate = getLocalDateStringForDate(new Date());
		const after = getLocalDateString();
		// Accept either edge if we happen to cross midnight during the test.
		expect([before, after]).toContain(fromDate);
	});
});

// ---------------------------------------------------------------------------
// parseLocalDate
// ---------------------------------------------------------------------------

describe("parseLocalDate", () => {
	it("parses a YYYY-MM-DD string into a valid Date", () => {
		const result = parseLocalDate("2026-02-18");
		expect(result).toBeInstanceOf(Date);
		expect(isNaN(result.getTime())).toBe(false);
	});

	it("produces midnight local time (hours, minutes, seconds all zero)", () => {
		const result = parseLocalDate("2026-06-15");
		expect(result.getHours()).toBe(0);
		expect(result.getMinutes()).toBe(0);
		expect(result.getSeconds()).toBe(0);
	});

	it("round-trips through getLocalDateStringForDate", () => {
		const original = "2026-02-18";
		const parsed = parseLocalDate(original);
		const formatted = getLocalDateStringForDate(parsed);
		expect(formatted).toBe(original);
	});

	it("correctly handles a month boundary (Jan 31)", () => {
		const result = parseLocalDate("2026-01-31");
		expect(result.getMonth()).toBe(0); // January is 0-indexed
		expect(result.getDate()).toBe(31);
	});

	it("correctly handles a year boundary (Dec 31)", () => {
		const result = parseLocalDate("2025-12-31");
		expect(result.getFullYear()).toBe(2025);
		expect(result.getMonth()).toBe(11); // December is 11
		expect(result.getDate()).toBe(31);
	});
});

// ---------------------------------------------------------------------------
// isToday
// ---------------------------------------------------------------------------

describe("isToday", () => {
	it("returns true for today's date string", () => {
		const today = getLocalDateString();
		expect(isToday(today)).toBe(true);
	});

	it("returns false for a past date string", () => {
		expect(isToday("2000-01-01")).toBe(false);
	});

	it("returns false for a future date string", () => {
		expect(isToday("2099-12-31")).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// isSameDay
// ---------------------------------------------------------------------------

describe("isSameDay", () => {
	it("returns true for identical date strings", () => {
		expect(isSameDay("2026-02-18", "2026-02-18")).toBe(true);
	});

	it("returns false for different date strings", () => {
		expect(isSameDay("2026-02-17", "2026-02-18")).toBe(false);
	});

	it("returns false for dates in different months", () => {
		expect(isSameDay("2026-01-31", "2026-02-01")).toBe(false);
	});

	it("returns false for dates in different years", () => {
		expect(isSameDay("2025-12-31", "2026-01-01")).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// getDaysBetween
// ---------------------------------------------------------------------------

describe("getDaysBetween", () => {
	it("returns a single-element array when start equals end", () => {
		const result = getDaysBetween("2026-02-18", "2026-02-18");
		expect(result).toEqual(["2026-02-18"]);
	});

	it("returns two elements for adjacent days", () => {
		const result = getDaysBetween("2026-02-17", "2026-02-18");
		expect(result).toEqual(["2026-02-17", "2026-02-18"]);
	});

	it("returns inclusive range across multiple days", () => {
		const result = getDaysBetween("2026-02-15", "2026-02-18");
		expect(result).toEqual([
			"2026-02-15",
			"2026-02-16",
			"2026-02-17",
			"2026-02-18",
		]);
		expect(result).toHaveLength(4);
	});

	it("returns all strings in YYYY-MM-DD format", () => {
		const result = getDaysBetween("2026-02-16", "2026-02-18");
		result.forEach((d) => {
			expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});
	});

	it("correctly crosses a month boundary", () => {
		const result = getDaysBetween("2026-01-30", "2026-02-02");
		expect(result).toEqual([
			"2026-01-30",
			"2026-01-31",
			"2026-02-01",
			"2026-02-02",
		]);
	});

	it("correctly crosses a year boundary", () => {
		const result = getDaysBetween("2025-12-30", "2026-01-02");
		expect(result).toEqual([
			"2025-12-30",
			"2025-12-31",
			"2026-01-01",
			"2026-01-02",
		]);
	});

	it("returns results in chronological order", () => {
		const result = getDaysBetween("2026-02-15", "2026-02-18");
		for (let i = 1; i < result.length; i++) {
			expect(result[i] > result[i - 1]).toBe(true);
		}
	});
});
