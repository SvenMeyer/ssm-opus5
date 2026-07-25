import { activeItems, dailyServings, dailyUnits } from './schedule';
import { amountOf } from './totals';
import type { AppData, Product, StackItem } from './types';

export interface ItemCost {
	stackItemId: string;
	productId: string;
	perDay: number;
	perMonth: number;
	/** Share of the whole stack's daily cost, 0–1. */
	share: number;
}

export interface StackCost {
	perDay: number;
	perMonth: number;
	perYear: number;
	items: ItemCost[];
	currency: string;
}

const DAYS_PER_MONTH = 30.44;

export function unitPrice(product: Product): number {
	return product.unitsPerContainer > 0 ? product.price / product.unitsPerContainer : 0;
}

export function costPerDay(item: StackItem, product: Product): number {
	return unitPrice(product) * dailyUnits(item, product);
}

/** What the stack costs, and which items dominate it. Most expensive first. */
export function stackCost(data: AppData): StackCost {
	const productById = new Map(data.products.map((p) => [p.id, p]));
	const raw = activeItems(data.stack)
		.map((item) => {
			const product = productById.get(item.productId);
			return product ? { item, product, perDay: costPerDay(item, product) } : null;
		})
		.filter((x): x is { item: StackItem; product: Product; perDay: number } => x !== null);

	const perDay = raw.reduce((s, r) => s + r.perDay, 0);

	return {
		perDay,
		perMonth: perDay * DAYS_PER_MONTH,
		perYear: perDay * 365,
		currency: data.settings.currency,
		items: raw
			.map((r) => ({
				stackItemId: r.item.id,
				productId: r.product.id,
				perDay: r.perDay,
				perMonth: r.perDay * DAYS_PER_MONTH,
				share: perDay > 0 ? r.perDay / perDay : 0
			}))
			.sort((a, b) => b.perDay - a.perDay)
	};
}

/**
 * Cost of one canonical unit of a nutrient from a given product — the number that
 * settles "is the expensive magnesium actually expensive?".
 * Returns null when the product does not contain the nutrient.
 */
export function costPerNutrientUnit(product: Product, nutrientId: string): number | null {
	const amount = amountOf(product, nutrientId);
	if (amount <= 0) return null;
	const servingPrice = unitPrice(product) * product.unitsPerServing;
	return servingPrice / amount;
}

/** Catalog products ranked by value for one nutrient, cheapest per unit first. */
export function rankByValue(
	products: Product[],
	nutrientId: string
): { product: Product; costPerUnit: number }[] {
	return products
		.map((product) => ({ product, costPerUnit: costPerNutrientUnit(product, nutrientId) }))
		.filter((x): x is { product: Product; costPerUnit: number } => x.costPerUnit !== null)
		.sort((a, b) => a.costPerUnit - b.costPerUnit);
}

/** Servings a day, across the whole active stack — a rough "pill burden" figure. */
export function dailyPillBurden(data: AppData): number {
	const productById = new Map(data.products.map((p) => [p.id, p]));
	return activeItems(data.stack).reduce((sum, item) => {
		const product = productById.get(item.productId);
		if (!product) return sum;
		// Powders and liquids are not pills; count them as one "thing to do" per serving.
		const countable = product.form === 'powder' || product.form === 'liquid';
		return sum + (countable ? dailyServings(item) : dailyUnits(item, product));
	}, 0);
}
