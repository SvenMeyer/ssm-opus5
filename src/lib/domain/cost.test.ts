import { describe, expect, it } from 'vitest';
import { costPerDay, costPerNutrientUnit, dailyPillBurden, rankByValue, stackCost } from './cost';
import { makeData, product, stackItem } from './test-fixtures';

describe('costPerDay', () => {
	it('prices the units actually consumed, not the container', () => {
		const p = product('a', [], { price: 30, unitsPerContainer: 60, unitsPerServing: 2 });
		const item = stackItem('s1', 'a', [{ slotId: 'am', servings: 1, withFood: 'any' }]);
		// 0.50 per unit × 2 units a day
		expect(costPerDay(item, p)).toBeCloseTo(1);
	});
});

describe('stackCost', () => {
	const data = makeData({
		products: [
			product('cheap', [], { price: 10, unitsPerContainer: 100 }),
			product('dear', [], { price: 90, unitsPerContainer: 30 })
		],
		stack: [
			stackItem('s-cheap', 'cheap', [{ slotId: 'am', servings: 1, withFood: 'any' }]),
			stackItem('s-dear', 'dear', [{ slotId: 'am', servings: 1, withFood: 'any' }])
		]
	});

	it('totals the active stack and ranks the biggest spender first', () => {
		const cost = stackCost(data);
		expect(cost.perDay).toBeCloseTo(3.1);
		expect(cost.items[0].stackItemId).toBe('s-dear');
		expect(cost.items[0].share).toBeCloseTo(3 / 3.1);
	});

	it('scales to a month and a year', () => {
		const cost = stackCost(data);
		expect(cost.perMonth).toBeCloseTo(3.1 * 30.44);
		expect(cost.perYear).toBeCloseTo(3.1 * 365);
	});
});

describe('costPerNutrientUnit', () => {
	it('compares two products on what the active ingredient actually costs', () => {
		const cheapPerMg = product('a', [{ nutrientId: 'magnesium', amountPerServing: 200 }], {
			price: 20,
			unitsPerContainer: 100
		});
		const dearPerMg = product('b', [{ nutrientId: 'magnesium', amountPerServing: 100 }], {
			price: 30,
			unitsPerContainer: 100
		});

		expect(costPerNutrientUnit(cheapPerMg, 'magnesium')).toBeCloseTo(0.001);
		expect(costPerNutrientUnit(dearPerMg, 'magnesium')).toBeCloseTo(0.003);
		expect(rankByValue([dearPerMg, cheapPerMg], 'magnesium')[0].product.id).toBe('a');
	});

	it('returns null for a product that does not contain the nutrient', () => {
		expect(costPerNutrientUnit(product('a', []), 'magnesium')).toBeNull();
	});
});

describe('dailyPillBurden', () => {
	it('counts pills individually but a powder as one act', () => {
		const data = makeData({
			products: [
				product('pills', [], { form: 'capsule', unitsPerServing: 3 }),
				product('scoop', [], { form: 'powder', unitsPerServing: 1 })
			],
			stack: [
				stackItem('s1', 'pills', [{ slotId: 'am', servings: 1, withFood: 'any' }]),
				stackItem('s2', 'scoop', [{ slotId: 'am', servings: 2, withFood: 'any' }])
			]
		});

		expect(dailyPillBurden(data)).toBe(5);
	});
});
