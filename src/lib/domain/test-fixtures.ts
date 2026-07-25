import type { AppData, Dose, Ingredient, Product, Slot, StackItem } from './types';

/**
 * Minimal builders for domain tests.
 *
 * Tests use these rather than the demo seed on purpose: a test that breaks because
 * someone re-priced a seed product is a test that teaches nothing.
 */

export const TEST_SLOTS: Slot[] = [
	{ id: 'am', label: 'Morning', time: '08:00', kind: 'meal' },
	{ id: 'noon', label: 'Midday', time: '12:00', kind: 'meal' },
	{ id: 'pm', label: 'Evening', time: '19:00', kind: 'meal' },
	{ id: 'fasting', label: 'Wake', time: '06:30', kind: 'fasted' },
	{ id: 'night', label: 'Bedtime', time: '22:00', kind: 'bed' }
];

export function product(id: string, ingredients: Ingredient[], overrides: Partial<Product> = {}) {
	return {
		id,
		brand: 'Test Brand',
		name: `Product ${id}`,
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 60,
		price: 30,
		currency: 'EUR',
		ingredients,
		tags: [],
		...overrides
	} satisfies Product;
}

export function stackItem(
	id: string,
	productId: string,
	doses: Dose[],
	overrides: Partial<StackItem> = {}
) {
	return {
		id,
		productId,
		status: 'active',
		doses,
		startedOn: '2020-01-01',
		unitsOnHand: 60,
		goalIds: [],
		...overrides
	} satisfies StackItem;
}

export function makeData(patch: Partial<AppData> = {}): AppData {
	return {
		version: 1,
		products: [],
		stack: [],
		slots: TEST_SLOTS,
		goals: [],
		logs: [],
		journal: [],
		settings: { theme: 'light', currency: 'EUR', showEmptyNutrients: false },
		...patch
	};
}
