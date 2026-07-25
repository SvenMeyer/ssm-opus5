import { CATEGORY_ORDER, getNutrient } from './nutrients';
import { activeItems, dailyServings } from './schedule';
import type { AppData, Nutrient, NutrientCategory, Product, StackItem } from './types';

/**
 * Where a nutrient amount sits relative to its reference values.
 *
 * `unrated` is deliberately distinct from `ok`: "we have no reference value for this"
 * must never be shown as "you are fine".
 */
export type NutrientStatus = 'none' | 'low' | 'ok' | 'high' | 'over' | 'unrated';

export interface Contribution {
	stackItemId: string;
	productId: string;
	/** Amount this product contributes, in the nutrient's canonical unit. */
	amount: number;
	servings: number;
}

export interface NutrientTotal {
	nutrient: Nutrient;
	amount: number;
	contributions: Contribution[];
	/** Null when no reference value exists. */
	percentRda: number | null;
	percentUl: number | null;
	status: NutrientStatus;
}

/** Fraction of the UL at which we start warning. */
const HIGH_THRESHOLD = 0.8;

export function statusFor(nutrient: Nutrient, amount: number): NutrientStatus {
	if (amount <= 0) return 'none';
	if (nutrient.ul !== undefined && amount > nutrient.ul) return 'over';
	if (nutrient.ul !== undefined && amount >= nutrient.ul * HIGH_THRESHOLD) return 'high';
	if (nutrient.rda !== undefined) return amount >= nutrient.rda ? 'ok' : 'low';
	return 'unrated';
}

export const STATUS_LABEL: Record<NutrientStatus, string> = {
	none: 'Not in stack',
	low: 'Below target',
	ok: 'Target met',
	high: 'Near ceiling',
	over: 'Over ceiling',
	unrated: 'No reference value'
};

export interface TotalsOptions {
	/** Only count items whose doses fall in these slots. Omit for the whole day. */
	slotIds?: string[];
	/** Include paused stack items. Default false. */
	includePaused?: boolean;
}

/**
 * Aggregate what the stack delivers in a day, per nutrient.
 *
 * This is the calculation the whole safety layer rests on: two products each at a
 * sane dose can put you over a ceiling together, and only the sum shows it.
 */
export function dailyTotals(data: AppData, options: TotalsOptions = {}): NutrientTotal[] {
	const productById = new Map(data.products.map((p) => [p.id, p]));
	const items: StackItem[] = options.includePaused ? data.stack : activeItems(data.stack);

	const acc = new Map<string, { amount: number; contributions: Contribution[] }>();

	for (const item of items) {
		const product = productById.get(item.productId);
		if (!product) continue;

		const servings = options.slotIds
			? item.doses
					.filter((d) => options.slotIds!.includes(d.slotId))
					.reduce((s, d) => s + d.servings, 0)
			: dailyServings(item);
		if (servings === 0) continue;

		for (const ing of product.ingredients) {
			if (!getNutrient(ing.nutrientId)) continue;
			const entry = acc.get(ing.nutrientId) ?? { amount: 0, contributions: [] };
			const amount = ing.amountPerServing * servings;
			entry.amount += amount;
			entry.contributions.push({
				stackItemId: item.id,
				productId: product.id,
				amount,
				servings
			});
			acc.set(ing.nutrientId, entry);
		}
	}

	const totals: NutrientTotal[] = [];
	for (const [nutrientId, entry] of acc) {
		const nutrient = getNutrient(nutrientId);
		if (!nutrient) continue;
		totals.push({
			nutrient,
			amount: round(entry.amount),
			contributions: entry.contributions.sort((a, b) => b.amount - a.amount),
			percentRda: nutrient.rda ? (entry.amount / nutrient.rda) * 100 : null,
			percentUl: nutrient.ul ? (entry.amount / nutrient.ul) * 100 : null,
			status: statusFor(nutrient, entry.amount)
		});
	}

	return totals.sort(compareForDisplay);
}

/** Everything the stack delivers of one nutrient, or null if it delivers none. */
export function totalFor(totals: NutrientTotal[], nutrientId: string): NutrientTotal | null {
	return totals.find((t) => t.nutrient.id === nutrientId) ?? null;
}

export interface TotalsSummary {
	over: NutrientTotal[];
	high: NutrientTotal[];
	met: number;
	tracked: number;
}

/** The headline the Today page and the Nutrients header both show. */
export function summarise(totals: NutrientTotal[]): TotalsSummary {
	const tracked = totals.filter((t) => t.nutrient.rda !== undefined || t.nutrient.ul !== undefined);
	return {
		over: totals.filter((t) => t.status === 'over'),
		high: totals.filter((t) => t.status === 'high'),
		met: totals.filter((t) => t.status === 'ok' || t.status === 'high' || t.status === 'over')
			.length,
		tracked: tracked.length
	};
}

export function groupByCategory(
	totals: NutrientTotal[]
): { category: NutrientCategory; totals: NutrientTotal[] }[] {
	return CATEGORY_ORDER.map((category) => ({
		category,
		totals: totals.filter((t) => t.nutrient.category === category)
	})).filter((g) => g.totals.length > 0);
}

/** Products in the catalog that contain a given nutrient, most first. */
export function productsWith(products: Product[], nutrientId: string): Product[] {
	return products
		.filter((p) => p.ingredients.some((i) => i.nutrientId === nutrientId))
		.sort((a, b) => amountOf(b, nutrientId) - amountOf(a, nutrientId));
}

export function amountOf(product: Product, nutrientId: string): number {
	return product.ingredients.find((i) => i.nutrientId === nutrientId)?.amountPerServing ?? 0;
}

const STATUS_RANK: Record<NutrientStatus, number> = {
	over: 0,
	high: 1,
	low: 2,
	ok: 3,
	unrated: 4,
	none: 5
};

/** Problems first, then by category order, then alphabetically. */
function compareForDisplay(a: NutrientTotal, b: NutrientTotal): number {
	const byStatus = STATUS_RANK[a.status] - STATUS_RANK[b.status];
	if (byStatus !== 0) return byStatus;
	const byCategory =
		CATEGORY_ORDER.indexOf(a.nutrient.category) - CATEGORY_ORDER.indexOf(b.nutrient.category);
	if (byCategory !== 0) return byCategory;
	return a.nutrient.name.localeCompare(b.nutrient.name);
}

function round(n: number): number {
	return Math.round(n * 1000) / 1000;
}
