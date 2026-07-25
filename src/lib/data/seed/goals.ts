import type { Goal } from '$lib/domain/types';

/**
 * Goals are the "why" layer. Each one names the nutrients that plausibly serve it, which
 * is what the coverage meter measures the stack against — so a goal can be *assigned*
 * supplements and still read as poorly covered, which is exactly the useful signal.
 */
export const SEED_GOALS: Goal[] = [
	{
		id: 'sleep',
		name: 'Sleep',
		blurb: 'Fall asleep faster, wake less, feel rested.',
		color: '#6C63C4',
		nutrientIds: ['magnesium', 'glycine', 'l-theanine', 'melatonin', 'ashwagandha']
	},
	{
		id: 'energy',
		name: 'Energy',
		blurb: 'Daytime output without the caffeine debt.',
		color: '#C97C2A',
		nutrientIds: [
			'iron',
			'vitamin-b12',
			'folate',
			'thiamin',
			'riboflavin',
			'coq10',
			'creatine',
			'rhodiola'
		]
	},
	{
		id: 'immunity',
		name: 'Immunity',
		blurb: 'Fewer, shorter infections through the winter.',
		color: '#2E8B7A',
		nutrientIds: ['vitamin-d', 'zinc', 'vitamin-c', 'selenium', 'elderberry', 'probiotic']
	},
	{
		id: 'joints',
		name: 'Joints',
		blurb: 'Less stiffness, better recovery from load.',
		color: '#B4553F',
		nutrientIds: ['collagen', 'glucosamine', 'msm', 'curcumin', 'epa', 'vitamin-c', 'ginger']
	},
	{
		id: 'cognition',
		name: 'Cognition',
		blurb: 'Focus, working memory, mental stamina.',
		color: '#3D5AFE',
		nutrientIds: [
			'dha',
			'choline',
			'l-theanine',
			'bacopa',
			'lions-mane',
			'l-tyrosine',
			'vitamin-b12'
		]
	},
	{
		id: 'longevity',
		name: 'Longevity',
		blurb: 'The unglamorous basics with the best long-run evidence.',
		color: '#5A6B4E',
		nutrientIds: ['vitamin-d', 'vitamin-k2', 'epa', 'dha', 'magnesium', 'nac', 'coq10']
	}
];
