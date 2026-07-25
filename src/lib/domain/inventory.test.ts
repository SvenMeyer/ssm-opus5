import { describe, expect, it } from 'vitest';
import { inventoryFor, levelFor, nextRunout, reorderList } from './inventory';
import { makeData, product, stackItem } from './test-fixtures';

describe('inventoryFor', () => {
	it('projects days remaining from the daily unit burn', () => {
		const p = product('a', [], { unitsPerServing: 2, unitsPerContainer: 120 });
		const item = stackItem('s1', 'a', [{ slotId: 'am', servings: 1, withFood: 'any' }], {
			unitsOnHand: 30
		});

		const status = inventoryFor(item, p, '2026-07-26');
		expect(status.unitsPerDay).toBe(2);
		expect(status.daysRemaining).toBe(15);
		expect(status.runoutDate).toBe('2026-08-10');
		expect(status.fill).toBeCloseTo(0.25);
	});

	it('rounds down — a partial day is not a day of cover', () => {
		const p = product('a', [], { unitsPerServing: 3 });
		const item = stackItem('s1', 'a', [{ slotId: 'am', servings: 1, withFood: 'any' }], {
			unitsOnHand: 8
		});
		expect(inventoryFor(item, p, '2026-07-26').daysRemaining).toBe(2);
	});

	it('reports no runout for an item that is scheduled zero times a day', () => {
		const p = product('a', []);
		const item = stackItem('s1', 'a', [], { unitsOnHand: 10 });
		const status = inventoryFor(item, p, '2026-07-26');
		expect(status.daysRemaining).toBeNull();
		expect(status.runoutDate).toBeNull();
		expect(status.level).toBe('ok');
	});
});

describe('levelFor', () => {
	it('bands days remaining into stock levels', () => {
		expect(levelFor(0)).toBe('out');
		expect(levelFor(3)).toBe('critical');
		expect(levelFor(10)).toBe('low');
		expect(levelFor(40)).toBe('ok');
		expect(levelFor(null)).toBe('ok');
	});
});

describe('reorderList', () => {
	const data = makeData({
		products: [
			product('a', [], { unitsPerContainer: 60 }),
			product('b', [], { unitsPerContainer: 60 })
		],
		stack: [
			stackItem('s-low', 'a', [{ slotId: 'am', servings: 1, withFood: 'any' }], {
				unitsOnHand: 4
			}),
			stackItem('s-fine', 'b', [{ slotId: 'am', servings: 1, withFood: 'any' }], {
				unitsOnHand: 55
			})
		]
	});

	it('returns only what runs out inside the window, soonest first', () => {
		const list = reorderList(data, 14, '2026-07-26');
		expect(list.map((s) => s.stackItemId)).toEqual(['s-low']);
	});

	it('names the next thing to run out', () => {
		expect(nextRunout(data, '2026-07-26')?.stackItemId).toBe('s-low');
	});
});
