import type {
	AppData,
	DoseLog,
	Goal,
	JournalEntry,
	Product,
	Settings,
	Slot,
	StackItem
} from '$lib/domain/types';

/**
 * The storage seam.
 *
 * Every method is async even though the localStorage implementation is synchronous.
 * That is the whole point: when this is re-implemented against Postgres, or moved
 * behind SvelteKit form actions, no call site changes. Each `save*` method maps to
 * what will become one table.
 */
export interface Repository {
	load(): Promise<AppData>;

	saveStack(stack: StackItem[]): Promise<void>;
	saveProducts(products: Product[]): Promise<void>;
	saveSlots(slots: Slot[]): Promise<void>;
	saveGoals(goals: Goal[]): Promise<void>;
	saveLogs(logs: DoseLog[]): Promise<void>;
	saveJournal(entries: JournalEntry[]): Promise<void>;
	saveSettings(settings: Settings): Promise<void>;

	/** Wholesale replace — used by import. */
	replaceAll(data: AppData): Promise<void>;
	/** Throw away everything and return freshly seeded demo data. */
	reset(): Promise<AppData>;
}
