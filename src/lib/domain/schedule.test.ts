import { describe, expect, it } from 'vitest';
import { hoursApart, minutesOfDay } from './date';
import { dailyUnits, dosesPerDay, scheduleForDay, slotsInOrder } from './schedule';
import { makeData, product, stackItem, TEST_SLOTS } from './test-fixtures';

describe('slot ordering', () => {
	it('orders slots by clock time, not by declaration order', () => {
		expect(slotsInOrder(TEST_SLOTS).map((s) => s.id)).toEqual([
			'fasting',
			'am',
			'noon',
			'pm',
			'night'
		]);
	});

	it('parses times to minutes', () => {
		expect(minutesOfDay('07:30')).toBe(450);
	});

	it('treats the day as a cycle, so bedtime and wake are close', () => {
		expect(hoursApart('22:30', '07:00')).toBe(8.5);
		expect(hoursApart('23:00', '01:00')).toBe(2);
		expect(hoursApart('08:00', '20:00')).toBe(12);
	});
});

describe('scheduleForDay', () => {
	const data = makeData({
		products: [
			product('a', [{ nutrientId: 'zinc', amountPerServing: 10 }], { unitsPerServing: 2 }),
			product('b', [{ nutrientId: 'magnesium', amountPerServing: 200 }])
		],
		stack: [
			stackItem('s1', 'a', [
				{ slotId: 'pm', servings: 1, withFood: 'with' },
				{ slotId: 'am', servings: 1, withFood: 'with' }
			]),
			stackItem('s2', 'b', [{ slotId: 'night', servings: 1, withFood: 'any' }]),
			stackItem('s3', 'b', [{ slotId: 'am', servings: 1, withFood: 'any' }], { status: 'paused' })
		]
	});

	it('groups doses into slots in time order and drops empty slots', () => {
		const groups = scheduleForDay(data, '2026-07-26');
		expect(groups.map((g) => g.slot.id)).toEqual(['am', 'pm', 'night']);
	});

	it('excludes paused items', () => {
		const groups = scheduleForDay(data, '2026-07-26');
		const morning = groups.find((g) => g.slot.id === 'am');
		expect(morning?.doses.map((d) => d.stackItemId)).toEqual(['s1']);
	});

	it('resolves physical units from servings', () => {
		const groups = scheduleForDay(data, '2026-07-26');
		expect(groups[0].doses[0].units).toBe(2);
	});

	it('gives every dose a date-scoped key', () => {
		const groups = scheduleForDay(data, '2026-07-26');
		expect(groups[0].doses[0].key).toBe('2026-07-26:s1:am');
	});

	it('counts the day total for adherence', () => {
		expect(dosesPerDay(data)).toBe(3);
	});
});

describe('dailyUnits', () => {
	it('multiplies servings by units per serving across every dose', () => {
		const p = product('a', [], { unitsPerServing: 3 });
		const item = stackItem('s1', 'a', [
			{ slotId: 'am', servings: 1, withFood: 'any' },
			{ slotId: 'pm', servings: 2, withFood: 'any' }
		]);
		expect(dailyUnits(item, p)).toBe(9);
	});
});
