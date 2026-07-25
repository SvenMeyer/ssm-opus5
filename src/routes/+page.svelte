<script lang="ts">
	import PageHeader from '$lib/components/app/page-header.svelte';
	import SlotCard from '$lib/components/app/slot-card.svelte';
	import NutrientBar from '$lib/components/charts/nutrient-bar.svelte';
	import Ring from '$lib/components/charts/ring.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import EmptyState from '$lib/components/ui/empty-state.svelte';
	import { store } from '$lib/data/store.svelte';
	import { formatDate, today } from '$lib/domain/date';
	import { amount, percent, plural } from '$lib/utils/format';
	import { ratioTone } from '$lib/utils/status';
	import Flame from '@lucide/svelte/icons/flame';
	import PackagePlus from '@lucide/svelte/icons/package-plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

	const progress = $derived(store.todayProgress);
	const remaining = $derived(progress.total - progress.done);
	const entry = $derived(store.journalFor(today()));

	/** Anything at or over a ceiling, plus the biggest shortfalls — the rest is noise here. */
	const spotlight = $derived([
		...store.totals.filter((t) => t.status === 'over' || t.status === 'high'),
		...store.totals.filter((t) => t.status === 'low').slice(0, 3)
	]);
</script>

<PageHeader title="Today" subtitle={formatDate(today())}>
	{#snippet actions()}
		<Button href="/journal" size="sm">
			<Pencil size={14} />
			{entry ? 'Edit today’s note' : 'Log how you feel'}
		</Button>
	{/snippet}
</PageHeader>

{#if store.todaySchedule.length === 0}
	<EmptyState
		icon={PackagePlus}
		title="Nothing scheduled"
		body="Your stack is empty or everything in it is paused. Pick something from the catalog to get started."
	>
		{#snippet action()}
			<Button href="/catalog" variant="primary">Browse the catalog</Button>
		{/snippet}
	</EmptyState>
{:else}
	<!-- Status band: what is left today, how the streak is doing, what is wrong. -->
	<div class="card mb-8 flex flex-wrap items-center gap-6 p-5">
		<Ring value={progress.ratio} tone={ratioTone(progress.ratio)}>
			<div>
				<p class="tnum display text-xl leading-none">{progress.done}</p>
				<p class="text-ink-faint text-[0.625rem]">of {progress.total}</p>
			</div>
		</Ring>

		<div class="min-w-40 flex-1">
			<p class="display text-lg leading-tight">
				{#if remaining === 0}
					All done for today.
				{:else}
					{plural(remaining, 'dose')} left.
				{/if}
			</p>
			<p class="text-ink-soft mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
				<span class="flex items-center gap-1.5">
					<Flame size={14} class="text-caution" />
					<span class="tnum">{plural(store.adherence.currentStreak, 'day')}</span> streak
				</span>
				<span class="text-hairline">·</span>
				<span><span class="tnum">{percent(store.adherence.average * 100)}</span> over 90 days</span>
			</p>
		</div>

		{#if store.problems.length > 0}
			<a
				href="/interactions"
				class="border-warn/30 bg-warn-soft text-warn hover:bg-warn flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-colors hover:text-white"
			>
				<TriangleAlert size={16} />
				<span>
					<span class="block font-medium">{plural(store.problems.length, 'issue')} to review</span>
					<span class="text-[0.6875rem] opacity-80">Ceilings and timing conflicts</span>
				</span>
			</a>
		{/if}
	</div>

	<div class="grid gap-8 lg:grid-cols-[1fr_18rem]">
		<div>
			{#each store.todaySchedule as group (group.slot.id)}
				<SlotCard {group} findings={store.problems} />
			{/each}
		</div>

		<aside class="space-y-6">
			<section>
				<div class="mb-2 flex items-baseline justify-between">
					<p class="eyebrow">Worth watching</p>
					<a href="/nutrients" class="text-accent text-xs hover:underline">All nutrients</a>
				</div>

				{#if spotlight.length === 0}
					<p class="text-ink-faint text-sm">
						Nothing over a ceiling and nothing badly short. Quiet is good.
					</p>
				{:else}
					<div class="card divide-hairline divide-y px-3.5 py-1">
						{#each spotlight as total (total.nutrient.id)}
							<div class="py-2.5">
								<div class="mb-1.5 flex items-baseline justify-between gap-2">
									<span class="truncate text-xs font-medium">{total.nutrient.name}</span>
									<span class="tnum text-ink-faint shrink-0 text-[0.6875rem]">
										{amount(total.amount, total.nutrient.unit)}
									</span>
								</div>
								<NutrientBar
									nutrient={total.nutrient}
									amount={total.amount}
									status={total.status}
									height="sm"
								/>
							</div>
						{/each}
					</div>
				{/if}
			</section>

			{#if store.reorder.length > 0}
				<section>
					<div class="mb-2 flex items-baseline justify-between">
						<p class="eyebrow">Running low</p>
						<a href="/stack" class="text-accent text-xs hover:underline">Manage</a>
					</div>
					<ul class="card divide-hairline divide-y px-3.5 py-1">
						{#each store.reorder.slice(0, 4) as item (item.stackItemId)}
							<li class="flex items-baseline justify-between gap-2 py-2 text-xs">
								<a href="/stack/{item.stackItemId}" class="hover:text-accent truncate">
									{store.nameOf(item.stackItemId)}
								</a>
								<span class="tnum text-caution shrink-0">{item.daysRemaining}d</span>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		</aside>
	</div>
{/if}
