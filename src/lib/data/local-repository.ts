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
import type { Repository } from './repository';
import { createSeedData, DATA_VERSION } from './seed';

const KEY = 'ssm:data';

/**
 * localStorage-backed repository.
 *
 * Writes are whole-document rather than per-table, because localStorage has no other
 * mode. The interface still exposes the per-table methods so that the call sites are
 * already shaped for a real database.
 */
export class LocalRepository implements Repository {
	#cache: AppData | null = null;

	async load(): Promise<AppData> {
		if (this.#cache) return this.#cache;
		this.#cache = this.#read() ?? createSeedData();
		return this.#cache;
	}

	#read(): AppData | null {
		if (typeof localStorage === 'undefined') return null;
		try {
			const raw = localStorage.getItem(KEY);
			if (!raw) return null;
			const parsed = JSON.parse(raw) as AppData;
			// A version mismatch means the shape changed under stored demo data. Discarding
			// is the honest response — silently half-migrating would be worse.
			if (parsed.version !== DATA_VERSION) return null;
			return parsed;
		} catch {
			return null;
		}
	}

	#flush(): void {
		if (!this.#cache || typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(KEY, JSON.stringify(this.#cache));
		} catch {
			// Quota exceeded or storage disabled — the in-memory session still works.
		}
	}

	/**
	 * Reads the cache synchronously when it is warm, and only awaits on the very first
	 * call.
	 *
	 * This matters more than it looks. Several operations write two tables at once —
	 * removing a slot saves both `slots` and `stack`, ticking a dose saves both `logs`
	 * and `stack`. With an unconditional `await this.load()` both calls suspend, both
	 * resume holding the *same* pre-update document, and the second one overwrites the
	 * first: the change appeared in the UI and silently vanished on the next reload.
	 * An async function runs synchronously up to its first await, so avoiding the await
	 * on the warm path serialises the writes.
	 */
	async #patch(patch: Partial<AppData>): Promise<void> {
		const data = this.#cache ?? (await this.load());
		this.#cache = { ...data, ...patch };
		this.#flush();
	}

	saveStack(stack: StackItem[]) {
		return this.#patch({ stack });
	}
	saveProducts(products: Product[]) {
		return this.#patch({ products });
	}
	saveSlots(slots: Slot[]) {
		return this.#patch({ slots });
	}
	saveGoals(goals: Goal[]) {
		return this.#patch({ goals });
	}
	saveLogs(logs: DoseLog[]) {
		return this.#patch({ logs });
	}
	saveJournal(journal: JournalEntry[]) {
		return this.#patch({ journal });
	}
	saveSettings(settings: Settings) {
		return this.#patch({ settings });
	}

	async replaceAll(data: AppData): Promise<void> {
		this.#cache = data;
		this.#flush();
	}

	async reset(): Promise<AppData> {
		this.#cache = createSeedData();
		this.#flush();
		return this.#cache;
	}
}

export const repository: Repository = new LocalRepository();
