import type { Nutrient, Unit } from './types';

/**
 * Adult reference values, approximate, for a prototype.
 *
 * RDA = recommended daily allowance (or adequate intake where no RDA exists).
 * UL  = tolerable upper intake level. An absent UL means none has been established,
 *       which is *not* the same as "unlimited" — the UI says so explicitly.
 *
 * Where an RDA differs by sex the higher value is used, so the bars err toward
 * "you may still be short" rather than "you are fine".
 *
 * These are illustrative. A production build would source them per-locale from a
 * maintained reference database and vary them by age, sex, and pregnancy status.
 */
export const NUTRIENTS: Nutrient[] = [
	// ── Vitamins ────────────────────────────────────────────────────────────────
	{
		id: 'vitamin-a',
		name: 'Vitamin A',
		unit: 'mcg',
		category: 'vitamin',
		rda: 900,
		ul: 3000,
		iuPerUnit: 3.33,
		blurb: 'Vision, immune function, skin turnover. Retinol forms accumulate — the UL is real.'
	},
	{
		id: 'vitamin-c',
		name: 'Vitamin C',
		unit: 'mg',
		category: 'vitamin',
		rda: 90,
		ul: 2000,
		blurb: 'Antioxidant and collagen cofactor. Excess is excreted; the UL is about GI upset.'
	},
	{
		id: 'vitamin-d',
		name: 'Vitamin D3',
		unit: 'mcg',
		category: 'vitamin',
		rda: 20,
		ul: 100,
		iuPerUnit: 40,
		blurb: 'Fat-soluble. Stored in tissue, so sustained high intake is what matters, not one day.'
	},
	{
		id: 'vitamin-e',
		name: 'Vitamin E',
		unit: 'mg',
		category: 'vitamin',
		rda: 15,
		ul: 1000,
		iuPerUnit: 1.49,
		blurb: 'Fat-soluble antioxidant. High doses interact with anticoagulants.'
	},
	{
		id: 'vitamin-k2',
		name: 'Vitamin K2 (MK-7)',
		unit: 'mcg',
		category: 'vitamin',
		rda: 120,
		blurb: 'Directs calcium to bone. No UL established; interacts strongly with warfarin.'
	},
	{
		id: 'thiamin',
		name: 'Thiamin (B1)',
		unit: 'mg',
		category: 'vitamin',
		rda: 1.2,
		blurb: 'Carbohydrate metabolism and nerve conduction.'
	},
	{
		id: 'riboflavin',
		name: 'Riboflavin (B2)',
		unit: 'mg',
		category: 'vitamin',
		rda: 1.3,
		blurb: 'Energy metabolism. Turns urine bright yellow — harmless.'
	},
	{
		id: 'niacin',
		name: 'Niacin (B3)',
		unit: 'mg',
		category: 'vitamin',
		rda: 16,
		ul: 35,
		blurb: 'The UL is set by the flushing response to nicotinic acid, not by toxicity.'
	},
	{
		id: 'pantothenic-acid',
		name: 'Pantothenic acid (B5)',
		unit: 'mg',
		category: 'vitamin',
		rda: 5,
		blurb: 'Coenzyme A precursor. Deficiency is essentially unheard of.'
	},
	{
		id: 'vitamin-b6',
		name: 'Vitamin B6 (P-5-P)',
		unit: 'mg',
		category: 'vitamin',
		rda: 1.3,
		ul: 100,
		blurb: 'Sustained high intake can cause peripheral neuropathy. Watch stacked B-complexes.'
	},
	{
		id: 'biotin',
		name: 'Biotin (B7)',
		unit: 'mcg',
		category: 'vitamin',
		rda: 30,
		blurb: 'High doses skew thyroid and troponin lab assays — mention it before blood work.'
	},
	{
		id: 'folate',
		name: 'Folate (5-MTHF)',
		unit: 'mcg',
		category: 'vitamin',
		rda: 400,
		ul: 1000,
		blurb: 'The UL exists because folate can mask B12 deficiency.'
	},
	{
		id: 'vitamin-b12',
		name: 'Vitamin B12',
		unit: 'mcg',
		category: 'vitamin',
		rda: 2.4,
		blurb: 'Absorption is the bottleneck, not dose. No UL established.'
	},
	{
		id: 'choline',
		name: 'Choline',
		unit: 'mg',
		category: 'vitamin',
		rda: 550,
		ul: 3500,
		blurb: 'Acetylcholine and cell-membrane precursor. High doses can smell fishy.'
	},

	// ── Minerals ────────────────────────────────────────────────────────────────
	{
		id: 'calcium',
		name: 'Calcium',
		unit: 'mg',
		category: 'mineral',
		rda: 1000,
		ul: 2500,
		blurb: 'Competes with iron, zinc and magnesium for absorption. Timing matters more than dose.'
	},
	{
		id: 'magnesium',
		name: 'Magnesium',
		unit: 'mg',
		category: 'mineral',
		rda: 420,
		ul: 350,
		blurb:
			'The 350 mg ceiling applies to supplemental magnesium only — food magnesium is uncapped. That is why the ceiling sits below the target here.'
	},
	{
		id: 'zinc',
		name: 'Zinc',
		unit: 'mg',
		category: 'mineral',
		rda: 11,
		ul: 40,
		blurb: 'Long-term high intake depletes copper. Competes with iron and calcium.'
	},
	{
		id: 'iron',
		name: 'Iron',
		unit: 'mg',
		category: 'mineral',
		rda: 18,
		ul: 45,
		blurb: 'Do not supplement without a ferritin test. Absorbed best fasted with vitamin C.'
	},
	{
		id: 'selenium',
		name: 'Selenium',
		unit: 'mcg',
		category: 'mineral',
		rda: 55,
		ul: 400,
		blurb: 'Narrow window between sufficiency and toxicity — two products can easily overshoot.'
	},
	{
		id: 'copper',
		name: 'Copper',
		unit: 'mg',
		category: 'mineral',
		rda: 0.9,
		ul: 10,
		blurb: 'Balance against zinc; a 1:10 copper-to-zinc ratio is the usual rule of thumb.'
	},
	{
		id: 'manganese',
		name: 'Manganese',
		unit: 'mg',
		category: 'mineral',
		rda: 2.3,
		ul: 11
	},
	{
		id: 'chromium',
		name: 'Chromium',
		unit: 'mcg',
		category: 'mineral',
		rda: 35
	},
	{
		id: 'iodine',
		name: 'Iodine',
		unit: 'mcg',
		category: 'mineral',
		rda: 150,
		ul: 1100,
		blurb: 'Kelp-based products vary wildly batch to batch. Thyroid conditions need care.'
	},
	{
		id: 'molybdenum',
		name: 'Molybdenum',
		unit: 'mcg',
		category: 'mineral',
		rda: 45,
		ul: 2000
	},
	{
		id: 'potassium',
		name: 'Potassium',
		unit: 'mg',
		category: 'mineral',
		rda: 3400,
		blurb: 'Supplement doses are legally capped low; most intake should come from food.'
	},
	{
		id: 'phosphorus',
		name: 'Phosphorus',
		unit: 'mg',
		category: 'mineral',
		rda: 700,
		ul: 4000
	},
	{
		id: 'boron',
		name: 'Boron',
		unit: 'mg',
		category: 'mineral',
		ul: 20,
		blurb: 'No RDA established. Typical supplemental range is 3–6 mg.'
	},

	// ── Fatty acids ─────────────────────────────────────────────────────────────
	{
		id: 'epa',
		name: 'EPA',
		unit: 'mg',
		category: 'fatty-acid',
		rda: 250,
		blurb: 'Omega-3. Anti-inflammatory arm. Absorbed far better with a fat-containing meal.'
	},
	{
		id: 'dha',
		name: 'DHA',
		unit: 'mg',
		category: 'fatty-acid',
		rda: 250,
		blurb: 'Omega-3. Structural lipid in brain and retina.'
	},

	// ── Amino acids & metabolites ───────────────────────────────────────────────
	{
		id: 'creatine',
		name: 'Creatine monohydrate',
		unit: 'g',
		category: 'amino-acid',
		blurb:
			'The most evidenced sports supplement there is. Timing is irrelevant; consistency is not.'
	},
	{
		id: 'l-theanine',
		name: 'L-Theanine',
		unit: 'mg',
		category: 'amino-acid',
		blurb: 'Blunts the jittery edge of caffeine. Commonly paired 2:1 with it.'
	},
	{
		id: 'glycine',
		name: 'Glycine',
		unit: 'g',
		category: 'amino-acid',
		blurb: 'Taken before bed for sleep onset and thermoregulation.'
	},
	{
		id: 'taurine',
		name: 'Taurine',
		unit: 'mg',
		category: 'amino-acid'
	},
	{
		id: 'l-tyrosine',
		name: 'L-Tyrosine',
		unit: 'mg',
		category: 'amino-acid',
		blurb: 'Catecholamine precursor. Competes with other large neutral amino acids in protein.'
	},
	{
		id: 'nac',
		name: 'N-Acetyl Cysteine',
		unit: 'mg',
		category: 'amino-acid',
		blurb: 'Glutathione precursor. Best absorbed on an empty stomach.'
	},
	{
		id: 'collagen',
		name: 'Collagen peptides',
		unit: 'g',
		category: 'amino-acid',
		blurb: 'Pair with vitamin C, which is a required cofactor for collagen synthesis.'
	},
	{
		id: 'betaine',
		name: 'Betaine anhydrous',
		unit: 'mg',
		category: 'amino-acid'
	},

	// ── Other compounds ─────────────────────────────────────────────────────────
	{
		id: 'coq10',
		name: 'CoQ10 (ubiquinol)',
		unit: 'mg',
		category: 'other',
		blurb: 'Fat-soluble — near-useless taken fasted. Statin users are the classic case.'
	},
	{
		id: 'alpha-lipoic-acid',
		name: 'Alpha-lipoic acid',
		unit: 'mg',
		category: 'other',
		blurb: 'Chelates minerals; keep at least two hours from any mineral dose.'
	},
	{
		id: 'glucosamine',
		name: 'Glucosamine sulfate',
		unit: 'mg',
		category: 'other'
	},
	{
		id: 'msm',
		name: 'MSM',
		unit: 'mg',
		category: 'other'
	},
	{
		id: 'curcumin',
		name: 'Curcumin',
		unit: 'mg',
		category: 'other',
		blurb: 'Poorly absorbed alone. Piperine or a phospholipid carrier changes the picture entirely.'
	},
	{
		id: 'piperine',
		name: 'Piperine',
		unit: 'mg',
		category: 'other',
		blurb: 'An absorption enhancer — which means it also enhances absorption of medication.'
	},
	{
		id: 'melatonin',
		name: 'Melatonin',
		unit: 'mg',
		category: 'other',
		blurb: 'A chronobiotic, not a sedative. Lower doses taken earlier usually beat higher ones.'
	},
	{
		id: 'caffeine',
		name: 'Caffeine',
		unit: 'mg',
		category: 'other',
		ul: 400,
		blurb: 'Half-life around five hours. An afternoon dose is still working at bedtime.'
	},

	// ── Botanicals ──────────────────────────────────────────────────────────────
	{
		id: 'ashwagandha',
		name: 'Ashwagandha (KSM-66)',
		unit: 'mg',
		category: 'botanical',
		blurb: 'Adaptogen studied at 300–600 mg. Thyroid and autoimmune conditions warrant caution.'
	},
	{
		id: 'rhodiola',
		name: 'Rhodiola rosea',
		unit: 'mg',
		category: 'botanical',
		blurb: 'Stimulating — an evening dose commonly costs people sleep.'
	},
	{
		id: 'bacopa',
		name: 'Bacopa monnieri',
		unit: 'mg',
		category: 'botanical',
		blurb: 'Effects build over 8–12 weeks. Notorious for nausea taken without food.'
	},
	{
		id: 'lions-mane',
		name: "Lion's Mane",
		unit: 'mg',
		category: 'botanical'
	},
	{
		id: 'saffron-extract',
		name: 'Saffron extract',
		unit: 'mg',
		category: 'botanical'
	},
	{
		id: 'elderberry',
		name: 'Elderberry extract',
		unit: 'mg',
		category: 'botanical'
	},
	{
		id: 'ginger',
		name: 'Ginger extract',
		unit: 'mg',
		category: 'botanical'
	},

	// ── Probiotics ──────────────────────────────────────────────────────────────
	{
		id: 'probiotic',
		name: 'Probiotic blend',
		unit: 'billion CFU',
		category: 'probiotic',
		blurb: 'Strain-specific. CFU counts are only comparable within the same strain mix.'
	}
];

const BY_ID = new Map(NUTRIENTS.map((n) => [n.id, n]));

export function getNutrient(id: string): Nutrient | undefined {
	return BY_ID.get(id);
}

/** Throws for unknown ids — used where a missing nutrient means corrupt data. */
export function requireNutrient(id: string): Nutrient {
	const n = BY_ID.get(id);
	if (!n) throw new Error(`Unknown nutrient: ${id}`);
	return n;
}

export const NUTRIENT_CATEGORY_LABEL: Record<Nutrient['category'], string> = {
	vitamin: 'Vitamins',
	mineral: 'Minerals',
	'fatty-acid': 'Fatty acids',
	'amino-acid': 'Amino acids',
	botanical: 'Botanicals',
	probiotic: 'Probiotics',
	other: 'Other compounds'
};

/** Display order for grouped nutrient lists. */
export const CATEGORY_ORDER: Nutrient['category'][] = [
	'vitamin',
	'mineral',
	'fatty-acid',
	'amino-acid',
	'other',
	'botanical',
	'probiotic'
];

const MASS_FACTORS: Partial<Record<Unit, number>> = {
	mcg: 1,
	mg: 1000,
	g: 1_000_000
};

/**
 * Convert between mass units. Non-mass units (IU, CFU) only convert to themselves —
 * anything else is a programming error, so we throw rather than silently mis-scale a dose.
 */
export function convertMass(amount: number, from: Unit, to: Unit): number {
	if (from === to) return amount;
	const f = MASS_FACTORS[from];
	const t = MASS_FACTORS[to];
	if (f === undefined || t === undefined) {
		throw new Error(`Cannot convert ${from} to ${to}`);
	}
	return (amount * f) / t;
}

/** Amount expressed in IU, or null when the nutrient has no IU equivalence. */
export function toIU(nutrient: Nutrient, amount: number): number | null {
	return nutrient.iuPerUnit ? amount * nutrient.iuPerUnit : null;
}
