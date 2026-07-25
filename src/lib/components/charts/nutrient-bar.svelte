<script lang="ts">
	import type { NutrientStatus } from '$lib/domain/totals';
	import type { Nutrient } from '$lib/domain/types';
	import { cn } from '$lib/utils/format';
	import { nutrientTone, TONE_BG } from '$lib/utils/status';

	/**
	 * The signature component.
	 *
	 * A capsule track with two reference marks: a solid tick at the daily target and a
	 * dashed tick at the tolerable upper limit. Reading it needs no legend — the fill
	 * either reaches the solid mark or it does not, and it either crosses the dashed one
	 * or it does not.
	 *
	 * The scale is deliberately **not** linear. On a linear axis vitamin C's 90 mg target
	 * sits at 4% of its 2000 mg ceiling, so every realistic dose is an invisible sliver
	 * and the one question the bar exists to answer — am I near my target? — cannot be
	 * read at all. Instead the two reference values are pinned to fixed positions, so the
	 * marks line up down the whole page and a row is scannable at a glance. Above the
	 * higher reference the scale compresses asymptotically: 200% and 800% of a ceiling
	 * both read as "well past it", which is the only distinction that matters there.
	 *
	 * Magnesium is the case that proves the design. Its supplemental ceiling (350 mg)
	 * sits *below* its target (420 mg), so the marks are anchored by which value is
	 * lower, not by which one is the target — and the dashed tick correctly appears to
	 * the left of the solid one.
	 */
	let {
		nutrient,
		amount,
		status,
		height = 'md',
		showTicks = true
	}: {
		nutrient: Nutrient;
		amount: number;
		status: NutrientStatus;
		height?: 'sm' | 'md';
		showTicks?: boolean;
	} = $props();

	/** Where the lower and higher reference values sit, as a percentage of the track. */
	const LOW_POS = 55;
	const HIGH_POS = 88;

	const refs = $derived.by(() => {
		const values = [nutrient.rda, nutrient.ul].filter((v): v is number => v !== undefined);
		if (values.length === 0) return null;
		return { low: Math.min(...values), high: Math.max(...values) };
	});

	/** Diminishing returns above the top reference — never quite reaching the end. */
	const beyond = (value: number, anchor: number, from: number) =>
		anchor <= 0 ? 100 : from + (1 - anchor / value) * (100 - from);

	function position(value: number): number {
		if (value <= 0) return 0;
		if (!refs) return 100;

		const { low, high } = refs;
		if (low === high) {
			return value <= low ? (value / low) * HIGH_POS : beyond(value, high, HIGH_POS);
		}
		if (value <= low) return (value / low) * LOW_POS;
		if (value <= high) return LOW_POS + ((value - low) / (high - low)) * (HIGH_POS - LOW_POS);
		return beyond(value, high, HIGH_POS);
	}

	const tone = $derived(nutrientTone(status));
	const fill = $derived(Math.min(100, position(amount)));

	/**
	 * With no reference value there is no scale, so the bar fills completely — a solid
	 * block would read as "maxed out". Muted, it reads as what it is: present, unmeasured.
	 */
	const fillClass = $derived(status === 'unrated' ? 'bg-inert/30' : TONE_BG[tone]);
</script>

<div class={cn('relative w-full', height === 'sm' ? 'h-2.5' : 'h-3.5')}>
	<div
		class={cn(
			'bg-raised border-hairline absolute inset-x-0 overflow-hidden rounded-full border',
			height === 'sm' ? 'top-0.5 h-1.5' : 'top-1 h-1.5'
		)}
	>
		<div
			class={cn('h-full rounded-full transition-[width] duration-300', fillClass)}
			style="width: {fill}%"
		></div>
	</div>

	{#if showTicks && nutrient.rda !== undefined}
		<span
			class="bg-ink/45 absolute inset-y-0 w-px"
			style="left: {position(nutrient.rda)}%"
			title="Target {nutrient.rda} {nutrient.unit}"
		></span>
	{/if}

	{#if showTicks && nutrient.ul !== undefined}
		<span
			class="border-warn/70 absolute inset-y-0 border-l border-dashed"
			style="left: {position(nutrient.ul)}%"
			title="Upper limit {nutrient.ul} {nutrient.unit}"
		></span>
	{/if}
</div>
