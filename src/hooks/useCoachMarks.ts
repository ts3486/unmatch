// useCoachMarks — state machine hook for the coach mark walkthrough.
// Shows a sequence of 4 coach marks on first use after onboarding + paywall.
// No default exports. TypeScript strict mode.

import { useAppState } from "@/src/contexts/AppStateContext";
import { useDatabaseContext } from "@/src/contexts/DatabaseContext";
import {
	getSeenCoachMarks,
	markCoachMarkSeen,
} from "@/src/data/repositories/coach-mark-repository";
import { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Coach mark definitions
// ---------------------------------------------------------------------------

export interface CoachMarkConfig {
	id: string;
	title: string;
	body: string;
}

const COACH_MARKS: CoachMarkConfig[] = [
	{
		id: "reset_button",
		title: "Your reset button",
		body: "Tap here when you feel an urge to swipe, check, or spend.",
	},
	{
		id: "checkin",
		title: "Daily check-in",
		body: "Check in once a day to track your mood and urges.",
	},
	{
		id: "course",
		title: "Your 7-day course",
		body: "A daily lesson to build healthier habits. Day 1 starts now.",
	},
	{
		id: "progress_tab",
		title: "Track your streak",
		body: "Your streak and insights build here as you go.",
	},
];

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

export interface UseCoachMarksReturn {
	currentMark: CoachMarkConfig | null;
	currentStep: number;
	totalSteps: number;
	next: () => void;
	skipAll: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCoachMarks(): UseCoachMarksReturn {
	const { db } = useDatabaseContext();
	const { isOnboarded, isPremium } = useAppState();

	const [loaded, setLoaded] = useState(false);
	const [currentIndex, setCurrentIndex] = useState<number>(COACH_MARKS.length);

	// Mutable ref to track seen IDs without causing re-renders.
	const seenRef = useRef<Set<string>>(new Set());

	// Load seen marks on mount.
	useEffect(() => {
		if (!isOnboarded || !isPremium) {
			return;
		}

		let cancelled = false;

		async function load(): Promise<void> {
			const seen = await getSeenCoachMarks(db);
			if (cancelled) return;

			seenRef.current = seen;
			const firstUnseen = COACH_MARKS.findIndex((m) => !seen.has(m.id));
			setCurrentIndex(firstUnseen === -1 ? COACH_MARKS.length : firstUnseen);
			setLoaded(true);
		}

		void load();

		return () => {
			cancelled = true;
		};
	}, [db, isOnboarded, isPremium]);

	// Current mark (null if all done, not loaded, or not eligible).
	const currentMark: CoachMarkConfig | null =
		loaded && currentIndex < COACH_MARKS.length
			? COACH_MARKS[currentIndex]
			: null;

	// Advance to next mark — single state update to avoid double render.
	const next = useCallback((): void => {
		const mark = COACH_MARKS[currentIndex];
		if (mark === undefined) return;

		// Fire-and-forget DB write — no state depends on it.
		seenRef.current.add(mark.id);
		void markCoachMarkSeen(db, mark.id);

		// Find the next unseen mark after current.
		const nextUnseen = COACH_MARKS.findIndex(
			(m, i) => i > currentIndex && !seenRef.current.has(m.id),
		);
		setCurrentIndex(nextUnseen === -1 ? COACH_MARKS.length : nextUnseen);
	}, [db, currentIndex]);

	// Skip all remaining marks — single state update.
	const skipAll = useCallback((): void => {
		const unseen = COACH_MARKS.filter((m) => !seenRef.current.has(m.id));
		for (const mark of unseen) {
			seenRef.current.add(mark.id);
			void markCoachMarkSeen(db, mark.id);
		}
		setCurrentIndex(COACH_MARKS.length);
	}, [db]);

	return {
		currentMark,
		currentStep: currentIndex + 1,
		totalSteps: COACH_MARKS.length,
		next,
		skipAll,
	};
}
