// Notification content constants.
// No default exports. TypeScript strict mode.

export const NOTIFICATION_IDS = {
	DAILY_MOTIVATION: "daily-motivation",
	STREAK_NUDGE: "streak-nudge",
	COURSE_UNLOCK: "course-unlock",
} as const;

export interface NotificationContent {
	title: string;
	body: string;
}

/**
 * Rotating motivational messages reminding the user to focus on themselves.
 * Two distinct messages are picked at random each day (morning + afternoon).
 */
export const DAILY_MOTIVATION_MESSAGES: NotificationContent[] = [
	{
		title: "You come first",
		body: "Put the apps down and invest that energy in yourself today.",
	},
	{
		title: "Your time is yours",
		body: "Every minute off dating apps is a minute you spend on what really matters — you.",
	},
	{
		title: "Stay present",
		body: "Real life is happening right now. Keep your focus where it counts.",
	},
	{
		title: "You're doing great",
		body: "Choosing yourself over endless swiping is a win. Keep it up.",
	},
	{
		title: "Reset your mind",
		body: "Take a breath inside Unmatch to clear your head and stay focused.",
	},
];

export const NOTIFICATION_CONTENT: Record<
	string,
	{ normal: NotificationContent }
> = {
	[NOTIFICATION_IDS.STREAK_NUDGE]: {
		normal: {
			title: "Unmatch",
			body: "Don't break your streak! Complete today's check-in before midnight.",
		},
	},
	[NOTIFICATION_IDS.COURSE_UNLOCK]: {
		normal: {
			title: "Unmatch",
			body: "A new lesson is available. Check it out to keep your progress going!",
		},
	},
};

// Default schedule times (24h format, local timezone)
export const NOTIFICATION_SCHEDULE = {
	DAILY_MOTIVATION_MORNING_HOUR: 9,
	DAILY_MOTIVATION_MORNING_MINUTE: 0,
	DAILY_MOTIVATION_AFTERNOON_HOUR: 14,
	DAILY_MOTIVATION_AFTERNOON_MINUTE: 0,
	STREAK_NUDGE_HOUR: 20,
	STREAK_NUDGE_MINUTE: 0,
	COURSE_UNLOCK_HOUR: 8,
	COURSE_UNLOCK_MINUTE: 0,
} as const;
