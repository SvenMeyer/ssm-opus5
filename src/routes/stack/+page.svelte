<script lang="ts">
	import PageHeader from '$lib/components/app/page-header.svelte';
	import StackCard from '$lib/components/app/stack-card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import EmptyState from '$lib/components/ui/empty-state.svelte';
	import Segmented from '$lib/components/ui/segmented.svelte';
	import { store } from '$lib/data/store.svelte';
	import { formatDate, formatTime } from '$lib/domain/date';
	import type { StackItem } from '$lib/domain/types';
	import { money, plural } from '$lib/utils/format';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import Plus from '@lucide/svelte/icons/plus';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';

	type Grouping = 'slot' | 'goal' | 'none';
	let grouping = $state<Grouping>('slot');
	let showPaused = $state(true);

	interface Group {
		key: string;
		label: string;
		hint?: string;
		items: StackItem[];
	}

	const active = $derived(store.activeStack);

	const groups = $derived.by<Group[]>(() => {
		if (grouping === 'none') {
			return [{ key: 'all', label: 'Active', items: active }];
		}

		if (grouping === 'goal') {
			const out: Group[] = store.goals
				.map((goal) => ({
					key: goal.id,
					label: goal.name,
					items: active.filter((i) => i.goalIds.includes(goal.id))
				}))
				.filter((g) => g.items.length > 0);
			const unassigned = active.filter((i) => i.goalIds.length === 0);
			if (unassigned.length > 0) {
				out.push({ key: 'none', label: 'No goal assigned', items: unassigned });
			}
			return out;
		}

		const out: Group[] = store.slots
			.map((slot) => ({
				key: slot.id,
				label: slot.label,
				hint: formatTime(slot.time),
				items: active.filter((i) => i.doses.some((d) => d.slotId === slot.id))
			}))
			.filter((g) => g.items.length > 0);
		const unscheduled = active.filter((i) => i.doses.length === 0);
		if (unscheduled.length > 0) {
			out.push({ key: 'unscheduled', label: 'Not scheduled', items: unscheduled });
		}
		return out;
	});

	const pillBurden = $derived(
		store.todaySchedule.reduce((sum, g) => sum + g.doses.reduce((s, d) => s + d.units, 0), 0)
	);
</script>

<PageHeader
	title="My stack"
	subtitle="{plural(active.length, 'active item')} · {pillBurden.toFixed(0)} units a day · {money(
		store.cost.perMonth,
		store.cost.currency,
		0
	)} a month"
>
	{#snippet actions()}
		<Button href="/catalog" variant="primary" size="sm">
			<Plus size={14} />
			Add supplement
		</Button>
	{/snippet}

	<div class="flex flex-wrap items-center gap-3">
		<Segmented
			label="Group stack by"
			bind:value={grouping}
			options={[
				{ value: 'slot', label: 'By time' },
				{ value: 'goal', label: 'By goal' },
				{ value: 'none', label: 'Flat' }
			]}
		/>
		{#if store.pausedStack.length > 0}
			<label class="text-ink-soft flex items-center gap-2 text-xs">
				<input type="checkbox" bind:checked={showPaused} class="accent-accent" />
				Show {store.pausedStack.length} paused
			</label>
		{/if}
	</div>
</PageHeader>

{#if store.reorder.length > 0}
	<!-- Shopping list first: this is the one thing on the page with a deadline. -->
	<section class="border-caution/30 bg-caution-soft/50 mb-8 rounded-xl border p-4">
		<div class="mb-3 flex items-center gap-2">
			<ShoppingCart size={15} class="text-caution" />
			<h2 class="text-sm font-semibold">Reorder soon</h2>
		</div>
		<ul class="grid gap-2 sm:grid-cols-2">
			{#each store.reorder as status (status.stackItemId)}
				{@const product = store.productById.get(status.productId)}
				<!-- min-w-0 disables the grid item's automatic minimum size; without it the
				     nowrap product name pushes the row past the viewport on a phone. -->
				<li
					class="bg-surface border-hairline flex min-w-0 items-center justify-between gap-3 rounded-lg border px-3 py-2"
				>
					<div class="min-w-0 flex-1">
						<a href="/stack/{status.stackItemId}" class="hover:text-accent block truncate text-sm">
							{product?.name}
						</a>
						<span class="text-ink-faint block truncate text-xs">
							runs out {status.runoutDate ? formatDate(status.runoutDate) : '—'}
						</span>
					</div>
					<div class="flex shrink-0 items-center gap-2">
						<span class="tnum text-caution text-sm font-medium">{status.daysRemaining}d</span>
						<Button size="sm" onclick={() => store.restock(status.stackItemId)}>Restock</Button>
					</div>
				</li>
			{/each}
		</ul>
	</section>
{/if}

{#if active.length === 0}
	<EmptyState
		icon={LayoutGrid}
		title="Your stack is empty"
		body="Add something from the catalog and it will show up here with its schedule, stock level and cost."
	>
		{#snippet action()}
			<Button href="/catalog" variant="primary">Browse the catalog</Button>
		{/snippet}
	</EmptyState>
{:else}
	<div class="space-y-8">
		{#each groups as group (group.key)}
			<section>
				<div class="mb-3 flex items-baseline gap-2">
					<h2 class="text-sm font-semibold">{group.label}</h2>
					{#if group.hint}
						<span class="tnum text-ink-faint text-xs">{group.hint}</span>
					{/if}
					<span class="text-ink-faint ml-auto text-xs">{group.items.length}</span>
				</div>
				<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{#each group.items as item (item.id)}
						<StackCard {item} />
					{/each}
				</div>
			</section>
		{/each}

		{#if showPaused && store.pausedStack.length > 0}
			<section>
				<h2 class="mb-3 text-sm font-semibold">Paused</h2>
				<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{#each store.pausedStack as item (item.id)}
						<StackCard {item} />
					{/each}
				</div>
			</section>
		{/if}
	</div>
{/if}
