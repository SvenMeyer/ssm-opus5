import { addDays, today, type IsoDate } from './date';
import { activeItems, dailyUnits } from './schedule';
import type { AppData, Product, StackItem } from './types';

export type StockLevel = 'out' | 'critical' | 'low' | 'ok';

export interface InventoryStatus {
	stackItemId: string;
	productId: string;
	unitsOnHand: number;
	unitsPerDay: number;
	/** Null when the item is scheduled zero times a day and therefore never runs out. */
	daysRemaining: number | null;
	runoutDate: IsoDate | null;
	level: StockLevel;
	/** Fraction of a full container still on hand, 0–1. */
	fill: number;
}

export const LOW_STOCK_DAYS = 14;
export const CRITICAL_STOCK_DAYS = 5;

export function levelFor(daysRemaining: number | null): StockLevel {
	if (daysRemaining === null) return 'ok';
	if (daysRemaining <= 0) return 'out';
	if (daysRemaining <= CRITICAL_STOCK_DAYS) return 'critical';
	if (daysRemaining <= LOW_STOCK_DAYS) return 'low';
	return 'ok';
}

export function inventoryFor(
	item: StackItem,
	product: Product,
	from: IsoDate = today()
): InventoryStatus {
	const unitsPerDay = dailyUnits(item, product);
	const daysRemaining = unitsPerDay > 0 ? Math.floor(item.unitsOnHand / unitsPerDay) : null;
	return {
		stackItemId: item.id,
		productId: product.id,
		unitsOnHand: item.unitsOnHand,
		unitsPerDay,
		daysRemaining,
		runoutDate: daysRemaining === null ? null : addDays(from, daysRemaining),
		level: levelFor(daysRemaining),
		fill: product.unitsPerContainer > 0 ? item.unitsOnHand / product.unitsPerContainer : 0
	};
}

export function inventoryForStack(data: AppData, from: IsoDate = today()): InventoryStatus[] {
	const productById = new Map(data.products.map((p) => [p.id, p]));
	return activeItems(data.stack)
		.map((item) => {
			const product = productById.get(item.productId);
			return product ? inventoryFor(item, product, from) : null;
		})
		.filter((s): s is InventoryStatus => s !== null)
		.sort((a, b) => (a.daysRemaining ?? Infinity) - (b.daysRemaining ?? Infinity));
}

/** Everything running out within `withinDays`, soonest first — the shopping list. */
export function reorderList(
	data: AppData,
	withinDays = LOW_STOCK_DAYS,
	from: IsoDate = today()
): InventoryStatus[] {
	return inventoryForStack(data, from).filter(
		(s) => s.daysRemaining !== null && s.daysRemaining <= withinDays
	);
}

/** Days until the *first* item runs out — the number worth putting in a header. */
export function nextRunout(data: AppData, from: IsoDate = today()): InventoryStatus | null {
	return inventoryForStack(data, from).find((s) => s.daysRemaining !== null) ?? null;
}
