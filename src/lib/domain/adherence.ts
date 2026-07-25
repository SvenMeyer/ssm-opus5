import { rangeEndingAt, today, type IsoDate } from './date';
import { activeItems, dosesPerDay } from './schedule';
import type { AppData, DoseLog } from './types';

export interface DayAdherence {
	date: IsoDate;
	taken: number;
	expected: number;
	/** 0–1. Zero-expected days report 1 so an empty stack never reads as a failure. */
	ratio: number;
}

export interface AdherenceStats {
	series: DayAdherence[];
	currentStreak: number;
	longestStreak: number;
	/** Mean ratio across the series, 0–1. */
	average: number;
	takenTotal: number;
	expectedTotal: number;
}

/** A day counts toward a streak at or above this ratio. */
export const STREAK_THRESHOLD = 0.8;

function logKey(log: DoseLog): string {
	return `${log.date}:${log.stackItemId}:${log.slotId}`;
}

export function takenSet(logs: DoseLog[]): Set<string> {
	const set = new Set<string>();
	for (const log of logs) {
		if (log.taken) set.add(logKey(log));
	}
	return set;
}

export function isTaken(logs: DoseLog[], date: IsoDate, stackItemId: string, slotId: string) {
	return logs.some(
		(l) => l.date === date && l.stackItemId === stackItemId && l.slotId === slotId && l.taken
	);
}

/**
 * Doses ticked off on a given day.
 *
 * The expected count comes from the *current* schedule. A production build would keep a
 * history of schedule changes and score each past day against the schedule in force that
 * day; this prototype deliberately does not, and the Insights page says so.
 */
export function dayAdherence(data: AppData, date: IsoDate): DayAdherence {
	const expected = dosesPerDay(data);
	const active = new Set(activeItems(data.stack).map((i) => i.id));
	const taken = data.logs.filter(
		(l) => l.date === date && l.taken && active.has(l.stackItemId)
	).length;
	return {
		date,
		taken,
		expected,
		ratio: expected === 0 ? 1 : Math.min(1, taken / expected)
	};
}

export function adherenceStats(data: AppData, days = 90, end: IsoDate = today()): AdherenceStats {
	const series = rangeEndingAt(end, days).map((date) => dayAdherence(data, date));

	let longest = 0;
	let running = 0;
	for (const day of series) {
		if (day.ratio >= STREAK_THRESHOLD) {
			running += 1;
			longest = Math.max(longest, running);
		} else {
			running = 0;
		}
	}

	// The current streak runs backwards from the most recent day. Today is skipped when
	// it is still incomplete, so a day in progress never breaks a streak you still have.
	let current = 0;
	for (let i = series.length - 1; i >= 0; i--) {
		const day = series[i];
		if (day.ratio >= STREAK_THRESHOLD) current += 1;
		else if (i === series.length - 1) continue;
		else break;
	}

	const takenTotal = series.reduce((s, d) => s + d.taken, 0);
	const expectedTotal = series.reduce((s, d) => s + d.expected, 0);

	return {
		series,
		currentStreak: current,
		longestStreak: longest,
		average: series.length === 0 ? 0 : series.reduce((s, d) => s + d.ratio, 0) / series.length,
		takenTotal,
		expectedTotal
	};
}

export interface ItemAdherence {
	stackItemId: string;
	taken: number;
	expected: number;
	ratio: number;
}

/** Per-item adherence — the view that reveals *which* supplement you keep forgetting. */
export function adherenceByItem(data: AppData, days = 30, end: IsoDate = today()): ItemAdherence[] {
	const dates = new Set(rangeEndingAt(end, days));
	return activeItems(data.stack)
		.map((item) => {
			const expected = item.doses.length * dates.size;
			const taken = data.logs.filter(
				(l) => l.taken && l.stackItemId === item.id && dates.has(l.date)
			).length;
			return {
				stackItemId: item.id,
				taken,
				expected,
				ratio: expected === 0 ? 1 : Math.min(1, taken / expected)
			};
		})
		.sort((a, b) => a.ratio - b.ratio);
}
