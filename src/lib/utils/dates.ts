import { parseISO, format, differenceInCalendarDays, isBefore, isAfter, isEqual } from 'date-fns';

/**
 * Validates whether two intervals overlap where:
 * Check-in is INCLUSIVE
 * Check-out is EXCLUSIVE
 *
 * Interval A: [startA, endA)
 * Interval B: [startB, endB)
 *
 * Overlap exists iff startA < endB AND endA > startB
 */
export function doIntervalsOverlap(
  startA: string | Date,
  endA: string | Date,
  startB: string | Date,
  endB: string | Date
): boolean {
  const sA = typeof startA === 'string' ? parseISO(startA) : startA;
  const eA = typeof endA === 'string' ? parseISO(endA) : endA;
  const sB = typeof startB === 'string' ? parseISO(startB) : startB;
  const eB = typeof endB === 'string' ? parseISO(endB) : endB;

  return isBefore(sA, eB) && isAfter(eA, sB);
}

/**
 * Calculates number of nights between check-in and check-out
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  try {
    const start = parseISO(checkIn);
    const end = parseISO(checkOut);
    const nights = differenceInCalendarDays(end, start);
    return Math.max(1, nights);
  } catch {
    return 1;
  }
}

/**
 * Formats a YYYY-MM-DD date to a human-readable string
 * e.g. "2026-11-15" -> "Fri, Nov 15, 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    return format(d, 'EEE, MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Generates an ISO YYYY-MM-DD string for today, tomorrow, or offset days
 */
export function getOffsetDateString(daysOffset: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

/**
 * Generates an array of date strings between check-in (inclusive) and check-out (exclusive)
 */
export function getDateRangeDays(checkIn: string, checkOut: string): string[] {
  const days: string[] = [];
  const current = parseISO(checkIn);
  const end = parseISO(checkOut);

  let cursor = new Date(current);
  while (isBefore(cursor, end)) {
    days.push(format(cursor, 'yyyy-MM-dd'));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

/**
 * Checks if a hold has expired
 */
export function isHoldExpired(holdExpiresAt?: string): boolean {
  if (!holdExpiresAt) return true;
  return new Date(holdExpiresAt) <= new Date();
}
