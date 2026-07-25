<script lang="ts">
	import Meter from '$lib/components/charts/meter.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { store } from '$lib/data/store.svelte';
	import { formatTime } from '$lib/domain/date';
	import { inventoryFor } from '$lib/domain/inventory';
	import { costPerDay } from '$lib/domain/cost';
	import type { StackItem } from '$lib/domain/types';
	import { cn, money, plural, units } from '$lib/utils/format';
	import { stockTone, TONE_TEXT } from '$lib/utils/status';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

	let { item }: { item: StackItem } = $props();

	const product = $derived(store.productById.get(item.productId));
	const inventory = $derived(product ? inventoryFor(item, product) : null);
	const perDay = $derived(product ? costPerDay(item, product) : 0);
	const goals = $derived(item.goalIds.map((id) => store.goalById.get(id)).filter((g) => g));
	const issues = $derived(store.problems.filter((f) => f.stackItemIds.includes(item.id)));
</script>

{#if product}
	<article class={cn('card p-4 transition-colors', item.status === 'paused' && 'opacity-60')}>
		<div class="flex items-start justify-between gap-3">
			<div class="min-w-0">
				<a href="/stack/{item.id}" class="hover:text-accent block">
					<h3 class="truncate text-sm font-semibold">{product.name}</h3>
					<p class="text-ink-faint truncate text-xs">{product.brand}</p>
				</a>
			</div>
			<button
				type="button"
				onclick={() => store.toggleStatus(item.id)}
				aria-label={item.status === 'active' ? 'Pause' : 'Resume'}
				title={item.status === 'active' ? 'Pause this item' : 'Resume this item'}
				class="text-ink-faint hover:bg-raised hover:text-ink -mt-1 -mr-1 shrink-0 rounded-lg p-1.5 transition-colors"
			>
				{#if item.status === 'active'}<Pause size={14} />{:else}<Play size={14} />{/if}
			</button>
		</div>

		<div class="mt-3 flex flex-wrap gap-1">
			{#if item.status === 'paused'}
				<Badge tone="inert">Paused</Badge>
			{:else}
				{#each item.doses as dose (dose.slotId)}
					{@const slot = store.slotById.get(dose.slotId)}
					<Badge tone="accent" title={units(dose.servings * product.unitsPerServing, product.form)}>
						{slot?.label ?? dose.slotId}
						<span class="tnum opacity-70">{slot ? formatTime(slot.time) : ''}</span>
					</Badge>
				{/each}
				{#if item.doses.length === 0}
					<Badge tone="caution">Not scheduled</Badge>
				{/if}
			{/if}
			{#each goals as goal (goal!.id)}
				<span
					class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.6875rem] font-medium"
					style="background: {goal!.color}1a; color: {goal!.color}"
				>
					{goal!.name}
				</span>
			{/each}
		</div>

		{#if inventory && item.status === 'active'}
			<div class="mt-3.5">
				<div class="mb-1 flex items-baseline justify-between text-[0.6875rem]">
					<span class="text-ink-faint tnum">
						{units(item.unitsOnHand, product.form)} left
					</span>
					<span class={cn('tnum font-medium', TONE_TEXT[stockTone(inventory.level)])}>
						{#if inventory.daysRemaining === null}
							—
						{:else if inventory.daysRemaining === 0}
							Out
						{:else}
							{plural(inventory.daysRemaining, 'day')}
						{/if}
					</span>
				</div>
				<Meter
					value={inventory.fill}
					tone={stockTone(inventory.level)}
					height="sm"
					label="{product.name} stock"
				/>
			</div>
		{/if}

		<div class="border-hairline mt-3.5 flex items-center justify-between border-t pt-2.5 text-xs">
			<span class="tnum text-ink-faint">{money(perDay, store.settings.currency)}/day</span>
			{#if issues.length > 0}
				<a href="/interactions" class="text-warn flex items-center gap-1 hover:underline">
					<TriangleAlert size={11} />
					{plural(issues.length, 'issue')}
				</a>
			{:else}
				<a href="/stack/{item.id}" class="text-accent hover:underline">Details</a>
			{/if}
		</div>
	</article>
{/if}
