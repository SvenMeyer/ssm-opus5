import type { AppData } from '$lib/domain/types';
import { SEED_GOALS } from './goals';
import { seedJournal, seedLogs } from './history';
import { SEED_PRODUCTS } from './products';
import { SEED_RULES } from './rules';
import { SEED_SLOTS } from './slots';
import { seedStack } from './stack';

export { SEED_GOALS, SEED_PRODUCTS, SEED_RULES, SEED_SLOTS };

/**
 * Bumped whenever the shape of `AppData` changes. Stored data with an older version is
 * discarded rather than migrated — acceptable for a prototype whose data is all demo
 * data, and the reason Settings has an explicit export button.
 */
export const DATA_VERSION = 1;

export function createSeedData(): AppData {
	const stack = seedStack();
	return {
		version: DATA_VERSION,
		products: SEED_PRODUCTS,
		stack,
		slots: SEED_SLOTS,
		goals: SEED_GOALS,
		logs: seedLogs(stack),
		journal: seedJournal(),
		settings: {
			theme: 'system',
			currency: 'EUR',
			showEmptyNutrients: false
		}
	};
}
