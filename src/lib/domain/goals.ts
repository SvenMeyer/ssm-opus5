import { getNutrient } from './nutrients';
import { activeItems } from './schedule';
import type { NutrientTotal } from './totals';
import type { AppData, Goal, Nutrient, StackItem } from './types';

export interface GoalNutrientState {
	nutrient: Nutrient;
	/** Amount the stack delivers, in the nutrient's canonical unit. */
	amount: number;
	/** True when the stack delivers a meaningful amount of it. */
	covered: boolean;
}

export interface GoalCoverage {
	goal: Goal;
	/** 0–1 — the share of the goal's nutrients the stack actually delivers. */
	coverage: number;
	nutrients: GoalNutrientState[];
	covered: GoalNutrientState[];
	missing: GoalNutrientState[];
	/** Stack items the user has explicitly assigned to this goal. */
	items: StackItem[];
	/** Daily cost attributable to this goal's assigned items. */
	itemCount: number;
}

/**
 * A nutrient counts as covered when the stack supplies at least this share of its RDA.
 * Nutrients without an RDA count as covered whenever any amount is present — for a
 * botanical there is no target to hit, only presence or absence.
 */
const COVERAGE_THRESHOLD = 0.5;

export function isCovered(nutrient: Nutrient, amount: number): boolean {
	if (amount <= 0) return false;
	if (nutrient.rda === undefined) return true;
	return amount >= nutrient.rda * COVERAGE_THRESHOLD;
}

export function goalCoverage(
	goal: Goal,
	totals: NutrientTotal[],
	stack: StackItem[]
): GoalCoverage {
	const amountById = new Map(totals.map((t) => [t.nutrient.id, t.amount]));

	const nutrients: GoalNutrientState[] = goal.nutrientIds
		.map((id) => {
			const nutrient = getNutrient(id);
			if (!nutrient) return null;
			const amount = amountById.get(id) ?? 0;
			return { nutrient, amount, covered: isCovered(nutrient, amount) };
		})
		.filter((x): x is GoalNutrientState => x !== null);

	const covered = nutrients.filter((n) => n.covered);
	const items = activeItems(stack).filter((i) => i.goalIds.includes(goal.id));

	return {
		goal,
		coverage: nutrients.length === 0 ? 0 : covered.length / nutrients.length,
		nutrients,
		covered,
		missing: nutrients.filter((n) => !n.covered),
		items,
		itemCount: items.length
	};
}

export function allGoalCoverage(data: AppData, totals: NutrientTotal[]): GoalCoverage[] {
	return data.goals
		.map((goal) => goalCoverage(goal, totals, data.stack))
		.sort((a, b) => b.coverage - a.coverage);
}

/** Goals a given stack item has been assigned to. */
export function goalsForItem(goals: Goal[], item: StackItem): Goal[] {
	return goals.filter((g) => item.goalIds.includes(g.id));
}
