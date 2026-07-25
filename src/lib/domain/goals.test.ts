import { describe, expect, it } from 'vitest';
import { allGoalCoverage, goalCoverage, isCovered } from './goals';
import { getNutrient } from './nutrients';
import { makeData, product, stackItem } from './test-fixtures';
import { dailyTotals } from './totals';
import type { Goal } from './types';

const SLEEP: Goal = {
	id: 'sleep',
	name: 'Sleep',
	blurb: '',
	color: '#000',
	nutrientIds: ['magnesium', 'glycine', 'melatonin']
};

describe('isCovered', () => {
	it('needs half the RDA before a nutrient counts as covered', () => {
		const magnesium = getNutrient('magnesium')!;
		expect(isCovered(magnesium, 100)).toBe(false);
		expect(isCovered(magnesium, 210)).toBe(true);
	});

	it('counts any amount for a nutrient with no RDA to hit', () => {
		expect(isCovered(getNutrient('glycine')!, 0.1)).toBe(true);
		expect(isCovered(getNutrient('glycine')!, 0)).toBe(false);
	});
});

describe('goalCoverage', () => {
	const data = makeData({
		products: [
			product('mag', [{ nutrientId: 'magnesium', amountPerServing: 300 }]),
			product('gly', [{ nutrientId: 'glycine', amountPerServing: 3 }])
		],
		stack: [
			stackItem('s-mag', 'mag', [{ slotId: 'night', servings: 1, withFood: 'any' }], {
				goalIds: ['sleep']
			}),
			stackItem('s-gly', 'gly', [{ slotId: 'night', servings: 1, withFood: 'any' }])
		],
		goals: [SLEEP]
	});

	it('scores the share of the goal nutrients the stack delivers', () => {
		const coverage = goalCoverage(SLEEP, dailyTotals(data), data.stack);
		expect(coverage.coverage).toBeCloseTo(2 / 3);
		expect(coverage.missing.map((n) => n.nutrient.id)).toEqual(['melatonin']);
	});

	it('tracks assignment separately from coverage', () => {
		const coverage = goalCoverage(SLEEP, dailyTotals(data), data.stack);
		// Glycine covers the goal chemically but the user never assigned it.
		expect(coverage.itemCount).toBe(1);
		expect(coverage.covered).toHaveLength(2);
	});

	it('ranks goals by coverage', () => {
		const withEmpty = {
			...data,
			goals: [SLEEP, { ...SLEEP, id: 'empty', nutrientIds: ['melatonin'] }]
		};
		const ranked = allGoalCoverage(withEmpty, dailyTotals(withEmpty));
		expect(ranked[0].goal.id).toBe('sleep');
		expect(ranked[1].coverage).toBe(0);
	});
});
