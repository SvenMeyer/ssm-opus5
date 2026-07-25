import type { Rule } from '$lib/domain/types';

/**
 * The interaction and timing rulebook.
 *
 * Rules are written over *nutrients*, never products, so they fire for anything in the
 * catalog — including products the user types in themselves. Every message says what to
 * do, not just what is wrong.
 *
 * Prototype content: plausible, widely-repeated guidance, not clinical advice. A
 * production build would carry a citation and an evidence grade on every rule.
 */
export const SEED_RULES: Rule[] = [
	// ── Mineral competition ─────────────────────────────────────────────────────
	{
		id: 'zinc-iron',
		kind: 'conflict',
		title: 'Zinc and iron compete',
		message:
			'They share the same intestinal transporter, so taken together each one absorbs worse. Put at least two hours between them.',
		severity: 'warning',
		a: ['zinc'],
		b: ['iron'],
		minSeparationHours: 2,
		source: 'Mineral transporter competition (DMT1)'
	},
	{
		id: 'calcium-iron',
		kind: 'conflict',
		title: 'Calcium blocks iron',
		message: 'Calcium is the strongest single inhibitor of iron uptake. Keep them well apart.',
		severity: 'warning',
		a: ['calcium'],
		b: ['iron'],
		minSeparationHours: 3
	},
	{
		id: 'calcium-zinc',
		kind: 'conflict',
		title: 'Calcium reduces zinc uptake',
		message: 'A large calcium dose alongside zinc measurably lowers how much zinc you absorb.',
		severity: 'caution',
		a: ['calcium'],
		b: ['zinc'],
		minSeparationHours: 2
	},
	{
		id: 'calcium-magnesium',
		kind: 'conflict',
		title: 'Calcium and magnesium compete at high doses',
		message:
			'At supplemental doses they compete for the same absorption pathway. Splitting them across the day gets more of both.',
		severity: 'caution',
		a: ['calcium'],
		b: ['magnesium'],
		minSeparationHours: 2
	},
	{
		id: 'zinc-copper',
		kind: 'conflict',
		title: 'Zinc depletes copper over time',
		message:
			'Sustained zinc above 25 mg a day lowers copper status. Keep them separated, and keep an eye on the ratio.',
		severity: 'caution',
		a: ['zinc'],
		b: ['copper'],
		minSeparationHours: 2
	},
	{
		id: 'ala-minerals',
		kind: 'conflict',
		title: 'Alpha-lipoic acid chelates minerals',
		message: 'It binds minerals in the gut. Take it at least two hours from any mineral dose.',
		severity: 'caution',
		a: ['alpha-lipoic-acid'],
		b: ['zinc', 'iron', 'magnesium', 'calcium', 'copper'],
		minSeparationHours: 2
	},
	{
		id: 'magnesium-iron',
		kind: 'conflict',
		title: 'Magnesium interferes with iron',
		message: 'Another divalent mineral competing for the same route. Separate them.',
		severity: 'caution',
		a: ['magnesium'],
		b: ['iron'],
		minSeparationHours: 2
	},

	// ── Stimulation and sleep ───────────────────────────────────────────────────
	{
		id: 'caffeine-bedtime',
		kind: 'timing',
		title: 'Caffeine too close to bed',
		message:
			'With a five-hour half-life, an evening dose is still circulating at bedtime. Move it to the morning.',
		severity: 'warning',
		a: ['caffeine'],
		wants: { slotKind: 'fasted' }
	},
	{
		id: 'rhodiola-evening',
		kind: 'conflict',
		title: 'Rhodiola near bedtime',
		message: 'Rhodiola is stimulating for most people. Taken late it commonly costs sleep.',
		severity: 'caution',
		a: ['rhodiola'],
		b: ['melatonin', 'glycine'],
		minSeparationHours: 4
	},
	{
		id: 'melatonin-bed',
		kind: 'timing',
		title: 'Melatonin wants the bedtime slot',
		message: 'It shifts your body clock rather than sedating you, so the timing is the dose.',
		severity: 'caution',
		a: ['melatonin'],
		wants: { slotKind: 'bed' }
	},

	// ── Absorption and food ─────────────────────────────────────────────────────
	{
		id: 'fat-soluble-food',
		kind: 'timing',
		title: 'Fat-soluble vitamins need fat',
		message:
			'Vitamins A, D, E and K absorb several times better alongside a meal containing fat. Fasted, most of the dose is wasted.',
		severity: 'caution',
		a: ['vitamin-a', 'vitamin-d', 'vitamin-e', 'vitamin-k2'],
		wants: { food: 'with' }
	},
	{
		id: 'coq10-food',
		kind: 'timing',
		title: 'CoQ10 needs a fat-containing meal',
		message: 'Ubiquinol is fat-soluble; taken on an empty stomach very little of it gets in.',
		severity: 'caution',
		a: ['coq10'],
		wants: { food: 'with' }
	},
	{
		id: 'omega3-food',
		kind: 'timing',
		title: 'Omega-3 absorbs best with a meal',
		message: 'Taking fish oil with food both improves uptake and prevents the fishy repeat.',
		severity: 'info',
		a: ['epa', 'dha'],
		wants: { food: 'with' }
	},
	{
		id: 'nac-fasted',
		kind: 'timing',
		title: 'NAC prefers an empty stomach',
		message: 'Protein in a meal competes with cysteine uptake. Fasted is the better window.',
		severity: 'info',
		a: ['nac'],
		wants: { food: 'without' }
	},
	{
		id: 'tyrosine-fasted',
		kind: 'timing',
		title: 'L-Tyrosine competes with dietary protein',
		message:
			'Other large neutral amino acids in a meal crowd it out at the blood-brain barrier. Take it fasted.',
		severity: 'info',
		a: ['l-tyrosine'],
		wants: { food: 'without' }
	},
	{
		id: 'iron-fasted',
		kind: 'timing',
		title: 'Iron absorbs best fasted',
		message:
			'Food roughly halves iron uptake — but fasted iron upsets a lot of stomachs, so this one is a trade-off you make knowingly.',
		severity: 'info',
		a: ['iron'],
		wants: { food: 'without' }
	},
	{
		id: 'bacopa-food',
		kind: 'timing',
		title: 'Bacopa without food causes nausea',
		message: 'This is the single most common reason people abandon bacopa. Take it with a meal.',
		severity: 'caution',
		a: ['bacopa'],
		wants: { food: 'with' }
	},
	{
		id: 'probiotic-fasted',
		kind: 'timing',
		title: 'Probiotics survive better fasted',
		message: 'Less stomach acid between meals means more organisms reach the intestine alive.',
		severity: 'info',
		a: ['probiotic'],
		wants: { food: 'without' }
	},

	// ── Synergies ───────────────────────────────────────────────────────────────
	{
		id: 'd-k2',
		kind: 'synergy',
		title: 'Vitamin D works with K2',
		message: 'D raises calcium absorption; K2 directs that calcium into bone rather than arteries.',
		severity: 'info',
		a: ['vitamin-d'],
		b: ['vitamin-k2']
	},
	{
		id: 'd-magnesium',
		kind: 'synergy',
		title: 'Vitamin D needs magnesium',
		message: 'Every step that activates vitamin D is magnesium-dependent.',
		severity: 'info',
		a: ['vitamin-d'],
		b: ['magnesium']
	},
	{
		id: 'd-fat',
		kind: 'synergy',
		title: 'Vitamin D rides on dietary fat',
		message:
			'Sharing a slot with your omega-3 gives the fat-soluble vitamins something to ride on.',
		severity: 'info',
		a: ['vitamin-d'],
		b: ['epa', 'dha']
	},
	{
		id: 'iron-vitamin-c',
		kind: 'synergy',
		title: 'Vitamin C multiplies iron uptake',
		message:
			'Ascorbate keeps iron in the absorbable ferrous form — it can triple what you take up.',
		severity: 'info',
		a: ['iron'],
		b: ['vitamin-c']
	},
	{
		id: 'zinc-vitamin-c',
		kind: 'synergy',
		title: 'Zinc and vitamin C for immune support',
		message: 'The most consistently supported pairing for shortening common infections.',
		severity: 'info',
		a: ['zinc'],
		b: ['vitamin-c']
	},
	{
		id: 'curcumin-piperine',
		kind: 'synergy',
		title: 'Curcumin needs a carrier',
		message: 'On its own curcumin barely absorbs; piperine or a phospholipid carrier changes that.',
		severity: 'info',
		a: ['curcumin'],
		b: ['piperine']
	},
	{
		id: 'collagen-vitamin-c',
		kind: 'synergy',
		title: 'Collagen needs vitamin C',
		message:
			'Vitamin C is a required cofactor for collagen synthesis — the peptides alone are not enough.',
		severity: 'info',
		a: ['collagen'],
		b: ['vitamin-c']
	},
	{
		id: 'caffeine-theanine',
		kind: 'synergy',
		title: 'Theanine smooths caffeine',
		message: 'Roughly 2:1 theanine to caffeine keeps the alertness and drops the jitter.',
		severity: 'info',
		a: ['caffeine'],
		b: ['l-theanine']
	},
	{
		id: 'magnesium-glycine',
		kind: 'synergy',
		title: 'Magnesium and glycine before bed',
		message: 'Both act on sleep onset by different routes; taken together they stack cleanly.',
		severity: 'info',
		a: ['magnesium'],
		b: ['glycine']
	}
];
