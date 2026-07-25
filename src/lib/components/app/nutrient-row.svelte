<script lang="ts">
	import NutrientBar from '$lib/components/charts/nutrient-bar.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { store } from '$lib/data/store.svelte';
	import type { NutrientTotal } from '$lib/domain/totals';
	import { STATUS_LABEL } from '$lib/domain/totals';
	import { amount, cn, percent } from '$lib/utils/format';
	import { nutrientTone } from '$lib/utils/status';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let {
		total,
		expandable = true,
		open = $bindable(false)
	}: { total: NutrientTotal; expandable?: boolean; open?: boolean } = $props();

	const tone = $derived(nutrientTone(total.status));
	/**
	 * A percentage needs the denominator the reader cares about. Once a nutrient is at
	 * or over its ceiling, "500% of target" is the wrong headline — the ceiling is.
	 */
	const nearCeiling = $derived(total.status === 'high' || total.status === 'over');
	const headline = $derived(
		nearCeiling && total.percentUl !== null
			? `${percent(total.percentUl)} of ceiling`
			: total.percentRda !== null
				? `${percent(total.percentRda)} of target`
				: total.percentUl !== null
					? `${percent(total.percentUl)} of ceiling`
					: 'no reference value'
	);
</script>

<div class="py-3">
	<div class="flex items-baseline justify-between gap-3">
		<button
			type="button"
			disabled={!expandable}
			onclick={() => (open = !open)}
			class={cn(
				'flex min-w-0 items-center gap-1 text-left text-sm font-medium',
				expandable && 'hover:text-accent'
			)}
		>
			{#if expandable}
				<ChevronRight
					size={13}
					class={cn('text-ink-faint shrink-0 transition-transform', open && 'rotate-90')}
				/>
			{/if}
			<span class="truncate">{total.nutrient.name}</span>
		</button>

		<div class="flex shrink-0 items-baseline gap-2">
			<span class="tnum text-sm">{amount(total.amount, total.nutrient.unit)}</span>
			<Badge {tone} title={STATUS_LABEL[total.status]}>{headline}</Badge>
		</div>
	</div>

	<div class="mt-2">
		<NutrientBar nutrient={total.nutrient} amount={total.amount} status={total.status} />
	</div>

	{#if open}
		<div class="border-hairline mt-3 space-y-2 border-l pl-3">
			{#if total.nutrient.blurb}
				<p class="text-ink-soft text-xs">{total.nutrient.blurb}</p>
			{/if}
			<div>
				<p class="eyebrow mb-1">Coming from</p>
				<ul class="space-y-1">
					{#each total.contributions as contribution (contribution.stackItemId)}
						<li class="flex items-baseline justify-between gap-3 text-xs">
							<a
								href="/stack/{contribution.stackItemId}"
								class="text-ink-soft hover:text-accent truncate"
							>
								{store.nameOf(contribution.stackItemId)}
							</a>
							<span class="tnum text-ink-faint shrink-0">
								{amount(contribution.amount, total.nutrient.unit)}
							</span>
						</li>
					{/each}
				</ul>
			</div>
			<p class="text-ink-faint text-[0.6875rem]">
				Target {total.nutrient.rda !== undefined
					? amount(total.nutrient.rda, total.nutrient.unit)
					: 'not established'} · Ceiling {total.nutrient.ul !== undefined
					? amount(total.nutrient.ul, total.nutrient.unit)
					: 'not established'}
			</p>
		</div>
	{/if}
</div>
