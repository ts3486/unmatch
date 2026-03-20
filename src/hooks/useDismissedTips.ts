// Hook to track which tip cards the user has dismissed.
// Persists via the coach_marks_seen column in user_profile (JSON string array).
// No default exports. TypeScript strict mode.

import { useDatabaseContext } from "@/src/contexts/DatabaseContext";
import { useCallback, useEffect, useState } from "react";

export function useDismissedTips(): {
	dismissed: Set<string>;
	dismiss: (tipId: string) => void;
	isLoaded: boolean;
} {
	const { db } = useDatabaseContext();
	const [dismissed, setDismissed] = useState<Set<string>>(new Set());
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		void (async () => {
			const row = await db.getFirstAsync<{
				coach_marks_seen: string | null;
			}>("SELECT coach_marks_seen FROM user_profile LIMIT 1;");

			if (row?.coach_marks_seen) {
				try {
					const parsed: unknown = JSON.parse(row.coach_marks_seen);
					if (Array.isArray(parsed)) {
						setDismissed(
							new Set(parsed.filter((v) => typeof v === "string")),
						);
					}
				} catch {
					// corrupt — treat as empty
				}
			}
			setIsLoaded(true);
		})();
	}, [db]);

	const dismiss = useCallback(
		(tipId: string) => {
			setDismissed((prev) => {
				const next = new Set(prev);
				next.add(tipId);
				const json = JSON.stringify([...next]);
				void db.runAsync(
					"UPDATE user_profile SET coach_marks_seen = ? WHERE id = (SELECT id FROM user_profile LIMIT 1);",
					[json],
				);
				return next;
			});
		},
		[db],
	);

	return { dismissed, dismiss, isLoaded };
}
