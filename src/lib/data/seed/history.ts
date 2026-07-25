import { fromIso, rangeEndingAt, today } from '$lib/domain/date';
import type { DoseLog, JournalEntry, StackItem } from '$lib/domain/types';

/**
 * Ninety days of plausible history, generated deterministically.
 *
 * A fixed seed matters: the Insights heatmap, the streak counter and the trend lines
 * must look identical every time the demo is reset, or reviewing the UI turns into
 * chasing a moving target.
 */
const SEED = 0x5eed_1234;

/** mulberry32 — small, fast, and good enough for fake adherence data. */
function rng(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
	};
}

/** Slots people forget most. Bedtime is the classic. */
const SLOT_RELIABILITY: Record<string, number> = {
	wake: 0.94,
	breakfast: 0.95,
	midday: 0.82,
	training: 0.72,
	dinner: 0.9,
	bedtime: 0.79
};

export const HISTORY_DAYS = 90;

export function seedLogs(stack: StackItem[], days = HISTORY_DAYS): DoseLog[] {
	const random = rng(SEED);
	const dates = rangeEndingAt(today(), days);
	const active = stack.filter((i) => i.status === 'active');
	const logs: DoseLog[] = [];
	const todayIso = dates[dates.length - 1];

	dates.forEach((date, index) => {
		const weekday = fromIso(date).getDay();
		const isWeekend = weekday === 0 || weekday === 6;

		// A two-week slump around six weeks ago, and a gradual improvement since —
		// enough shape that the trend line and heatmap have something to show.
		const slump = index > 40 && index < 54 ? -0.28 : 0;
		const trend = (index / days) * 0.08;

		for (const item of active) {
			if (item.startedOn > date) continue;

			for (const dose of item.doses) {
				const base = SLOT_RELIABILITY[dose.slotId] ?? 0.85;
				const weekendPenalty = isWeekend && dose.slotId === 'training' ? -0.35 : 0;
				const p = base + slump + trend + weekendPenalty;
				const taken = random() < p;

				// Today is still in progress: everything after midday is simply not done yet,
				// so the Today page opens with real work left on it.
				if (date === todayIso) {
					const done = dose.slotId === 'wake' || dose.slotId === 'breakfast';
					if (done) logs.push({ date, stackItemId: item.id, slotId: dose.slotId, taken: true });
					continue;
				}

				if (taken) logs.push({ date, stackItemId: item.id, slotId: dose.slotId, taken: true });
			}
		}
	});

	return logs;
}

const NOTES: Record<number, string> = {
	3: 'Slept through the night for once. Bedtime magnesium is going back in permanently.',
	11: 'Wired at 1am — that was the late espresso, not the stack.',
	19: 'Knees quiet on the stairs today. Six weeks on curcumin.',
	27: 'Forgot everything after breakfast. Travel days are the weak point.',
	38: 'Energy flat all afternoon despite iron. Worth retesting ferritin.',
	46: 'Off the wagon this week. Bottles are on the shelf, I am not opening them.',
	58: 'Back on it. Put the bedtime ones next to the toothbrush.',
	67: 'Best training session in months.',
	74: 'Stomach unsettled — the iron at breakfast, probably.',
	83: 'Sleeping well consistently now. Whatever this is, keep doing it.'
};

export function seedJournal(days = HISTORY_DAYS): JournalEntry[] {
	const random = rng(SEED ^ 0x9e37);
	const dates = rangeEndingAt(today(), days);
	const entries: JournalEntry[] = [];

	dates.forEach((date, index) => {
		// Roughly four days in five get an entry — nobody journals perfectly.
		if (random() < 0.2) return;

		const slump = index > 40 && index < 54 ? -0.9 : 0;
		const trend = (index / days) * 1.1;
		const clamp = (v: number) => Math.max(1, Math.min(5, Math.round(v)));

		entries.push({
			date,
			energy: clamp(2.9 + trend + slump + (random() - 0.5) * 1.4),
			sleep: clamp(2.7 + trend + slump + (random() - 0.5) * 1.6),
			mood: clamp(3.0 + trend * 0.8 + slump + (random() - 0.5) * 1.3),
			note: NOTES[days - index]
		});
	});

	return entries;
}
