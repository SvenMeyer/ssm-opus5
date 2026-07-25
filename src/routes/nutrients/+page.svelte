<script lang="ts">
	import NutrientRow from '$lib/components/app/nutrient-row.svelte';
	import PageHeader from '$lib/components/app/page-header.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import EmptyState from '$lib/components/ui/empty-state.svelte';
	import Segmented from '$lib/components/ui/segmented.svelte';
	import { store } from '$lib/data/store.svelte';
	import { NUTRIENTS, NUTRIENT_CATEGORY_LABEL } from '$lib/domain/nutrients';
	import { dailyTotals, groupByCategory, summarise, type NutrientTotal } from '$lib/domain/totals';
	import { plural } from '$lib/utils/format';
	import Activity from '@lucide/svelte/icons/activity';

	type Scope = 'all' | 'today';
	type Sort = 'risk' | 'category';

	let scope = $state<Scope>('all');
	let sort = $state<Sort>('risk');
	let openRows = $state<Record<string, boolean>>({});

	/** "Today" means the slots that still exist on today's schedule, not the calendar. */
	const delivered = $derived(
		scope === 'today'
			? dailyTotals(store.data, { slotIds: store.todaySchedule.map((g) => g.slot.id) })
			: store.totals
	);

	/**
	 * With the Settings toggle on, nutrients the stack delivers none of are appended as
	 * zero rows — the page becomes a checklist of what you are missing rather than a
	 * summary of what you take.
	 */
	const totals = $derived.by<NutrientTotal[]>(() => {
		if (!store.settings.showEmptyNutrients) return delivered;
		const present = new Set(delivered.map((t) => t.nutrient.id));
		const absent: NutrientTotal[] = NUTRIENTS.filter((n) => !present.has(n.id)).map((nutrient) => ({
			nutrient,
			amount: 0,
			contributions: [],
			percentRda: nutrient.rda ? 0 : null,
			percentUl: nutrient.ul ? 0 : null,
			status: 'none'
		}));
		return [...delivered, ...absent];
	});

	const summary = $derived(summarise(delivered));
	const grouped = $derived(groupByCategory(totals));
</script>

<PageHeader
	title="Nutrients"
	subtitle="What the whole stack adds up to in a day, against targets and ceilings."
>
	<div class="flex flex-wrap items-center gap-3">
		<Segmented
			label="Scope"
			bind:value={scope}
			options={[
				{ value: 'all', label: 'Whole stack' },
				{ value: 'today', label: 'Scheduled today' }
			]}
		/>
		<Segmented
			label="Sort"
			bind:value={sort}
			options={[
				{ value: 'risk', label: 'By risk' },
				{ value: 'category', label: 'By category' }
			]}
		/>
	</div>
</PageHeader>

{#if totals.length === 0}
	<EmptyState
		icon={Activity}
		title="Nothing to total up"
		body="Once your stack has something active in it, every nutrient it delivers appears here."
	>
		{#snippet action()}
			<Button href="/catalog" variant="primary">Browse the catalog</Button>
		{/snippet}
	</EmptyState>
{:else}
	<!-- Three numbers that answer "is anything wrong?" before any scrolling happens. -->
	<div class="mb-6 grid gap-3 sm:grid-cols-3">
		<div class="card p-4">
			<p class="eyebrow">Over the ceiling</p>
			<p class="tnum display mt-1 text-2xl {summary.over.length > 0 ? 'text-warn' : ''}">
				{summary.over.length}
			</p>
			<p class="text-ink-faint mt-0.5 text-xs">
				{summary.over.length > 0
					? summary.over.map((t) => t.nutrient.name).join(', ')
					: 'Nothing above a tolerable upper limit'}
			</p>
		</div>
		<div class="card p-4">
			<p class="eyebrow">Near the ceiling</p>
			<p class="tnum display mt-1 text-2xl {summary.high.length > 0 ? 'text-caution' : ''}">
				{summary.high.length}
			</p>
			<p class="text-ink-faint mt-0.5 text-xs">
				{summary.high.length > 0
					? summary.high.map((t) => t.nutrient.name).join(', ')
					: 'Nothing within 20% of a ceiling'}
			</p>
		</div>
		<div class="card p-4">
			<p class="eyebrow">Targets met</p>
			<p class="tnum display mt-1 text-2xl">
				{summary.met}<span class="text-ink-faint text-base">/{summary.tracked}</span>
			</p>
			<p class="text-ink-faint mt-0.5 text-xs">
				Of the {plural(summary.tracked, 'nutrient')} here with a reference value
			</p>
		</div>
	</div>

	{#if sort === 'risk'}
		<div class="card divide-hairline divide-y px-4 py-1">
			{#each totals as total (total.nutrient.id)}
				<NutrientRow
					{total}
					bind:open={
						() => openRows[total.nutrient.id] ?? false,
						(v) => (openRows = { ...openRows, [total.nutrient.id]: v })
					}
				/>
			{/each}
		</div>
	{:else}
		<div class="space-y-6">
			{#each grouped as group (group.category)}
				<section>
					<h2 class="eyebrow mb-2">{NUTRIENT_CATEGORY_LABEL[group.category]}</h2>
					<div class="card divide-hairline divide-y px-4 py-1">
						{#each group.totals as total (total.nutrient.id)}
							<NutrientRow
								{total}
								bind:open={
									() => openRows[total.nutrient.id] ?? false,
									(v) => (openRows = { ...openRows, [total.nutrient.id]: v })
								}
							/>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	{/if}

	<p class="text-ink-faint mt-6 text-xs">
		A solid tick marks the daily target; a dashed tick marks the tolerable upper limit. The two
		marks are pinned to the same positions on every bar so a row can be read at a glance, which
		means the scale is not linear — past the dashed tick it compresses, because "well over" is the
		only distinction that matters there. No dashed tick means no ceiling has been established, which
		is not the same as being unlimited. Reference values are approximate adult figures for a
		prototype.
	</p>
{/if}
