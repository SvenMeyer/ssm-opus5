import type { Product } from '$lib/domain/types';

/**
 * Catalog seed.
 *
 * The brands are invented — Nordkap, Terra Vitae, Halo Labs and the rest do not exist —
 * so nothing here implies a claim about a real product. The chemistry, doses and prices
 * are realistic for the category, which is what the UI needs in order to be judged.
 */
export const SEED_PRODUCTS: Product[] = [
	{
		id: 'p-d3k2',
		brand: 'Nordkap',
		name: 'Vitamin D3 4000 + K2 MK-7',
		form: 'softgel',
		unitsPerServing: 1,
		unitsPerContainer: 120,
		price: 18.9,
		tags: ['fat-soluble', 'bone', 'winter'],
		ingredients: [
			{ nutrientId: 'vitamin-d', amountPerServing: 100 },
			{ nutrientId: 'vitamin-k2', amountPerServing: 100 }
		],
		notes: 'In an olive-oil base. 100 mcg is 4000 IU.'
	},
	{
		id: 'p-mag-gly',
		brand: 'Terra Vitae',
		name: 'Magnesium Glycinate 200',
		form: 'capsule',
		unitsPerServing: 2,
		unitsPerContainer: 180,
		price: 24.5,
		tags: ['sleep', 'relaxation', 'well-tolerated'],
		ingredients: [{ nutrientId: 'magnesium', amountPerServing: 200 }],
		notes: 'Glycinate is the form least likely to loosen the bowels.'
	},
	{
		id: 'p-omega3',
		brand: 'Boreal',
		name: 'Omega-3 Triple Strength',
		form: 'softgel',
		unitsPerServing: 2,
		unitsPerContainer: 120,
		price: 29.9,
		tags: ['fish oil', 'heart', 'brain'],
		ingredients: [
			{ nutrientId: 'epa', amountPerServing: 660 },
			{ nutrientId: 'dha', amountPerServing: 440 },
			{ nutrientId: 'vitamin-e', amountPerServing: 10 }
		]
	},
	{
		id: 'p-zinc',
		brand: 'Halo Labs',
		name: 'Zinc Picolinate 25',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 90,
		price: 11.5,
		tags: ['immune', 'skin'],
		ingredients: [{ nutrientId: 'zinc', amountPerServing: 25 }]
	},
	{
		id: 'p-iron',
		brand: 'Meridian',
		name: 'Gentle Iron 25 + C',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 90,
		price: 13.9,
		tags: ['bisglycinate', 'blood'],
		ingredients: [
			{ nutrientId: 'iron', amountPerServing: 25 },
			{ nutrientId: 'vitamin-c', amountPerServing: 60 }
		],
		notes: 'Bisglycinate — far gentler on the stomach than sulfate.'
	},
	{
		id: 'p-multi',
		brand: 'Atlas Basics',
		name: 'Daily Foundation Multivitamin',
		form: 'tablet',
		unitsPerServing: 2,
		unitsPerContainer: 60,
		price: 26.0,
		tags: ['multivitamin', 'baseline'],
		ingredients: [
			{ nutrientId: 'vitamin-a', amountPerServing: 700 },
			{ nutrientId: 'vitamin-c', amountPerServing: 200 },
			{ nutrientId: 'vitamin-d', amountPerServing: 25 },
			{ nutrientId: 'vitamin-e', amountPerServing: 20 },
			{ nutrientId: 'thiamin', amountPerServing: 5 },
			{ nutrientId: 'riboflavin', amountPerServing: 5 },
			{ nutrientId: 'niacin', amountPerServing: 20 },
			{ nutrientId: 'pantothenic-acid', amountPerServing: 10 },
			{ nutrientId: 'vitamin-b6', amountPerServing: 5 },
			{ nutrientId: 'biotin', amountPerServing: 150 },
			{ nutrientId: 'folate', amountPerServing: 400 },
			{ nutrientId: 'vitamin-b12', amountPerServing: 25 },
			{ nutrientId: 'zinc', amountPerServing: 10 },
			{ nutrientId: 'selenium', amountPerServing: 55 },
			{ nutrientId: 'iodine', amountPerServing: 150 },
			{ nutrientId: 'copper', amountPerServing: 1 },
			{ nutrientId: 'manganese', amountPerServing: 2 },
			{ nutrientId: 'chromium', amountPerServing: 40 }
		]
	},
	{
		id: 'p-creatine',
		brand: 'Kestrel Nutrition',
		name: 'Creatine Monohydrate',
		form: 'powder',
		unitsPerServing: 1,
		unitsPerContainer: 60,
		price: 22.0,
		tags: ['performance', 'creapure', 'unflavoured'],
		ingredients: [{ nutrientId: 'creatine', amountPerServing: 5 }],
		notes: 'One 5 g scoop. Timing does not matter; daily consistency does.'
	},
	{
		id: 'p-ashwagandha',
		brand: 'Vireo',
		name: 'Ashwagandha KSM-66 600',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 60,
		price: 19.0,
		tags: ['adaptogen', 'stress'],
		ingredients: [{ nutrientId: 'ashwagandha', amountPerServing: 600 }]
	},
	{
		id: 'p-theanine',
		brand: 'Halo Labs',
		name: 'L-Theanine 200',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 120,
		price: 16.0,
		tags: ['calm', 'focus'],
		ingredients: [{ nutrientId: 'l-theanine', amountPerServing: 200 }]
	},
	{
		id: 'p-melatonin',
		brand: 'Solstice',
		name: 'Melatonin 0.5 Micro-dose',
		form: 'tablet',
		unitsPerServing: 1,
		unitsPerContainer: 180,
		price: 9.5,
		tags: ['sleep', 'jet lag'],
		ingredients: [{ nutrientId: 'melatonin', amountPerServing: 0.5 }],
		notes: 'Deliberately low. Most people do better on 0.3–1 mg than on 5 mg.'
	},
	{
		id: 'p-bcomplex',
		brand: 'Terra Vitae',
		name: 'Methylated B-Complex',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 60,
		price: 21.0,
		tags: ['methylated', 'energy'],
		ingredients: [
			{ nutrientId: 'thiamin', amountPerServing: 25 },
			{ nutrientId: 'riboflavin', amountPerServing: 25 },
			{ nutrientId: 'niacin', amountPerServing: 30 },
			{ nutrientId: 'pantothenic-acid', amountPerServing: 25 },
			{ nutrientId: 'vitamin-b6', amountPerServing: 10 },
			{ nutrientId: 'biotin', amountPerServing: 300 },
			{ nutrientId: 'folate', amountPerServing: 400 },
			{ nutrientId: 'vitamin-b12', amountPerServing: 500 }
		]
	},
	{
		id: 'p-vitc',
		brand: 'Atlas Basics',
		name: 'Vitamin C 1000 + Bioflavonoids',
		form: 'tablet',
		unitsPerServing: 1,
		unitsPerContainer: 100,
		price: 12.0,
		tags: ['immune', 'antioxidant'],
		ingredients: [{ nutrientId: 'vitamin-c', amountPerServing: 1000 }]
	},
	{
		id: 'p-curcumin',
		brand: 'Vireo',
		name: 'Curcumin Phytosome + Piperine',
		form: 'capsule',
		unitsPerServing: 2,
		unitsPerContainer: 60,
		price: 32.0,
		tags: ['anti-inflammatory', 'joints'],
		ingredients: [
			{ nutrientId: 'curcumin', amountPerServing: 500 },
			{ nutrientId: 'piperine', amountPerServing: 5 }
		]
	},
	{
		id: 'p-coq10',
		brand: 'Nordkap',
		name: 'Ubiquinol 100',
		form: 'softgel',
		unitsPerServing: 1,
		unitsPerContainer: 60,
		price: 38.0,
		tags: ['mitochondrial', 'statin support'],
		ingredients: [{ nutrientId: 'coq10', amountPerServing: 100 }]
	},
	{
		id: 'p-collagen',
		brand: 'Pale Blue',
		name: 'Collagen Peptides Unflavoured',
		form: 'powder',
		unitsPerServing: 1,
		unitsPerContainer: 30,
		price: 34.0,
		tags: ['skin', 'joints', 'type I & III'],
		ingredients: [
			{ nutrientId: 'collagen', amountPerServing: 10 },
			{ nutrientId: 'vitamin-c', amountPerServing: 40 }
		]
	},
	{
		id: 'p-probiotic',
		brand: 'Meridian',
		name: 'Multi-Strain Probiotic 50B',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 30,
		price: 29.0,
		tags: ['gut', 'refrigerate'],
		ingredients: [{ nutrientId: 'probiotic', amountPerServing: 50 }]
	},
	{
		id: 'p-calmagzinc',
		brand: 'Atlas Basics',
		name: 'Cal-Mag-Zinc',
		form: 'tablet',
		unitsPerServing: 3,
		unitsPerContainer: 90,
		price: 15.0,
		tags: ['bone', 'value'],
		ingredients: [
			{ nutrientId: 'calcium', amountPerServing: 1000 },
			{ nutrientId: 'magnesium', amountPerServing: 400 },
			{ nutrientId: 'zinc', amountPerServing: 15 }
		],
		notes: 'The classic combination product — convenient, and three minerals that compete.'
	},
	{
		id: 'p-glycine',
		brand: 'Kestrel Nutrition',
		name: 'Glycine Powder',
		form: 'powder',
		unitsPerServing: 1,
		unitsPerContainer: 60,
		price: 18.0,
		tags: ['sleep', 'sweet-tasting'],
		ingredients: [{ nutrientId: 'glycine', amountPerServing: 3 }]
	},
	{
		id: 'p-nac',
		brand: 'Halo Labs',
		name: 'NAC 600',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 90,
		price: 17.5,
		tags: ['glutathione', 'liver'],
		ingredients: [{ nutrientId: 'nac', amountPerServing: 600 }]
	},
	{
		id: 'p-ala',
		brand: 'Vireo',
		name: 'Alpha-Lipoic Acid 300',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 60,
		price: 20.0,
		tags: ['antioxidant', 'glucose'],
		ingredients: [{ nutrientId: 'alpha-lipoic-acid', amountPerServing: 300 }]
	},
	{
		id: 'p-lionsmane',
		brand: 'Vireo',
		name: "Lion's Mane Dual Extract",
		form: 'capsule',
		unitsPerServing: 2,
		unitsPerContainer: 60,
		price: 27.0,
		tags: ['mushroom', 'nootropic'],
		ingredients: [{ nutrientId: 'lions-mane', amountPerServing: 1000 }]
	},
	{
		id: 'p-rhodiola',
		brand: 'Solstice',
		name: 'Rhodiola Rosea 3% Rosavins',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 60,
		price: 18.5,
		tags: ['adaptogen', 'stimulating'],
		ingredients: [{ nutrientId: 'rhodiola', amountPerServing: 400 }]
	},
	{
		id: 'p-bacopa',
		brand: 'Solstice',
		name: 'Bacopa Monnieri 50% Bacosides',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 60,
		price: 16.5,
		tags: ['nootropic', 'slow-acting'],
		ingredients: [{ nutrientId: 'bacopa', amountPerServing: 300 }]
	},
	{
		id: 'p-joint',
		brand: 'Meridian',
		name: 'Joint Complex (Glucosamine + MSM)',
		form: 'tablet',
		unitsPerServing: 2,
		unitsPerContainer: 120,
		price: 24.0,
		tags: ['joints', 'cartilage'],
		ingredients: [
			{ nutrientId: 'glucosamine', amountPerServing: 1500 },
			{ nutrientId: 'msm', amountPerServing: 1000 },
			{ nutrientId: 'vitamin-c', amountPerServing: 80 }
		]
	},
	{
		id: 'p-focus',
		brand: 'Kestrel Nutrition',
		name: 'Focus Caps (Caffeine + Theanine)',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 90,
		price: 15.0,
		tags: ['stimulant', 'focus'],
		ingredients: [
			{ nutrientId: 'caffeine', amountPerServing: 100 },
			{ nutrientId: 'l-theanine', amountPerServing: 200 }
		]
	},
	{
		id: 'p-electrolytes',
		brand: 'Kestrel Nutrition',
		name: 'Electrolyte Sachets',
		form: 'sachet',
		unitsPerServing: 1,
		unitsPerContainer: 30,
		price: 26.0,
		tags: ['hydration', 'training'],
		ingredients: [
			{ nutrientId: 'potassium', amountPerServing: 400 },
			{ nutrientId: 'magnesium', amountPerServing: 60 }
		]
	},
	{
		id: 'p-kelp',
		brand: 'Boreal',
		name: 'Kelp Iodine 150',
		form: 'tablet',
		unitsPerServing: 1,
		unitsPerContainer: 120,
		price: 9.0,
		tags: ['thyroid', 'whole-food'],
		ingredients: [{ nutrientId: 'iodine', amountPerServing: 150 }]
	},
	{
		id: 'p-selenium',
		brand: 'Halo Labs',
		name: 'Selenium 200 (Se-Methyl)',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 90,
		price: 12.5,
		tags: ['thyroid', 'antioxidant'],
		ingredients: [{ nutrientId: 'selenium', amountPerServing: 200 }]
	},
	{
		id: 'p-vita',
		brand: 'Nordkap',
		name: 'Vitamin A Retinyl 3000 IU',
		form: 'softgel',
		unitsPerServing: 1,
		unitsPerContainer: 100,
		price: 13.0,
		tags: ['fat-soluble', 'skin'],
		ingredients: [{ nutrientId: 'vitamin-a', amountPerServing: 900 }]
	},
	{
		id: 'p-vite',
		brand: 'Nordkap',
		name: 'Mixed Tocopherols E',
		form: 'softgel',
		unitsPerServing: 1,
		unitsPerContainer: 60,
		price: 16.0,
		tags: ['fat-soluble', 'antioxidant'],
		ingredients: [{ nutrientId: 'vitamin-e', amountPerServing: 100 }]
	},
	{
		id: 'p-elderberry',
		brand: 'Terra Vitae',
		name: 'Elderberry + Zinc Gummies',
		form: 'gummy',
		unitsPerServing: 2,
		unitsPerContainer: 60,
		price: 17.0,
		tags: ['immune', 'winter', 'contains sugar'],
		ingredients: [
			{ nutrientId: 'elderberry', amountPerServing: 200 },
			{ nutrientId: 'zinc', amountPerServing: 5 },
			{ nutrientId: 'vitamin-c', amountPerServing: 60 }
		]
	},
	{
		id: 'p-taurine',
		brand: 'Kestrel Nutrition',
		name: 'Taurine 1000',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 100,
		price: 14.0,
		tags: ['endurance', 'heart'],
		ingredients: [{ nutrientId: 'taurine', amountPerServing: 1000 }]
	},
	{
		id: 'p-tyrosine',
		brand: 'Kestrel Nutrition',
		name: 'L-Tyrosine 500',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 120,
		price: 16.0,
		tags: ['focus', 'stress'],
		ingredients: [{ nutrientId: 'l-tyrosine', amountPerServing: 500 }]
	},
	{
		id: 'p-betaine',
		brand: 'Kestrel Nutrition',
		name: 'Betaine Anhydrous',
		form: 'powder',
		unitsPerServing: 1,
		unitsPerContainer: 60,
		price: 19.0,
		tags: ['performance', 'unflavoured'],
		ingredients: [{ nutrientId: 'betaine', amountPerServing: 2500 }]
	},
	{
		id: 'p-choline',
		brand: 'Solstice',
		name: 'Alpha-GPC Choline 300',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 60,
		price: 25.0,
		tags: ['nootropic', 'acetylcholine'],
		ingredients: [{ nutrientId: 'choline', amountPerServing: 300 }]
	},
	{
		id: 'p-boron',
		brand: 'Halo Labs',
		name: 'Boron 3',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 100,
		price: 9.0,
		tags: ['bone', 'hormonal'],
		ingredients: [{ nutrientId: 'boron', amountPerServing: 3 }]
	},
	{
		id: 'p-saffron',
		brand: 'Vireo',
		name: 'Saffron Extract 30',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 60,
		price: 28.0,
		tags: ['mood', 'expensive'],
		ingredients: [{ nutrientId: 'saffron-extract', amountPerServing: 30 }]
	},
	{
		id: 'p-ginger',
		brand: 'Terra Vitae',
		name: 'Ginger Root Extract 500',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 90,
		price: 13.0,
		tags: ['digestion', 'anti-inflammatory'],
		ingredients: [{ nutrientId: 'ginger', amountPerServing: 500 }]
	},
	{
		id: 'p-copper',
		brand: 'Halo Labs',
		name: 'Copper Bisglycinate 2',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 100,
		price: 8.5,
		tags: ['mineral balance'],
		ingredients: [{ nutrientId: 'copper', amountPerServing: 2 }]
	},
	{
		id: 'p-codliver',
		brand: 'Boreal',
		name: 'Cod Liver Oil (liquid)',
		form: 'liquid',
		unitsPerServing: 1,
		unitsPerContainer: 48,
		price: 21.0,
		tags: ['traditional', 'contains vitamin A'],
		ingredients: [
			{ nutrientId: 'vitamin-a', amountPerServing: 250 },
			{ nutrientId: 'vitamin-d', amountPerServing: 10 },
			{ nutrientId: 'epa', amountPerServing: 400 },
			{ nutrientId: 'dha', amountPerServing: 500 }
		],
		notes: 'One 5 ml serving. Retinol content stacks with any multivitamin — watch the A ceiling.'
	},
	{
		id: 'p-potassium',
		brand: 'Atlas Basics',
		name: 'Potassium Citrate 99',
		form: 'tablet',
		unitsPerServing: 1,
		unitsPerContainer: 100,
		price: 8.0,
		tags: ['electrolyte'],
		ingredients: [{ nutrientId: 'potassium', amountPerServing: 99 }]
	},
	{
		id: 'p-chromium',
		brand: 'Halo Labs',
		name: 'Chromium Picolinate 200',
		form: 'capsule',
		unitsPerServing: 1,
		unitsPerContainer: 100,
		price: 8.0,
		tags: ['glucose'],
		ingredients: [{ nutrientId: 'chromium', amountPerServing: 200 }]
	}
];
