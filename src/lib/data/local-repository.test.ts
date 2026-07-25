import { beforeEach, describe, expect, it } from 'vitest';
import { LocalRepository } from './local-repository';

/** Minimal in-memory stand-in; the repository only ever uses these three methods. */
function installFakeStorage() {
	const map = new Map<string, string>();
	const storage = {
		getItem: (k: string) => map.get(k) ?? null,
		setItem: (k: string, v: string) => void map.set(k, v),
		removeItem: (k: string) => void map.delete(k)
	};
	Object.defineProperty(globalThis, 'localStorage', {
		value: storage,
		configurable: true,
		writable: true
	});
	return map;
}

describe('LocalRepository', () => {
	let stored: Map<string, string>;

	beforeEach(() => {
		stored = installFakeStorage();
	});

	function persisted() {
		return JSON.parse(stored.get('ssm:data') ?? '{}');
	}

	it('persists two tables written back to back without losing either', async () => {
		// The real regression: removing a slot writes `slots` and `stack` together. When
		// both writes read the document asynchronously they both saw the pre-update copy
		// and the second silently reverted the first.
		const repo = new LocalRepository();
		const data = await repo.load();

		const slots = data.slots.filter((s) => s.id !== 'bedtime');
		const stack = data.stack.map((i) => ({
			...i,
			doses: i.doses.filter((d) => d.slotId !== 'bedtime')
		}));

		await Promise.all([repo.saveSlots(slots), repo.saveStack(stack)]);

		const after = persisted();
		expect(after.slots.some((s: { id: string }) => s.id === 'bedtime')).toBe(false);
		expect(
			after.stack.some((i: { doses: { slotId: string }[] }) =>
				i.doses.some((d) => d.slotId === 'bedtime')
			)
		).toBe(false);
	});

	it('survives a reload — a fresh repository reads back what was written', async () => {
		const first = new LocalRepository();
		const data = await first.load();
		await first.saveSlots(data.slots.filter((s) => s.id !== 'midday'));

		const second = new LocalRepository();
		const reloaded = await second.load();
		expect(reloaded.slots.some((s) => s.id === 'midday')).toBe(false);
	});

	it('discards stored data written by an older schema version', async () => {
		stored.set('ssm:data', JSON.stringify({ version: 0, slots: [], stack: [] }));
		const repo = new LocalRepository();
		const data = await repo.load();
		expect(data.slots.length).toBeGreaterThan(0);
	});

	it('reseeds on reset', async () => {
		const repo = new LocalRepository();
		await repo.saveSlots([]);
		const fresh = await repo.reset();
		expect(fresh.slots.length).toBeGreaterThan(0);
		expect(persisted().slots.length).toBeGreaterThan(0);
	});
});
