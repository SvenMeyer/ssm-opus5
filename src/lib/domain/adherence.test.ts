import { describe, expect, it } from 'vitest';
import { adherenceByItem, adherenceStats, dayAdherence } from './adherence';
import { addDays } from './date';
import { makeData, product, stackItem } from './test-fixtures';
import type { DoseLog } from './types';

const END = '2026-07-26';

function log(date: string, stackItemId: string, slotId: string): DoseLog {
	return { date, stackItemId, slotId, taken: true };
}

const base = () =>
	makeData({
		products: [product('a', []), product('b', [])],
		stack: [
			stackItem('s1', 'a', [
				{ slotId: 'am', servings: 1, withFood: 'any' },
				{ slotId: 'pm', servings: 1, withFood: 'any' }
			]),
			stackItem('s2', 'b', [{ slotId: 'night', servings: 1, withFood: 'any' }])
		]
	});

describe('dayAdherence', () => {
	it('scores taken against the number of scheduled doses', () => {
		const data = { ...base(), logs: [log(END, 's1', 'am'), log(END, 's2', 'night')] };
		const day = dayAdherence(data, END);
		expect(day).toMatchObject({ taken: 2, expected: 3 });
		expect(day.ratio).toBeCloseTo(2 / 3);
	});

	it('does not let logs from a paused item inflate the score', () => {
		const data = base();
		data.stack[1] = { ...data.stack[1], status: 'paused' };
		const withLogs = { ...data, logs: [log(END, 's2', 'night')] };
		expect(dayAdherence(withLogs, END).taken).toBe(0);
	});

	it('treats an empty stack as complete rather than as a failure', () => {
		expect(dayAdherence(makeData(), END).ratio).toBe(1);
	});
});

describe('adherenceStats', () => {
	it('counts a streak backwards from the most recent day', () => {
		const data = base();
		const logs: DoseLog[] = [];
		// Three complete days ending yesterday, nothing before that.
		for (let i = 1; i <= 3; i++) {
			const date = addDays(END, -i);
			logs.push(log(date, 's1', 'am'), log(date, 's1', 'pm'), log(date, 's2', 'night'));
		}

		const stats = adherenceStats({ ...data, logs }, 10, END);
		// Today is empty but still in progress, so it must not break the streak.
		expect(stats.currentStreak).toBe(3);
		expect(stats.longestStreak).toBe(3);
	});

	it('breaks a streak on a genuinely missed past day', () => {
		const data = base();
		const logs: DoseLog[] = [];
		for (const offset of [1, 3, 4]) {
			const date = addDays(END, -offset);
			logs.push(log(date, 's1', 'am'), log(date, 's1', 'pm'), log(date, 's2', 'night'));
		}

		const stats = adherenceStats({ ...data, logs }, 10, END);
		expect(stats.currentStreak).toBe(1);
		expect(stats.longestStreak).toBe(2);
	});

	it('reports totals across the window', () => {
		const data = { ...base(), logs: [log(END, 's1', 'am')] };
		const stats = adherenceStats(data, 5, END);
		expect(stats.series).toHaveLength(5);
		expect(stats.takenTotal).toBe(1);
		expect(stats.expectedTotal).toBe(15);
	});
});

describe('adherenceByItem', () => {
	it('surfaces the worst-kept item first', () => {
		const data = base();
		const logs: DoseLog[] = [];
		for (let i = 0; i < 5; i++) {
			const date = addDays(END, -i);
			logs.push(log(date, 's1', 'am'), log(date, 's1', 'pm'));
		}

		const ranked = adherenceByItem({ ...data, logs }, 5, END);
		expect(ranked[0].stackItemId).toBe('s2');
		expect(ranked[0].ratio).toBe(0);
		expect(ranked[1].ratio).toBe(1);
	});
});
