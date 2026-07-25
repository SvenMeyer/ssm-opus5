import { minutesOfDay, type IsoDate } from './date';
import type { AppData, Dose, FoodRequirement, Product, Slot, StackItem } from './types';

/** One concrete thing to swallow, at one slot, on one day. */
export interface ScheduledDose {
	/** Stable identity of this dose within a day — also the dose-log key. */
	key: string;
	stackItemId: string;
	productId: string;
	slotId: string;
	servings: number;
	withFood: FoodRequirement;
	/** Physical units (capsules, scoops) to take. */
	units: number;
}

export interface SlotGroup {
	slot: Slot;
	doses: ScheduledDose[];
}

export function doseKey(date: IsoDate, stackItemId: string, slotId: string): string {
	return `${date}:${stackItemId}:${slotId}`;
}

export function slotsInOrder(slots: Slot[]): Slot[] {
	return [...slots].sort((a, b) => minutesOfDay(a.time) - minutesOfDay(b.time));
}

export function unitsForDose(dose: Dose, product: Product): number {
	return dose.servings * product.unitsPerServing;
}

/** Physical units an item consumes across a whole day. */
export function dailyUnits(item: StackItem, product: Product): number {
	return item.doses.reduce((sum, d) => sum + unitsForDose(d, product), 0);
}

/** Servings an item delivers across a whole day. */
export function dailyServings(item: StackItem): number {
	return item.doses.reduce((sum, d) => sum + d.servings, 0);
}

export function activeItems(stack: StackItem[]): StackItem[] {
	return stack.filter((i) => i.status === 'active');
}

/**
 * Expand the active stack into the day's doses, grouped by slot in time order.
 *
 * Slots with nothing scheduled are dropped — an empty slot card is noise, and the
 * Settings page is where slots are managed, not the Today page.
 */
export function scheduleForDay(data: AppData, date: IsoDate): SlotGroup[] {
	const productById = new Map(data.products.map((p) => [p.id, p]));
	const groups = new Map<string, ScheduledDose[]>();

	for (const item of activeItems(data.stack)) {
		const product = productById.get(item.productId);
		if (!product) continue;
		for (const dose of item.doses) {
			const list = groups.get(dose.slotId) ?? [];
			list.push({
				key: doseKey(date, item.id, dose.slotId),
				stackItemId: item.id,
				productId: product.id,
				slotId: dose.slotId,
				servings: dose.servings,
				withFood: dose.withFood,
				units: unitsForDose(dose, product)
			});
			groups.set(dose.slotId, list);
		}
	}

	return slotsInOrder(data.slots)
		.filter((slot) => groups.has(slot.id))
		.map((slot) => ({ slot, doses: groups.get(slot.id) ?? [] }));
}

/** Total number of doses scheduled on a normal day — the denominator for adherence. */
export function dosesPerDay(data: AppData): number {
	return activeItems(data.stack).reduce((sum, item) => sum + item.doses.length, 0);
}
