import type { Slot } from '$lib/domain/types';

/**
 * Default day structure. Users can rename, retime, add and remove these in Settings —
 * the timing engine reads `time` and `kind`, never the id, so custom slots work fully.
 */
export const SEED_SLOTS: Slot[] = [
	{ id: 'wake', label: 'Wake', time: '07:00', kind: 'fasted' },
	{ id: 'breakfast', label: 'Breakfast', time: '08:30', kind: 'meal' },
	{ id: 'midday', label: 'Midday', time: '12:30', kind: 'meal' },
	{ id: 'training', label: 'Pre-training', time: '17:00', kind: 'workout' },
	{ id: 'dinner', label: 'Dinner', time: '19:00', kind: 'meal' },
	{ id: 'bedtime', label: 'Bedtime', time: '22:30', kind: 'bed' }
];
