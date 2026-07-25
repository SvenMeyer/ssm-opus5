import { describe, expect, it } from 'vitest';
import { applyFix, ceilingFindings, evaluateInteractions, findingsForItem } from './interactions';
import { makeData, product, stackItem } from './test-fixtures';
import { dailyTotals } from './totals';
import type { Rule } from './types';

const ZINC_IRON: Rule = {
	id: 'zinc-iron',
	kind: 'conflict',
	title: 'Zinc and iron compete',
	message: 'Separate them.',
	severity: 'warning',
	a: ['zinc'],
	b: ['iron'],
	minSeparationHours: 2
};

const FAT_SOLUBLE: Rule = {
	id: 'fat-soluble',
	kind: 'timing',
	title: 'Fat-soluble vitamins need fat',
	message: 'Take with a meal.',
	severity: 'caution',
	a: ['vitamin-d'],
	wants: { food: 'with' }
};

const D_PLUS_FAT: Rule = {
	id: 'd-fat',
	kind: 'synergy',
	title: 'Vitamin D rides on dietary fat',
	message: 'Pair them.',
	severity: 'info',
	a: ['vitamin-d'],
	b: ['epa']
};

const zincProduct = product('zinc-p', [{ nutrientId: 'zinc', amountPerServing: 25 }]);
const ironProduct = product('iron-p', [{ nutrientId: 'iron', amountPerServing: 25 }]);
const dProduct = product('d-p', [{ nutrientId: 'vitamin-d', amountPerServing: 100 }]);
const fishProduct = product('fish-p', [{ nutrientId: 'epa', amountPerServing: 600 }]);

describe('conflict rules', () => {
	it('fires when the two sides share a slot', () => {
		const data = makeData({
			products: [zincProduct, ironProduct],
			stack: [
				stackItem('s-zinc', 'zinc-p', [{ slotId: 'am', servings: 1, withFood: 'with' }]),
				stackItem('s-iron', 'iron-p', [{ slotId: 'am', servings: 1, withFood: 'with' }])
			]
		});

		const findings = evaluateInteractions(data, [ZINC_IRON]);
		expect(findings).toHaveLength(1);
		expect(findings[0].severity).toBe('warning');
		expect(findings[0].stackItemIds).toEqual(['s-zinc', 's-iron']);
	});

	it('stays quiet when the doses are already far enough apart', () => {
		const data = makeData({
			products: [zincProduct, ironProduct],
			stack: [
				stackItem('s-zinc', 'zinc-p', [{ slotId: 'am', servings: 1, withFood: 'with' }]),
				stackItem('s-iron', 'iron-p', [{ slotId: 'pm', servings: 1, withFood: 'with' }])
			]
		});

		expect(evaluateInteractions(data, [ZINC_IRON])).toHaveLength(0);
	});

	it('offers a fix that actually achieves the required separation', () => {
		const data = makeData({
			products: [zincProduct, ironProduct],
			stack: [
				stackItem('s-zinc', 'zinc-p', [{ slotId: 'am', servings: 1, withFood: 'with' }]),
				stackItem('s-iron', 'iron-p', [{ slotId: 'am', servings: 1, withFood: 'with' }])
			]
		});

		const fix = evaluateInteractions(data, [ZINC_IRON])[0].fix;
		expect(fix).toBeDefined();

		const fixed = { ...data, stack: applyFix(data.stack, fix!) };
		expect(evaluateInteractions(fixed, [ZINC_IRON])).toHaveLength(0);
	});

	it('downgrades to an unfixable note when one product contains both sides', () => {
		const combo = product('combo', [
			{ nutrientId: 'zinc', amountPerServing: 15 },
			{ nutrientId: 'iron', amountPerServing: 10 }
		]);
		const data = makeData({
			products: [combo],
			stack: [stackItem('s-combo', 'combo', [{ slotId: 'am', servings: 1, withFood: 'with' }])]
		});

		const findings = evaluateInteractions(data, [ZINC_IRON]);
		expect(findings).toHaveLength(1);
		expect(findings[0].severity).toBe('info');
		expect(findings[0].fix).toBeUndefined();
	});

	it('ignores paused items', () => {
		const data = makeData({
			products: [zincProduct, ironProduct],
			stack: [
				stackItem('s-zinc', 'zinc-p', [{ slotId: 'am', servings: 1, withFood: 'with' }]),
				stackItem('s-iron', 'iron-p', [{ slotId: 'am', servings: 1, withFood: 'with' }], {
					status: 'paused'
				})
			]
		});

		expect(evaluateInteractions(data, [ZINC_IRON])).toHaveLength(0);
	});
});

describe('timing rules', () => {
	it('flags a fat-soluble vitamin sitting in a fasted slot', () => {
		const data = makeData({
			products: [dProduct],
			stack: [stackItem('s-d', 'd-p', [{ slotId: 'fasting', servings: 1, withFood: 'any' }])]
		});

		const findings = evaluateInteractions(data, [FAT_SOLUBLE]);
		expect(findings).toHaveLength(1);
		expect(findings[0].fix?.type).toBe('move-dose');
	});

	it('accepts a meal slot even when the dose itself says "any"', () => {
		const data = makeData({
			products: [dProduct],
			stack: [stackItem('s-d', 'd-p', [{ slotId: 'am', servings: 1, withFood: 'any' }])]
		});

		expect(evaluateInteractions(data, [FAT_SOLUBLE])).toHaveLength(0);
	});
});

describe('fix refinement across the whole rulebook', () => {
	const IRON_FASTED: Rule = {
		id: 'iron-fasted',
		kind: 'timing',
		title: 'Iron absorbs best fasted',
		message: 'Take it away from food.',
		severity: 'info',
		a: ['iron'],
		wants: { food: 'without' }
	};

	it('never proposes a move that walks into another rule', () => {
		// Iron wants an empty stomach; the only fasted slot is 06:30, and zinc sits at
		// 08:00 — moving there would trade a timing note for a mineral conflict.
		const data = makeData({
			products: [zincProduct, ironProduct],
			stack: [
				stackItem('s-zinc', 'zinc-p', [{ slotId: 'fasting', servings: 1, withFood: 'without' }]),
				stackItem('s-iron', 'iron-p', [{ slotId: 'am', servings: 1, withFood: 'with' }])
			]
		});

		const finding = evaluateInteractions(data, [IRON_FASTED, ZINC_IRON]).find(
			(f) => f.ruleId === 'iron-fasted'
		);

		expect(finding).toBeDefined();
		if (finding?.fix && finding.fix.type === 'move-dose') {
			const after = { ...data, stack: applyFix(data.stack, finding.fix) };
			const before = evaluateInteractions(data, [IRON_FASTED, ZINC_IRON]).filter(
				(f) => !f.positive
			).length;
			const now = evaluateInteractions(after, [IRON_FASTED, ZINC_IRON]).filter(
				(f) => !f.positive
			).length;
			expect(now).toBeLessThan(before);
		}
	});

	it('falls back to marking the dose when the day has no suitable slot', () => {
		// Every slot is a meal slot, so "take it fasted" has nowhere to move to — but
		// taking it half an hour before the meal is still a real answer.
		const mealsOnly = makeData({
			slots: [
				{ id: 'a', label: 'A', time: '08:00', kind: 'meal' },
				{ id: 'b', label: 'B', time: '13:00', kind: 'meal' },
				{ id: 'c', label: 'C', time: '19:00', kind: 'meal' }
			],
			products: [ironProduct],
			stack: [stackItem('s-iron', 'iron-p', [{ slotId: 'a', servings: 1, withFood: 'with' }])]
		});

		const finding = evaluateInteractions(mealsOnly, [IRON_FASTED])[0];
		expect(finding.fix?.type).toBe('set-food');
	});

	it('drops the fix button when every destination trades one problem for another', () => {
		const calciumProduct = product('cal-p', [{ nutrientId: 'calcium', amountPerServing: 500 }]);
		const CALCIUM_IRON: Rule = {
			id: 'calcium-iron',
			kind: 'conflict',
			title: 'Calcium blocks iron',
			message: 'Keep them apart.',
			severity: 'warning',
			a: ['calcium'],
			b: ['iron'],
			minSeparationHours: 3
		};

		// Iron clashes with zinc where it is, and calcium occupies every slot it could
		// move to. There is no good answer, so the honest thing is not to offer one.
		const data = makeData({
			products: [zincProduct, ironProduct, calciumProduct],
			stack: [
				stackItem('s-zinc', 'zinc-p', [{ slotId: 'am', servings: 1, withFood: 'with' }]),
				stackItem('s-iron', 'iron-p', [{ slotId: 'am', servings: 1, withFood: 'with' }]),
				stackItem('s-cal', 'cal-p', [
					{ slotId: 'noon', servings: 1, withFood: 'with' },
					{ slotId: 'pm', servings: 1, withFood: 'with' },
					{ slotId: 'night', servings: 1, withFood: 'with' }
				])
			]
		});

		const finding = evaluateInteractions(data, [ZINC_IRON, CALCIUM_IRON]).find(
			(f) => f.ruleId === 'zinc-iron'
		);
		expect(finding).toBeDefined();
		expect(finding?.fix).toBeUndefined();
	});
});

describe('synergy rules', () => {
	it('reads as a suggestion when the pair is split across slots', () => {
		const data = makeData({
			products: [dProduct, fishProduct],
			stack: [
				stackItem('s-d', 'd-p', [{ slotId: 'am', servings: 1, withFood: 'with' }]),
				stackItem('s-fish', 'fish-p', [{ slotId: 'pm', servings: 1, withFood: 'with' }])
			]
		});

		const finding = evaluateInteractions(data, [D_PLUS_FAT])[0];
		expect(finding.positive).toBe(false);
		expect(finding.fix).toBeDefined();
	});

	it('reads as a win once they share a slot', () => {
		const data = makeData({
			products: [dProduct, fishProduct],
			stack: [
				stackItem('s-d', 'd-p', [{ slotId: 'am', servings: 1, withFood: 'with' }]),
				stackItem('s-fish', 'fish-p', [{ slotId: 'am', servings: 1, withFood: 'with' }])
			]
		});

		expect(evaluateInteractions(data, [D_PLUS_FAT])[0].positive).toBe(true);
	});
});

describe('applyFix', () => {
	it('merges servings when a dose lands on a slot that already has one', () => {
		const stack = [
			stackItem('s1', 'p1', [
				{ slotId: 'am', servings: 1, withFood: 'any' },
				{ slotId: 'pm', servings: 2, withFood: 'any' }
			])
		];

		const result = applyFix(stack, {
			type: 'move-dose',
			stackItemId: 's1',
			fromSlotId: 'am',
			toSlotId: 'pm',
			label: 'move'
		});

		expect(result[0].doses).toEqual([{ slotId: 'pm', servings: 3, withFood: 'any' }]);
	});

	it('sets the food requirement without touching other doses', () => {
		const stack = [
			stackItem('s1', 'p1', [
				{ slotId: 'am', servings: 1, withFood: 'any' },
				{ slotId: 'pm', servings: 1, withFood: 'any' }
			])
		];

		const result = applyFix(stack, {
			type: 'set-food',
			stackItemId: 's1',
			slotId: 'am',
			withFood: 'with',
			label: 'mark'
		});

		expect(result[0].doses[0].withFood).toBe('with');
		expect(result[0].doses[1].withFood).toBe('any');
	});

	it('leaves the stack alone when the dose to move no longer exists', () => {
		const stack = [stackItem('s1', 'p1', [{ slotId: 'am', servings: 1, withFood: 'any' }])];
		const result = applyFix(stack, {
			type: 'move-dose',
			stackItemId: 's1',
			fromSlotId: 'noon',
			toSlotId: 'pm',
			label: 'move'
		});
		expect(result[0].doses).toEqual(stack[0].doses);
	});
});

describe('ceilingFindings', () => {
	it('turns a breached upper limit into a warning finding', () => {
		const data = makeData({
			products: [product('mag', [{ nutrientId: 'magnesium', amountPerServing: 600 }])],
			stack: [stackItem('s-mag', 'mag', [{ slotId: 'am', servings: 1, withFood: 'any' }])]
		});

		const findings = ceilingFindings(dailyTotals(data));
		expect(findings).toHaveLength(1);
		expect(findings[0].severity).toBe('warning');
		expect(findingsForItem(findings, 's-mag')).toHaveLength(1);
	});
});
