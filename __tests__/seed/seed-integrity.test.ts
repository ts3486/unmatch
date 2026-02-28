// Integrity tests for data/seed/catalog.json and data/seed/starter_7d.json.
//
// These tests enforce the LOCKED constraints from CLAUDE.md:
//   - Urge kinds: preset-only ('swipe' | 'check' | 'spend')
//   - Spend categories: preset-only ('iap' | 'date' | 'gift' | 'tipping' | 'transport' | 'other')
//   - spend_item_types: preset-only ('boost' | 'like_pack' | 'premium' | 'other')
//   - starter_7d action_ids must reference real catalog actions
//   - getCatalog() / getStarterCourse() mapper correctness

/* eslint-disable @typescript-eslint/no-var-requires */
const catalog = require("@/data/seed/catalog.json") as Record<string, unknown>;
const starterCourse = require("@/data/seed/starter_7d.json") as Record<
	string,
	unknown
>;

import { getCatalog, getStarterCourse } from "@/src/data/seed-loader";
import type {
	SpendCategory,
	SpendItemType,
	UrgeKind,
} from "@/src/domain/types";

// ---------------------------------------------------------------------------
// Raw JSON structure — catalog.json
// ---------------------------------------------------------------------------

describe("catalog.json raw structure", () => {
	it("has a version field", () => {
		expect(typeof catalog.version).toBe("string");
	});

	it("has a non-empty triggers array", () => {
		const triggers = catalog.triggers as Array<{ id: string; label: string }>;
		expect(Array.isArray(triggers)).toBe(true);
		expect(triggers.length).toBeGreaterThan(0);
	});

	it("trigger IDs are all unique", () => {
		const triggers = catalog.triggers as Array<{ id: string }>;
		const ids = triggers.map((t) => t.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("all triggers have non-empty id and label", () => {
		const triggers = catalog.triggers as Array<{ id: string; label: string }>;
		for (const t of triggers) {
			expect(typeof t.id).toBe("string");
			expect(t.id.length).toBeGreaterThan(0);
			expect(typeof t.label).toBe("string");
			expect(t.label.length).toBeGreaterThan(0);
		}
	});

	it("has a non-empty actions array", () => {
		const actions = catalog.actions as Array<{ id: string }>;
		expect(Array.isArray(actions)).toBe(true);
		expect(actions.length).toBeGreaterThan(0);
	});

	it("action IDs are all unique", () => {
		const actions = catalog.actions as Array<{ id: string }>;
		const ids = actions.map((a) => a.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("all actions have non-empty id, title, steps array, and positive minutes", () => {
		const actions = catalog.actions as Array<{
			id: string;
			title: string;
			steps: unknown[];
			minutes: number;
			tags: string[];
		}>;
		for (const a of actions) {
			expect(typeof a.id).toBe("string");
			expect(a.id.length).toBeGreaterThan(0);
			expect(typeof a.title).toBe("string");
			expect(a.title.length).toBeGreaterThan(0);
			expect(Array.isArray(a.steps)).toBe(true);
			expect(a.steps.length).toBeGreaterThan(0);
			expect(a.minutes).toBeGreaterThan(0);
			expect(Array.isArray(a.tags)).toBe(true);
		}
	});
});

// ---------------------------------------------------------------------------
// Preset-only urge kinds (LOCKED)
// ---------------------------------------------------------------------------

describe("catalog.json urgeKinds — preset-only constraint", () => {
	const ALLOWED_URGE_KINDS: UrgeKind[] = ["swipe", "check", "spend"];

	it("has exactly the three allowed urge kinds", () => {
		const urgeKinds = catalog.urgeKinds as Array<{ id: string }>;
		const ids = urgeKinds.map((u) => u.id).sort();
		expect(ids).toEqual([...ALLOWED_URGE_KINDS].sort());
	});

	it("every urgeKind id is one of the preset values", () => {
		const urgeKinds = catalog.urgeKinds as Array<{ id: string }>;
		for (const u of urgeKinds) {
			expect(ALLOWED_URGE_KINDS as string[]).toContain(u.id);
		}
	});

	it("all urge kinds have non-empty labels", () => {
		const urgeKinds = catalog.urgeKinds as Array<{ id: string; label: string }>;
		for (const u of urgeKinds) {
			expect(typeof u.label).toBe("string");
			expect(u.label.length).toBeGreaterThan(0);
		}
	});
});

// ---------------------------------------------------------------------------
// Preset-only spend categories (LOCKED)
// ---------------------------------------------------------------------------

describe("catalog.json spendCategories — preset-only constraint", () => {
	const ALLOWED_CATEGORIES: SpendCategory[] = [
		"iap",
		"date",
		"gift",
		"tipping",
		"transport",
		"other",
	];

	it("has exactly the six allowed spend categories", () => {
		const cats = catalog.spendCategories as Array<{ id: string }>;
		const ids = cats.map((c) => c.id).sort();
		expect(ids).toEqual([...ALLOWED_CATEGORIES].sort());
	});

	it("every spendCategory id is one of the preset values", () => {
		const cats = catalog.spendCategories as Array<{ id: string }>;
		for (const c of cats) {
			expect(ALLOWED_CATEGORIES as string[]).toContain(c.id);
		}
	});
});

// ---------------------------------------------------------------------------
// Preset-only spend item types (LOCKED)
// ---------------------------------------------------------------------------

describe("catalog.json spendItemTypes — preset-only constraint", () => {
	const ALLOWED_ITEM_TYPES: SpendItemType[] = [
		"boost",
		"like_pack",
		"premium",
		"other",
	];

	it("has exactly the four allowed spend item types", () => {
		const types = catalog.spendItemTypes as Array<{ id: string }>;
		const ids = types.map((t) => t.id).sort();
		expect(ids).toEqual([...ALLOWED_ITEM_TYPES].sort());
	});

	it("every spendItemType id is one of the preset values", () => {
		const types = catalog.spendItemTypes as Array<{ id: string }>;
		for (const t of types) {
			expect(ALLOWED_ITEM_TYPES as string[]).toContain(t.id);
		}
	});
});

// ---------------------------------------------------------------------------
// spend_delay_cards cross-reference action IDs
// ---------------------------------------------------------------------------

describe("catalog.json spendDelayCards — action cross-reference", () => {
	it("every spendDelayCard.ctaActionId references a real action in the catalog", () => {
		const actions = catalog.actions as Array<{ id: string }>;
		const actionIdSet = new Set(actions.map((a) => a.id));
		const cards = catalog.spendDelayCards as Array<{
			id: string;
			ctaActionId: string;
		}>;

		for (const card of cards) {
			expect(actionIdSet.has(card.ctaActionId)).toBe(true);
		}
	});

	it("spendDelayCard IDs are all unique", () => {
		const cards = catalog.spendDelayCards as Array<{ id: string }>;
		const ids = cards.map((c) => c.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("all spendDelayCards have non-empty title and body", () => {
		const cards = catalog.spendDelayCards as Array<{
			title: string;
			body: string;
		}>;
		for (const card of cards) {
			expect(card.title.length).toBeGreaterThan(0);
			expect(card.body.length).toBeGreaterThan(0);
		}
	});
});

// ---------------------------------------------------------------------------
// starter_7d.json raw structure
// ---------------------------------------------------------------------------

describe("starter_7d.json raw structure", () => {
	it('has courseId "starter_7d"', () => {
		expect(starterCourse.courseId).toBe("starter_7d");
	});

	it("has exactly 7 days", () => {
		const days = starterCourse.days as unknown[];
		expect(days).toHaveLength(7);
	});

	it("day indices are 1-based and run from 1 to 7 without gaps", () => {
		const days = starterCourse.days as Array<{ dayIndex: number }>;
		const indices = days.map((d) => d.dayIndex).sort((a, b) => a - b);
		expect(indices).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});

	it("all days have unique contentIds", () => {
		const days = starterCourse.days as Array<{ contentId: string }>;
		const ids = days.map((d) => d.contentId);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("all days have non-empty title, body, and actionText", () => {
		const days = starterCourse.days as Array<{
			title: string;
			body: string;
			actionText: string;
			estMinutes: number;
		}>;
		for (const d of days) {
			expect(d.title.length).toBeGreaterThan(0);
			expect(d.body.length).toBeGreaterThan(0);
			expect(d.actionText.length).toBeGreaterThan(0);
			expect(d.estMinutes).toBeGreaterThan(0);
		}
	});

	it("every recommendedActionId in starter course references a real catalog action", () => {
		const actions = catalog.actions as Array<{ id: string }>;
		const actionIdSet = new Set(actions.map((a) => a.id));
		const days = starterCourse.days as Array<{
			recommendedActionIds: string[];
		}>;

		for (const day of days) {
			for (const actionId of day.recommendedActionIds) {
				expect(actionIdSet.has(actionId)).toBe(true);
			}
		}
	});
});

// ---------------------------------------------------------------------------
// getCatalog() mapped output
// ---------------------------------------------------------------------------

describe("getCatalog() — mapped output", () => {
	it("returns the same catalog on repeated calls (memoized)", () => {
		const first = getCatalog();
		const second = getCatalog();
		expect(first).toBe(second);
	});

	it("triggers array is non-empty and items have id and label", () => {
		const cat = getCatalog();
		expect(cat.triggers.length).toBeGreaterThan(0);
		for (const t of cat.triggers) {
			expect(typeof t.id).toBe("string");
			expect(typeof t.label).toBe("string");
		}
	});

	it("actions are mapped: body is joined steps, est_seconds = minutes * 60", () => {
		const cat = getCatalog();
		const rawActions = catalog.actions as Array<{
			steps: string[];
			minutes: number;
		}>;

		for (let i = 0; i < cat.actions.length; i++) {
			const mapped = cat.actions[i];
			const raw = rawActions[i];
			expect(mapped.body).toBe(raw.steps.join("\n"));
			expect(mapped.est_seconds).toBe(raw.minutes * 60);
		}
	});

	it("actions have action_type derived from first tag", () => {
		const cat = getCatalog();
		const rawActions = catalog.actions as Array<{ tags: string[] }>;

		for (let i = 0; i < cat.actions.length; i++) {
			const mapped = cat.actions[i];
			const raw = rawActions[i];
			const expectedType = raw.tags[0] ?? "general";
			expect(mapped.action_type).toBe(expectedType);
		}
	});

	it("spend_delay_cards map ctaActionId to action_id", () => {
		const cat = getCatalog();
		const rawCards = catalog.spendDelayCards as Array<{ ctaActionId: string }>;

		for (let i = 0; i < cat.spend_delay_cards.length; i++) {
			expect(cat.spend_delay_cards[i].action_id).toBe(rawCards[i].ctaActionId);
		}
	});
});

// ---------------------------------------------------------------------------
// getStarterCourse() mapped output
// ---------------------------------------------------------------------------

describe("getStarterCourse() — mapped output", () => {
	it('course_id is "starter_7d"', () => {
		const course = getStarterCourse();
		expect(course.course_id).toBe("starter_7d");
	});

	it("has exactly 7 days", () => {
		const course = getStarterCourse();
		expect(course.days).toHaveLength(7);
	});

	it("maps dayIndex to day_index (snake_case)", () => {
		const course = getStarterCourse();
		const rawDays = starterCourse.days as Array<{ dayIndex: number }>;
		for (let i = 0; i < course.days.length; i++) {
			expect(course.days[i].day_index).toBe(rawDays[i].dayIndex);
		}
	});

	it("maps recommendedActionIds to action_ids", () => {
		const course = getStarterCourse();
		const rawDays = starterCourse.days as Array<{
			recommendedActionIds: string[];
		}>;
		for (let i = 0; i < course.days.length; i++) {
			expect(course.days[i].action_ids).toEqual(
				rawDays[i].recommendedActionIds,
			);
		}
	});

	it("maps actionText to action_text and estMinutes to est_minutes", () => {
		const course = getStarterCourse();
		const rawDays = starterCourse.days as Array<{
			actionText: string;
			estMinutes: number;
		}>;
		for (let i = 0; i < course.days.length; i++) {
			expect(course.days[i].action_text).toBe(rawDays[i].actionText);
			expect(course.days[i].est_minutes).toBe(rawDays[i].estMinutes);
		}
	});
});
