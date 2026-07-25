import { addDays, today } from '$lib/domain/date';
import type { StackItem } from '$lib/domain/types';

/**
 * The demo stack.
 *
 * It is deliberately imperfect. A stack with nothing wrong in it would make the
 * Nutrients and Interactions pages look empty and pointless, so this one carries four
 * planted problems that a real person would plausibly have:
 *
 *   1. Magnesium 600 mg/day across two products — over the 350 mg supplemental ceiling.
 *   2. Zinc and iron both at breakfast — direct absorption competition.
 *   3. Vitamin D3 + K2 in the fasted Wake slot — fat-soluble, taken without fat.
 *   4. Zinc at 40 mg/day across three products — sitting exactly on its ceiling.
 *
 * Fixing #3 in the UI also flips the "vitamin D rides on dietary fat" synergy from a
 * suggestion to a win, which is the clearest demonstration of the engine being live.
 */
export function seedStack(): StackItem[] {
	const start = (daysAgo: number) => addDays(today(), -daysAgo);

	return [
		{
			id: 's-d3k2',
			productId: 'p-d3k2',
			status: 'active',
			doses: [{ slotId: 'wake', servings: 1, withFood: 'any' }],
			startedOn: start(240),
			unitsOnHand: 74,
			goalIds: ['immunity', 'longevity']
		},
		{
			id: 's-probiotic',
			productId: 'p-probiotic',
			status: 'active',
			doses: [{ slotId: 'wake', servings: 1, withFood: 'without' }],
			startedOn: start(96),
			unitsOnHand: 11,
			goalIds: ['immunity'],
			notes: 'Keep in the fridge door.'
		},
		{
			id: 's-omega3',
			productId: 'p-omega3',
			status: 'active',
			doses: [{ slotId: 'breakfast', servings: 1, withFood: 'with' }],
			startedOn: start(310),
			unitsOnHand: 96,
			goalIds: ['longevity', 'cognition', 'joints']
		},
		{
			id: 's-bcomplex',
			productId: 'p-bcomplex',
			status: 'active',
			doses: [{ slotId: 'breakfast', servings: 1, withFood: 'with' }],
			startedOn: start(120),
			unitsOnHand: 38,
			goalIds: ['energy']
		},
		{
			id: 's-zinc',
			productId: 'p-zinc',
			status: 'active',
			doses: [{ slotId: 'breakfast', servings: 1, withFood: 'with' }],
			startedOn: start(64),
			unitsOnHand: 52,
			goalIds: ['immunity']
		},
		{
			id: 's-iron',
			productId: 'p-iron',
			status: 'active',
			doses: [{ slotId: 'breakfast', servings: 1, withFood: 'with' }],
			startedOn: start(45),
			unitsOnHand: 61,
			goalIds: ['energy'],
			notes: 'Ferritin was 22 in March — retest in autumn.'
		},
		{
			id: 's-curcumin',
			productId: 'p-curcumin',
			status: 'active',
			doses: [{ slotId: 'midday', servings: 1, withFood: 'with' }],
			startedOn: start(150),
			unitsOnHand: 24,
			goalIds: ['joints']
		},
		{
			id: 's-creatine',
			productId: 'p-creatine',
			status: 'active',
			doses: [{ slotId: 'training', servings: 1, withFood: 'any' }],
			startedOn: start(400),
			unitsOnHand: 19,
			goalIds: ['energy'],
			notes: 'Into the shaker with the electrolytes.'
		},
		{
			id: 's-calmagzinc',
			productId: 'p-calmagzinc',
			status: 'active',
			doses: [{ slotId: 'dinner', servings: 1, withFood: 'with' }],
			startedOn: start(28),
			unitsOnHand: 66,
			goalIds: ['longevity'],
			notes: 'Bought on offer. Probably redundant with the glycinate.'
		},
		{
			id: 's-ashwagandha',
			productId: 'p-ashwagandha',
			status: 'active',
			doses: [{ slotId: 'dinner', servings: 1, withFood: 'with' }],
			startedOn: start(52),
			unitsOnHand: 8,
			goalIds: ['sleep']
		},
		{
			id: 's-mag',
			productId: 'p-mag-gly',
			status: 'active',
			doses: [{ slotId: 'bedtime', servings: 1, withFood: 'any' }],
			startedOn: start(200),
			unitsOnHand: 112,
			goalIds: ['sleep', 'longevity']
		},
		{
			id: 's-theanine',
			productId: 'p-theanine',
			status: 'active',
			doses: [{ slotId: 'bedtime', servings: 1, withFood: 'any' }],
			startedOn: start(75),
			unitsOnHand: 3,
			goalIds: ['sleep', 'cognition']
		},
		{
			id: 's-rhodiola',
			productId: 'p-rhodiola',
			status: 'paused',
			doses: [{ slotId: 'wake', servings: 1, withFood: 'without' }],
			startedOn: start(180),
			unitsOnHand: 41,
			goalIds: ['energy'],
			notes: 'Paused in May — made the afternoons wired rather than sharp.'
		},
		{
			id: 's-collagen',
			productId: 'p-collagen',
			status: 'paused',
			doses: [{ slotId: 'breakfast', servings: 1, withFood: 'any' }],
			startedOn: start(300),
			unitsOnHand: 0,
			goalIds: ['joints'],
			notes: 'Ran out. Undecided whether it was doing anything.'
		}
	];
}
