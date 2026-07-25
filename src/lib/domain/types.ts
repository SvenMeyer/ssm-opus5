/**
 * The whole domain vocabulary, in one place.
 *
 * Everything under `src/lib/domain` is pure TypeScript: no Svelte, no storage, no DOM.
 * When the real database arrives these types become the schema and the calculation
 * modules move server-side unchanged.
 */

/** Units we can reason about. IU only makes sense per-nutrient (D, E, A). */
export type Unit = 'mcg' | 'mg' | 'g' | 'IU' | 'billion CFU';

export type NutrientCategory =
	'vitamin' | 'mineral' | 'fatty-acid' | 'amino-acid' | 'botanical' | 'probiotic' | 'other';

export interface Nutrient {
	id: string;
	name: string;
	/** Canonical unit. All amounts of this nutrient are stored in it. */
	unit: Unit;
	category: NutrientCategory;
	/** Recommended daily allowance / adequate intake for an adult, in `unit`. */
	rda?: number;
	/** Tolerable upper intake level for an adult, in `unit`. Absent = no established UL. */
	ul?: number;
	/** IU per 1 `unit`, where an IU equivalence exists (vitamin D, E, A). */
	iuPerUnit?: number;
	/** One line on what it does — shown in the nutrient drill-down. */
	blurb?: string;
}

export type ProductForm =
	'capsule' | 'tablet' | 'softgel' | 'powder' | 'liquid' | 'gummy' | 'sachet';

export interface Ingredient {
	nutrientId: string;
	/** Amount per single serving, in the nutrient's canonical unit. */
	amountPerServing: number;
}

export interface Product {
	id: string;
	brand: string;
	name: string;
	form: ProductForm;
	/** How many physical units (capsules, scoops…) make up one serving. */
	unitsPerServing: number;
	/** Physical units in a full container. */
	unitsPerContainer: number;
	/** Price of one container, in `currency`. */
	price: number;
	currency: string;
	ingredients: Ingredient[];
	tags: string[];
	/** True for products the user typed in themselves rather than picking from the catalog. */
	custom?: boolean;
	notes?: string;
}

export type SlotKind = 'fasted' | 'meal' | 'workout' | 'bed';

export interface Slot {
	id: string;
	label: string;
	/** 24h "HH:MM". Slots are always presented in time order. */
	time: string;
	kind: SlotKind;
}

export type FoodRequirement = 'with' | 'without' | 'any';

export interface Dose {
	slotId: string;
	/** Servings taken at this slot. 0.5 is legal (half a scoop). */
	servings: number;
	withFood: FoodRequirement;
}

export type StackStatus = 'active' | 'paused';

export interface StackItem {
	id: string;
	productId: string;
	status: StackStatus;
	doses: Dose[];
	/** ISO date (YYYY-MM-DD) the user started taking it. Drives the journal timeline. */
	startedOn: string;
	/** Physical units left in the bottle. */
	unitsOnHand: number;
	goalIds: string[];
	notes?: string;
}

export interface Goal {
	id: string;
	name: string;
	blurb: string;
	/** Tailwind-independent hex, used for the goal chip and coverage meter. */
	color: string;
	/** Nutrients that meaningfully serve this goal — the basis of the coverage meter. */
	nutrientIds: string[];
}

export type RuleKind = 'conflict' | 'synergy' | 'timing';
export type Severity = 'info' | 'caution' | 'warning';

/**
 * A rule is expressed over nutrients (not products), so it fires for any product
 * that happens to contain them.
 */
export interface Rule {
	id: string;
	kind: RuleKind;
	title: string;
	message: string;
	severity: Severity;
	/** Nutrients on each side of the relationship. A `timing` rule uses `a` only. */
	a: string[];
	b?: string[];
	/** For conflicts: how far apart the two sides should be taken. */
	minSeparationHours?: number;
	/** For timing rules: the slot kind the nutrient wants. */
	wants?: {
		food?: FoodRequirement;
		slotKind?: SlotKind;
	};
	source?: string;
}

export interface DoseLog {
	/** ISO date, YYYY-MM-DD. */
	date: string;
	stackItemId: string;
	slotId: string;
	taken: boolean;
}

export interface JournalEntry {
	/** ISO date, YYYY-MM-DD. One entry per day. */
	date: string;
	/** 1–5 scales. */
	energy: number;
	sleep: number;
	mood: number;
	note?: string;
}

export interface Settings {
	theme: 'light' | 'dark' | 'system';
	currency: string;
	/** Show nutrients that the stack delivers nothing of. */
	showEmptyNutrients: boolean;
}

/** The complete client-side database. Exported/imported verbatim as JSON. */
export interface AppData {
	version: number;
	products: Product[];
	stack: StackItem[];
	slots: Slot[];
	goals: Goal[];
	logs: DoseLog[];
	journal: JournalEntry[];
	settings: Settings;
}
