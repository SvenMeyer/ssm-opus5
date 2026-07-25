import { adherenceByItem, adherenceStats } from '$lib/domain/adherence';
import { stackCost } from '$lib/domain/cost';
import { today, type IsoDate } from '$lib/domain/date';
import { allGoalCoverage } from '$lib/domain/goals';
import {
	applyFix as applyFixToStack,
	ceilingFindings,
	compareFindings,
	evaluateInteractions,
	type Finding,
	type Fix
} from '$lib/domain/interactions';
import { inventoryForStack, reorderList } from '$lib/domain/inventory';
import { scheduleForDay, slotsInOrder } from '$lib/domain/schedule';
import { dailyTotals, summarise } from '$lib/domain/totals';
import type {
	AppData,
	Dose,
	JournalEntry,
	Product,
	Settings,
	Slot,
	StackItem
} from '$lib/domain/types';
import { repository } from './local-repository';
import { createSeedData, SEED_RULES } from './seed';

/**
 * The single source of truth for the UI.
 *
 * Derived values are computed once here and read everywhere, so the Today page, the
 * Nutrients page and the Interactions page can never disagree about the same stack.
 * All mutations are immutable replacements followed by a fire-and-forget repository
 * write — which is what makes swapping in a real backend a change to one file.
 */
class AppStore {
	#data = $state<AppData>(createSeedData());
	ready = $state(false);

	// ── Loading ────────────────────────────────────────────────────────────────
	async init() {
		this.#data = await repository.load();
		this.applyTheme();
		this.ready = true;
	}

	get data() {
		return this.#data;
	}

	// ── Raw collections ────────────────────────────────────────────────────────
	get products() {
		return this.#data.products;
	}
	get stack() {
		return this.#data.stack;
	}
	get goals() {
		return this.#data.goals;
	}
	get journal() {
		return this.#data.journal;
	}
	get settings() {
		return this.#data.settings;
	}
	get rules() {
		return SEED_RULES;
	}

	slots = $derived(slotsInOrder(this.#data.slots));

	productById = $derived(new Map(this.#data.products.map((p) => [p.id, p])));
	stackItemById = $derived(new Map(this.#data.stack.map((i) => [i.id, i])));
	slotById = $derived(new Map(this.#data.slots.map((s) => [s.id, s])));
	goalById = $derived(new Map(this.#data.goals.map((g) => [g.id, g])));

	productFor(item: StackItem): Product | undefined {
		return this.productById.get(item.productId);
	}

	/** Name of the product behind a stack item — needed all over the UI. */
	nameOf(stackItemId: string): string {
		const item = this.stackItemById.get(stackItemId);
		const product = item ? this.productById.get(item.productId) : undefined;
		return product?.name ?? 'Unknown product';
	}

	// ── Derived views ──────────────────────────────────────────────────────────
	todaySchedule = $derived(scheduleForDay(this.#data, today()));
	totals = $derived(dailyTotals(this.#data));
	totalsSummary = $derived(summarise(this.totals));

	interactionFindings = $derived(evaluateInteractions(this.#data, SEED_RULES));
	findings = $derived<Finding[]>(
		[...ceilingFindings(this.totals), ...this.interactionFindings].sort(compareFindings)
	);
	/**
	 * Three buckets, not two. A synergy you are not yet exploiting is an opportunity,
	 * not a problem — filing it under warnings would train the user to ignore warnings.
	 */
	problems = $derived(this.findings.filter((f) => !f.positive && f.kind !== 'synergy'));
	suggestions = $derived(this.findings.filter((f) => !f.positive && f.kind === 'synergy'));
	wins = $derived(this.findings.filter((f) => f.positive));

	inventory = $derived(inventoryForStack(this.#data));
	reorder = $derived(reorderList(this.#data));
	cost = $derived(stackCost(this.#data));
	coverage = $derived(allGoalCoverage(this.#data, this.totals));
	adherence = $derived(adherenceStats(this.#data));
	adherenceByItem = $derived(adherenceByItem(this.#data));

	activeStack = $derived(this.#data.stack.filter((i) => i.status === 'active'));
	pausedStack = $derived(this.#data.stack.filter((i) => i.status === 'paused'));

	/** Doses ticked off today, keyed `stackItemId:slotId`. */
	takenToday = $derived(
		new Set(
			this.#data.logs
				.filter((l) => l.date === today() && l.taken)
				.map((l) => `${l.stackItemId}:${l.slotId}`)
		)
	);

	todayProgress = $derived.by(() => {
		const total = this.todaySchedule.reduce((s, g) => s + g.doses.length, 0);
		const done = this.todaySchedule.reduce(
			(s, g) =>
				s + g.doses.filter((d) => this.takenToday.has(`${d.stackItemId}:${d.slotId}`)).length,
			0
		);
		return { done, total, ratio: total === 0 ? 1 : done / total };
	});

	journalFor(date: IsoDate): JournalEntry | undefined {
		return this.#data.journal.find((e) => e.date === date);
	}

	// ── Mutations: stack ───────────────────────────────────────────────────────
	#commitStack(stack: StackItem[]) {
		this.#data = { ...this.#data, stack };
		void repository.saveStack(stack);
	}

	addToStack(productId: string, doses: Dose[], goalIds: string[] = []): string {
		const product = this.productById.get(productId);
		const id = `s-${crypto.randomUUID().slice(0, 8)}`;
		this.#commitStack([
			...this.#data.stack,
			{
				id,
				productId,
				status: 'active',
				doses,
				startedOn: today(),
				unitsOnHand: product?.unitsPerContainer ?? 0,
				goalIds
			}
		]);
		return id;
	}

	removeFromStack(stackItemId: string) {
		this.#commitStack(this.#data.stack.filter((i) => i.id !== stackItemId));
		const logs = this.#data.logs.filter((l) => l.stackItemId !== stackItemId);
		this.#data = { ...this.#data, logs };
		void repository.saveLogs(logs);
	}

	updateItem(stackItemId: string, patch: Partial<Omit<StackItem, 'id'>>) {
		this.#commitStack(this.#data.stack.map((i) => (i.id === stackItemId ? { ...i, ...patch } : i)));
	}

	toggleStatus(stackItemId: string) {
		const item = this.stackItemById.get(stackItemId);
		if (!item) return;
		this.updateItem(stackItemId, { status: item.status === 'active' ? 'paused' : 'active' });
	}

	setDose(stackItemId: string, slotId: string, servings: number) {
		const item = this.stackItemById.get(stackItemId);
		if (!item) return;
		const existing = item.doses.find((d) => d.slotId === slotId);
		const doses =
			servings <= 0
				? item.doses.filter((d) => d.slotId !== slotId)
				: existing
					? item.doses.map((d) => (d.slotId === slotId ? { ...d, servings } : d))
					: [...item.doses, { slotId, servings, withFood: 'any' as const }];
		this.updateItem(stackItemId, { doses });
	}

	setDoseFood(stackItemId: string, slotId: string, withFood: Dose['withFood']) {
		const item = this.stackItemById.get(stackItemId);
		if (!item) return;
		this.updateItem(stackItemId, {
			doses: item.doses.map((d) => (d.slotId === slotId ? { ...d, withFood } : d))
		});
	}

	applyFix(fix: Fix) {
		this.#commitStack(applyFixToStack(this.#data.stack, fix));
	}

	toggleGoal(stackItemId: string, goalId: string) {
		const item = this.stackItemById.get(stackItemId);
		if (!item) return;
		const goalIds = item.goalIds.includes(goalId)
			? item.goalIds.filter((g) => g !== goalId)
			: [...item.goalIds, goalId];
		this.updateItem(stackItemId, { goalIds });
	}

	/** Refill a bottle back to a full container. */
	restock(stackItemId: string, units?: number) {
		const item = this.stackItemById.get(stackItemId);
		if (!item) return;
		const product = this.productById.get(item.productId);
		this.updateItem(stackItemId, { unitsOnHand: units ?? product?.unitsPerContainer ?? 0 });
	}

	// ── Mutations: dose logging ────────────────────────────────────────────────
	/**
	 * Ticking a dose also decrements the bottle, and un-ticking puts the units back —
	 * inventory that only ever went down by schedule would drift away from reality the
	 * first time someone skipped a day.
	 */
	toggleDose(stackItemId: string, slotId: string, date: IsoDate = today()) {
		const isTaken = this.#data.logs.some(
			(l) => l.date === date && l.stackItemId === stackItemId && l.slotId === slotId && l.taken
		);
		const logs = this.#data.logs.filter(
			(l) => !(l.date === date && l.stackItemId === stackItemId && l.slotId === slotId)
		);
		if (!isTaken) logs.push({ date, stackItemId, slotId, taken: true });

		this.#data = { ...this.#data, logs };
		void repository.saveLogs(logs);

		const item = this.stackItemById.get(stackItemId);
		const product = item ? this.productById.get(item.productId) : undefined;
		const dose = item?.doses.find((d) => d.slotId === slotId);
		if (item && product && dose && date === today()) {
			const units = dose.servings * product.unitsPerServing;
			this.updateItem(stackItemId, {
				unitsOnHand: Math.max(0, item.unitsOnHand + (isTaken ? units : -units))
			});
		}
	}

	takeAllInSlot(slotId: string, date: IsoDate = today()) {
		const group = this.todaySchedule.find((g) => g.slot.id === slotId);
		if (!group) return;
		for (const dose of group.doses) {
			if (!this.takenToday.has(`${dose.stackItemId}:${dose.slotId}`)) {
				this.toggleDose(dose.stackItemId, dose.slotId, date);
			}
		}
	}

	// ── Mutations: catalog ─────────────────────────────────────────────────────
	addProduct(product: Omit<Product, 'id'>): string {
		const id = `p-custom-${crypto.randomUUID().slice(0, 8)}`;
		const products = [...this.#data.products, { ...product, id, custom: true }];
		this.#data = { ...this.#data, products };
		void repository.saveProducts(products);
		return id;
	}

	// ── Mutations: journal ─────────────────────────────────────────────────────
	saveJournalEntry(entry: JournalEntry) {
		const journal = [...this.#data.journal.filter((e) => e.date !== entry.date), entry].sort(
			(a, b) => a.date.localeCompare(b.date)
		);
		this.#data = { ...this.#data, journal };
		void repository.saveJournal(journal);
	}

	deleteJournalEntry(date: IsoDate) {
		const journal = this.#data.journal.filter((e) => e.date !== date);
		this.#data = { ...this.#data, journal };
		void repository.saveJournal(journal);
	}

	// ── Mutations: slots & settings ────────────────────────────────────────────
	saveSlot(slot: Slot) {
		const exists = this.#data.slots.some((s) => s.id === slot.id);
		const slots = exists
			? this.#data.slots.map((s) => (s.id === slot.id ? slot : s))
			: [...this.#data.slots, slot];
		this.#data = { ...this.#data, slots };
		void repository.saveSlots(slots);
	}

	addSlot(label: string, time: string, kind: Slot['kind']) {
		this.saveSlot({ id: `slot-${crypto.randomUUID().slice(0, 6)}`, label, time, kind });
	}

	/** Removing a slot also drops every dose scheduled into it — nothing is orphaned. */
	removeSlot(slotId: string) {
		const slots = this.#data.slots.filter((s) => s.id !== slotId);
		const stack = this.#data.stack.map((i) => ({
			...i,
			doses: i.doses.filter((d) => d.slotId !== slotId)
		}));
		this.#data = { ...this.#data, slots, stack };
		void repository.saveSlots(slots);
		void repository.saveStack(stack);
	}

	updateSettings(patch: Partial<Settings>) {
		const settings = { ...this.#data.settings, ...patch };
		this.#data = { ...this.#data, settings };
		void repository.saveSettings(settings);
		if (patch.theme) this.applyTheme();
	}

	applyTheme() {
		if (typeof document === 'undefined') return;
		const mode = this.#data.settings.theme;
		const dark =
			mode === 'dark' ||
			(mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
		document.documentElement.classList.toggle('dark', dark);
		localStorage.setItem('ssm:theme', mode === 'system' ? (dark ? 'dark' : 'light') : mode);
		document
			.querySelector('meta[name="theme-color"]')
			?.setAttribute('content', dark ? '#101317' : '#faf8f4');
	}

	get isDark() {
		if (typeof document === 'undefined') return false;
		return document.documentElement.classList.contains('dark');
	}

	// ── Whole-database operations ──────────────────────────────────────────────
	exportJson(): string {
		return JSON.stringify(this.#data, null, 2);
	}

	/** Returns an error message, or null on success. Never throws at the call site. */
	async importJson(raw: string): Promise<string | null> {
		let parsed: AppData;
		try {
			parsed = JSON.parse(raw) as AppData;
		} catch {
			return 'That is not valid JSON.';
		}
		if (!parsed || !Array.isArray(parsed.stack) || !Array.isArray(parsed.products)) {
			return 'That JSON is not a Supplement Stack Manager export.';
		}
		await repository.replaceAll(parsed);
		this.#data = parsed;
		this.applyTheme();
		return null;
	}

	async resetToDemo() {
		this.#data = await repository.reset();
		this.applyTheme();
	}
}

export const store = new AppStore();
