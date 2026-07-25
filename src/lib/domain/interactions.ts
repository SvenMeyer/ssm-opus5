import { hoursApart } from './date';
import { getNutrient } from './nutrients';
import { activeItems, slotsInOrder } from './schedule';
import type { NutrientTotal } from './totals';
import type {
	AppData,
	Dose,
	FoodRequirement,
	Product,
	Rule,
	Severity,
	Slot,
	SlotKind,
	StackItem
} from './types';

export type FindingKind = 'conflict' | 'synergy' | 'timing' | 'ceiling';

/**
 * A machine-applicable remedy. Every negative finding that *can* be fixed by
 * rescheduling carries one, so the UI never says "this is wrong" without also
 * offering the button that makes it right.
 */
export type Fix =
	| {
			type: 'move-dose';
			stackItemId: string;
			fromSlotId: string;
			toSlotId: string;
			label: string;
	  }
	| {
			type: 'set-food';
			stackItemId: string;
			slotId: string;
			withFood: FoodRequirement;
			label: string;
	  };

export interface Finding {
	/** Stable across recomputes so the UI can key on it and animate dismissals. */
	id: string;
	ruleId: string;
	kind: FindingKind;
	severity: Severity;
	/** True for synergies that are already working — shown as a win, not a problem. */
	positive: boolean;
	title: string;
	detail: string;
	stackItemIds: string[];
	slotIds: string[];
	fix?: Fix;
}

interface Ctx {
	slots: Slot[];
	slotById: Map<string, Slot>;
	productById: Map<string, Product>;
	items: StackItem[];
}

function buildCtx(data: AppData): Ctx {
	const slots = slotsInOrder(data.slots);
	return {
		slots,
		slotById: new Map(slots.map((s) => [s.id, s])),
		productById: new Map(data.products.map((p) => [p.id, p])),
		items: activeItems(data.stack)
	};
}

function productOf(ctx: Ctx, item: StackItem): Product | undefined {
	return ctx.productById.get(item.productId);
}

/** Items whose product contains at least one of these nutrients. */
function itemsWith(ctx: Ctx, nutrientIds: string[]): StackItem[] {
	return ctx.items.filter((item) => {
		const product = productOf(ctx, item);
		return product?.ingredients.some((i) => nutrientIds.includes(i.nutrientId)) ?? false;
	});
}

function nutrientNames(ids: string[]): string {
	const names = ids.map((id) => getNutrient(id)?.name ?? id);
	if (names.length <= 1) return names[0] ?? '';
	return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

function label(ctx: Ctx, item: StackItem): string {
	return productOf(ctx, item)?.name ?? 'Unknown product';
}

/**
 * The slot that puts `dose` as far as possible from every slot in `avoid`.
 * Returns null when no slot achieves the required separation — better to say
 * "no good time exists" than to suggest a move that fixes nothing.
 */
function bestSlotAwayFrom(
	ctx: Ctx,
	avoidSlotIds: string[],
	currentSlotId: string,
	minHours: number
): Slot | null {
	const avoid = avoidSlotIds
		.map((id) => ctx.slotById.get(id))
		.filter((s): s is Slot => s !== undefined);
	if (avoid.length === 0) return null;

	let best: { slot: Slot; distance: number } | null = null;
	for (const slot of ctx.slots) {
		if (slot.id === currentSlotId) continue;
		const distance = Math.min(...avoid.map((a) => hoursApart(slot.time, a.time)));
		if (distance < minHours) continue;
		if (!best || distance > best.distance) best = { slot, distance };
	}
	return best?.slot ?? null;
}

/** What a dose effectively means for food, once the slot's own nature is considered. */
function effectiveFood(dose: Dose, slot: Slot | undefined): FoodRequirement {
	if (dose.withFood !== 'any') return dose.withFood;
	if (slot?.kind === 'meal') return 'with';
	if (slot?.kind === 'fasted' || slot?.kind === 'bed') return 'without';
	return 'any';
}

const SLOT_KIND_LABEL: Record<SlotKind, string> = {
	fasted: 'an empty-stomach slot',
	meal: 'a slot with a meal',
	workout: 'a slot around training',
	bed: 'a slot before bed'
};

function evaluateConflict(ctx: Ctx, rule: Rule): Finding[] {
	const findings: Finding[] = [];
	const minHours = rule.minSeparationHours ?? 2;
	const aItems = itemsWith(ctx, rule.a);
	const bItems = itemsWith(ctx, rule.b ?? []);
	const seen = new Set<string>();

	for (const a of aItems) {
		for (const b of bItems) {
			// Both sides inside one product cannot be separated by scheduling.
			if (a.id === b.id) {
				const id = `${rule.id}:${a.id}`;
				if (seen.has(id)) continue;
				seen.add(id);
				findings.push({
					id,
					ruleId: rule.id,
					kind: 'conflict',
					severity: 'info',
					positive: false,
					title: rule.title,
					detail: `${label(ctx, a)} contains both ${nutrientNames(rule.a)} and ${nutrientNames(
						rule.b ?? []
					)}, so they cannot be separated by timing. ${rule.message}`,
					stackItemIds: [a.id],
					slotIds: a.doses.map((d) => d.slotId)
				});
				continue;
			}

			const pairKey = [a.id, b.id].sort().join('|');
			const id = `${rule.id}:${pairKey}`;
			if (seen.has(id)) continue;

			const clashes: { aSlot: string; bSlot: string }[] = [];
			for (const aDose of a.doses) {
				for (const bDose of b.doses) {
					const aSlot = ctx.slotById.get(aDose.slotId);
					const bSlot = ctx.slotById.get(bDose.slotId);
					if (!aSlot || !bSlot) continue;
					if (hoursApart(aSlot.time, bSlot.time) < minHours) {
						clashes.push({ aSlot: aSlot.id, bSlot: bSlot.id });
					}
				}
			}
			if (clashes.length === 0) continue;
			seen.add(id);

			// Move whichever side has fewer doses — the smaller disruption.
			const mover = b.doses.length <= a.doses.length ? b : a;
			const anchor = mover === b ? a : b;
			const moverSlotId = (mover === b ? clashes[0].bSlot : clashes[0].aSlot) as string;
			const target = bestSlotAwayFrom(
				ctx,
				anchor.doses.map((d) => d.slotId),
				moverSlotId,
				minHours
			);

			findings.push({
				id,
				ruleId: rule.id,
				kind: 'conflict',
				severity: rule.severity,
				positive: false,
				title: rule.title,
				detail: `${label(ctx, a)} and ${label(ctx, b)} are scheduled less than ${minHours}h apart. ${rule.message}`,
				stackItemIds: [a.id, b.id],
				slotIds: [...new Set(clashes.flatMap((c) => [c.aSlot, c.bSlot]))],
				fix: target
					? {
							type: 'move-dose',
							stackItemId: mover.id,
							fromSlotId: moverSlotId,
							toSlotId: target.id,
							label: `Move ${label(ctx, mover)} to ${target.label}`
						}
					: undefined
			});
		}
	}
	return findings;
}

function evaluateSynergy(ctx: Ctx, rule: Rule): Finding[] {
	const aItems = itemsWith(ctx, rule.a);
	const bItems = itemsWith(ctx, rule.b ?? []);
	if (aItems.length === 0 || bItems.length === 0) return [];

	const findings: Finding[] = [];
	const seen = new Set<string>();

	for (const a of aItems) {
		for (const b of bItems) {
			if (a.id === b.id) continue;
			const pairKey = [a.id, b.id].sort().join('|');
			const id = `${rule.id}:${pairKey}`;
			if (seen.has(id)) continue;
			seen.add(id);

			const aSlots = new Set(a.doses.map((d) => d.slotId));
			const shared = b.doses.find((d) => aSlots.has(d.slotId));

			if (shared) {
				findings.push({
					id,
					ruleId: rule.id,
					kind: 'synergy',
					severity: 'info',
					positive: true,
					title: rule.title,
					detail: `${label(ctx, a)} and ${label(ctx, b)} already share the ${
						ctx.slotById.get(shared.slotId)?.label ?? 'same'
					} slot. ${rule.message}`,
					stackItemIds: [a.id, b.id],
					slotIds: [shared.slotId]
				});
				continue;
			}

			const targetSlotId = a.doses[0]?.slotId;
			const target = targetSlotId ? ctx.slotById.get(targetSlotId) : undefined;
			findings.push({
				id,
				ruleId: rule.id,
				kind: 'synergy',
				severity: 'info',
				positive: false,
				title: rule.title,
				detail: `${label(ctx, a)} and ${label(ctx, b)} are taken at different times. ${rule.message}`,
				stackItemIds: [a.id, b.id],
				slotIds: [...aSlots, ...b.doses.map((d) => d.slotId)],
				fix:
					target && b.doses[0]
						? {
								type: 'move-dose',
								stackItemId: b.id,
								fromSlotId: b.doses[0].slotId,
								toSlotId: target.id,
								label: `Take ${label(ctx, b)} at ${target.label} too`
							}
						: undefined
			});
		}
	}
	return findings;
}

function evaluateTiming(ctx: Ctx, rule: Rule): Finding[] {
	const findings: Finding[] = [];

	for (const item of itemsWith(ctx, rule.a)) {
		for (const dose of item.doses) {
			const slot = ctx.slotById.get(dose.slotId);
			if (!slot) continue;

			if (rule.wants?.slotKind && slot.kind !== rule.wants.slotKind) {
				const target = ctx.slots.find((s) => s.kind === rule.wants?.slotKind);
				findings.push({
					id: `${rule.id}:${item.id}:${slot.id}`,
					ruleId: rule.id,
					kind: 'timing',
					severity: rule.severity,
					positive: false,
					title: rule.title,
					detail: `${label(ctx, item)} is scheduled at ${slot.label}, but wants ${
						SLOT_KIND_LABEL[rule.wants.slotKind]
					}. ${rule.message}`,
					stackItemIds: [item.id],
					slotIds: [slot.id],
					fix: target
						? {
								type: 'move-dose',
								stackItemId: item.id,
								fromSlotId: slot.id,
								toSlotId: target.id,
								label: `Move to ${target.label}`
							}
						: undefined
				});
				continue;
			}

			const wantedFood = rule.wants?.food;
			if (!wantedFood || wantedFood === 'any') continue;
			if (effectiveFood(dose, slot) === wantedFood) continue;

			const mealSlot =
				wantedFood === 'with'
					? ctx.slots.find((s) => s.kind === 'meal')
					: ctx.slots.find((s) => s.kind === 'fasted');

			findings.push({
				id: `${rule.id}:${item.id}:${slot.id}`,
				ruleId: rule.id,
				kind: 'timing',
				severity: rule.severity,
				positive: false,
				title: rule.title,
				detail: `${label(ctx, item)} at ${slot.label} is not marked "${
					wantedFood === 'with' ? 'with food' : 'on an empty stomach'
				}". ${rule.message}`,
				stackItemIds: [item.id],
				slotIds: [slot.id],
				fix:
					mealSlot && mealSlot.id !== slot.id
						? {
								type: 'move-dose',
								stackItemId: item.id,
								fromSlotId: slot.id,
								toSlotId: mealSlot.id,
								label: `Move to ${mealSlot.label}`
							}
						: {
								type: 'set-food',
								stackItemId: item.id,
								slotId: slot.id,
								withFood: wantedFood,
								label: wantedFood === 'with' ? 'Mark as with food' : 'Mark as empty stomach'
							}
			});
		}
	}
	return findings;
}

const SEVERITY_RANK: Record<Severity, number> = { warning: 0, caution: 1, info: 2 };

/** Problems first, worst first; positive notes always last. */
export function compareFindings(a: Finding, b: Finding): number {
	if (a.positive !== b.positive) return a.positive ? 1 : -1;
	const bySeverity = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
	if (bySeverity !== 0) return bySeverity;
	return a.title.localeCompare(b.title);
}

function evaluateRules(data: AppData, rules: Rule[]): Finding[] {
	const ctx = buildCtx(data);
	const findings: Finding[] = [];

	for (const rule of rules) {
		if (rule.kind === 'conflict') findings.push(...evaluateConflict(ctx, rule));
		else if (rule.kind === 'synergy') findings.push(...evaluateSynergy(ctx, rule));
		else findings.push(...evaluateTiming(ctx, rule));
	}

	return findings;
}

function problemCount(data: AppData, rules: Rule[]): number {
	return evaluateRules(data, rules).filter((f) => !f.positive).length;
}

/**
 * Check every proposed move against the *whole* rulebook, not just the rule that
 * proposed it.
 *
 * Each rule reasons in isolation, so "iron absorbs best fasted" will happily suggest
 * moving iron to the wake slot — straight into the zinc it was told to avoid. This pass
 * simulates each move, keeps the target slot that leaves the stack with the fewest
 * problems overall, and drops the button entirely when no slot actually helps. A fix
 * that trades one warning for another is worse than no fix, because the user trusts it.
 */
function refineFix(finding: Finding, data: AppData, rules: Rule[], baseline: number): Finding {
	const fix = finding.fix;
	if (!fix) return finding;

	// Synergy fixes are about combining two doses; there is nothing to search for.
	if (finding.kind === 'synergy') return finding;

	if (fix.type === 'set-food') {
		const after = problemCount({ ...data, stack: applyFix(data.stack, fix) }, rules);
		return after < baseline ? finding : { ...finding, fix: undefined };
	}

	const candidates = [
		fix.toSlotId,
		...data.slots.map((s) => s.id).filter((id) => id !== fix.fromSlotId && id !== fix.toSlotId)
	];

	let best: { slotId: string; problems: number } | null = null;
	for (const slotId of candidates) {
		const problems = problemCount(
			{ ...data, stack: applyFix(data.stack, { ...fix, toSlotId: slotId }) },
			rules
		);
		// Strictly better wins; ties keep the earlier candidate, so the rule's own
		// preferred slot stays first choice when nothing beats it.
		if (!best || problems < best.problems) best = { slotId, problems };
	}

	if (!best || best.problems >= baseline) return { ...finding, fix: undefined };
	if (best.slotId === fix.toSlotId) return finding;

	const slot = data.slots.find((s) => s.id === best!.slotId);
	if (!slot) return finding;
	return {
		...finding,
		fix: {
			...fix,
			toSlotId: slot.id,
			label: `${fix.label.split(' to ')[0]} to ${slot.label}`
		}
	};
}

/**
 * Evaluate all rules against the *scheduled* stack.
 *
 * The distinction matters: zinc and iron in the same stack is not a problem, zinc and
 * iron in the same slot is. Ingredient lists alone would cry wolf on every finding here.
 */
export function evaluateInteractions(data: AppData, rules: Rule[]): Finding[] {
	const findings = evaluateRules(data, rules);
	const baseline = findings.filter((f) => !f.positive).length;
	return findings.map((f) => refineFix(f, data, rules, baseline)).sort(compareFindings);
}

/** Ceiling breaches expressed as findings, so one page can show every risk together. */
export function ceilingFindings(totals: NutrientTotal[]): Finding[] {
	return totals
		.filter((t) => t.status === 'over' || t.status === 'high')
		.map((t) => {
			const over = t.status === 'over';
			const contributors = t.contributions.length;
			return {
				id: `ceiling:${t.nutrient.id}`,
				ruleId: 'ceiling',
				kind: 'ceiling' as const,
				severity: (over ? 'warning' : 'caution') as Severity,
				positive: false,
				title: `${t.nutrient.name} ${over ? 'over the upper limit' : 'near the upper limit'}`,
				detail: `Your stack delivers ${t.amount} ${t.nutrient.unit} a day — ${Math.round(
					t.percentUl ?? 0
				)}% of the ${t.nutrient.ul} ${t.nutrient.unit} ceiling, from ${contributors} ${
					contributors === 1 ? 'product' : 'products'
				}.`,
				stackItemIds: t.contributions.map((c) => c.stackItemId),
				slotIds: []
			};
		});
}

/** Findings that involve one particular stack item — used on the item detail page. */
export function findingsForItem(findings: Finding[], stackItemId: string): Finding[] {
	return findings.filter((f) => f.stackItemIds.includes(stackItemId));
}

/** Apply a fix to a stack, returning a new stack array. Pure — no mutation. */
export function applyFix(stack: StackItem[], fix: Fix): StackItem[] {
	return stack.map((item) => {
		if (item.id !== fix.stackItemId) return item;

		if (fix.type === 'set-food') {
			return {
				...item,
				doses: item.doses.map((d) =>
					d.slotId === fix.slotId ? { ...d, withFood: fix.withFood } : d
				)
			};
		}

		const moving = item.doses.find((d) => d.slotId === fix.fromSlotId);
		if (!moving) return item;
		const existing = item.doses.find((d) => d.slotId === fix.toSlotId);

		// Moving onto a slot that already has a dose merges the servings rather than
		// leaving two entries the schedule editor would render as duplicates.
		const doses = item.doses
			.filter((d) => d.slotId !== fix.fromSlotId && d.slotId !== fix.toSlotId)
			.concat({
				slotId: fix.toSlotId,
				servings: moving.servings + (existing?.servings ?? 0),
				withFood: moving.withFood
			});

		return { ...item, doses };
	});
}
