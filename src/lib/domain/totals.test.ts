import { describe, expect, it } from 'vitest';
import { getNutrient } from './nutrients';
import { dailyTotals, statusFor, summarise, totalFor } from './totals';
import { makeData, product, stackItem } from './test-fixtures';

describe('statusFor', () => {
	const zinc = getNutrient('zinc')!;

	it('reports nothing at all as `none`, not as a shortfall', () => {
		expect(statusFor(zinc, 0)).toBe('none');
	});

	it('flags below the RDA as low and at the RDA as ok', () => {
		expect(statusFor(zinc, 5)).toBe('low');
		expect(statusFor(zinc, 11)).toBe('ok');
	});

	it('warns from 80% of the ceiling and breaches above it', () => {
		expect(statusFor(zinc, 31)).toBe('ok');
		expect(statusFor(zinc, 32)).toBe('high');
		expect(statusFor(zinc, 40)).toBe('high');
		expect(statusFor(zinc, 41)).toBe('over');
	});

	it('never calls an unreferenced nutrient `ok`', () => {
		const creatine = getNutrient('creatine')!;
		expect(statusFor(creatine, 5)).toBe('unrated');
	});
});

describe('dailyTotals', () => {
	it('sums one nutrient across separate products', () => {
		const data = makeData({
			products: [
				product('a', [{ nutrientId: 'magnesium', amountPerServing: 200 }]),
				product('b', [{ nutrientId: 'magnesium', amountPerServing: 400 }])
			],
			stack: [
				stackItem('s1', 'a', [{ slotId: 'am', servings: 1, withFood: 'any' }]),
				stackItem('s2', 'b', [{ slotId: 'pm', servings: 1, withFood: 'any' }])
			]
		});

		const mag = totalFor(dailyTotals(data), 'magnesium');
		expect(mag?.amount).toBe(600);
		// 600 mg is past the 350 mg supplemental ceiling — the case the whole page exists for.
		expect(mag?.status).toBe('over');
		expect(mag?.contributions).toHaveLength(2);
	});

	it('multiplies by servings and by doses per day', () => {
		const data = makeData({
			products: [product('a', [{ nutrientId: 'zinc', amountPerServing: 10 }])],
			stack: [
				stackItem('s1', 'a', [
					{ slotId: 'am', servings: 1, withFood: 'any' },
					{ slotId: 'pm', servings: 0.5, withFood: 'any' }
				])
			]
		});

		expect(totalFor(dailyTotals(data), 'zinc')?.amount).toBe(15);
	});

	it('ignores paused items unless asked for them', () => {
		const data = makeData({
			products: [product('a', [{ nutrientId: 'zinc', amountPerServing: 10 }])],
			stack: [
				{
					...stackItem('s1', 'a', [{ slotId: 'am', servings: 1, withFood: 'any' }]),
					status: 'paused'
				}
			]
		});

		expect(dailyTotals(data)).toHaveLength(0);
		expect(totalFor(dailyTotals(data, { includePaused: true }), 'zinc')?.amount).toBe(10);
	});

	it('restricts to given slots when asked', () => {
		const data = makeData({
			products: [product('a', [{ nutrientId: 'zinc', amountPerServing: 10 }])],
			stack: [
				stackItem('s1', 'a', [
					{ slotId: 'am', servings: 1, withFood: 'any' },
					{ slotId: 'pm', servings: 1, withFood: 'any' }
				])
			]
		});

		expect(totalFor(dailyTotals(data, { slotIds: ['am'] }), 'zinc')?.amount).toBe(10);
	});

	it('sorts problems to the top', () => {
		const data = makeData({
			products: [
				product('a', [{ nutrientId: 'magnesium', amountPerServing: 600 }]),
				product('b', [{ nutrientId: 'vitamin-c', amountPerServing: 100 }])
			],
			stack: [
				stackItem('s1', 'a', [{ slotId: 'am', servings: 1, withFood: 'any' }]),
				stackItem('s2', 'b', [{ slotId: 'am', servings: 1, withFood: 'any' }])
			]
		});

		expect(dailyTotals(data)[0].nutrient.id).toBe('magnesium');
	});

	it('drops ingredients referencing unknown nutrients rather than crashing', () => {
		const data = makeData({
			products: [product('a', [{ nutrientId: 'unobtainium', amountPerServing: 1 }])],
			stack: [stackItem('s1', 'a', [{ slotId: 'am', servings: 1, withFood: 'any' }])]
		});

		expect(dailyTotals(data)).toHaveLength(0);
	});
});

describe('summarise', () => {
	it('counts breaches and met targets separately', () => {
		const data = makeData({
			products: [
				product('a', [{ nutrientId: 'magnesium', amountPerServing: 600 }]),
				product('b', [{ nutrientId: 'vitamin-c', amountPerServing: 100 }])
			],
			stack: [
				stackItem('s1', 'a', [{ slotId: 'am', servings: 1, withFood: 'any' }]),
				stackItem('s2', 'b', [{ slotId: 'am', servings: 1, withFood: 'any' }])
			]
		});

		const summary = summarise(dailyTotals(data));
		expect(summary.over.map((t) => t.nutrient.id)).toEqual(['magnesium']);
		expect(summary.met).toBe(2);
		expect(summary.tracked).toBe(2);
	});
});
