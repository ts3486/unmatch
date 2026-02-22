// Date utility functions using date-fns and date-fns-tz.
// All dates use YYYY-MM-DD format in the device's local timezone.
// Day boundary = local timezone midnight (LOCKED per spec).
// No default exports. TypeScript strict mode assumed.

import {
  eachDayOfInterval,
  format,
  isSameDay as dfIsSameDay,
  isToday as dfIsToday,
  parse,
  startOfDay,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const DATE_FORMAT = 'yyyy-MM-dd';

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

/**
 * Return the device's local IANA timezone string, falling back to 'UTC'
 * if the Intl API is unavailable.
 */
function getLocalTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns today's date as a YYYY-MM-DD string in the device's local timezone.
 * This is the canonical way to get "today" throughout the app.
 */
export function getLocalDateString(): string {
  const tz = getLocalTimeZone();
  const zonedNow = toZonedTime(new Date(), tz);
  return format(zonedNow, DATE_FORMAT);
}

/**
 * Returns the given Date as a YYYY-MM-DD string in the device's local timezone.
 *
 * @param date - Any JavaScript Date object.
 */
export function getLocalDateStringForDate(date: Date): string {
  const tz = getLocalTimeZone();
  const zoned = toZonedTime(date, tz);
  return format(zoned, DATE_FORMAT);
}

/**
 * Parses a YYYY-MM-DD string as midnight in the device's local timezone.
 * Use this whenever converting a stored date string back into a Date object.
 *
 * @param dateStr - A YYYY-MM-DD string.
 * @returns A Date representing midnight local time on that day.
 */
export function parseLocalDate(dateStr: string): Date {
  // parse() without a reference date component treats the result as
  // local time, which is exactly what we want.
  return startOfDay(parse(dateStr, DATE_FORMAT, new Date()));
}

/**
 * Returns true if the given YYYY-MM-DD string represents today in the
 * device's local timezone.
 *
 * @param dateStr - A YYYY-MM-DD string.
 */
export function isToday(dateStr: string): boolean {
  return dfIsToday(parseLocalDate(dateStr));
}

/**
 * Returns true if two YYYY-MM-DD strings represent the same calendar day.
 *
 * @param a - First YYYY-MM-DD string.
 * @param b - Second YYYY-MM-DD string.
 */
export function isSameDay(a: string, b: string): boolean {
  return dfIsSameDay(parseLocalDate(a), parseLocalDate(b));
}

/**
 * Returns an array of YYYY-MM-DD strings for every calendar day between
 * startDate and endDate (both inclusive). The order is chronological.
 *
 * @param startDate - The first day of the range (YYYY-MM-DD).
 * @param endDate   - The last day of the range (YYYY-MM-DD), must be >= startDate.
 * @returns Array of YYYY-MM-DD strings.
 */
export function getDaysBetween(startDate: string, endDate: string): string[] {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  return eachDayOfInterval({ start, end }).map((d) => format(d, DATE_FORMAT));
}
