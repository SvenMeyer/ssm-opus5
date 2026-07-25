<script lang="ts">
	import PageHeader from '$lib/components/app/page-header.svelte';
	import Heatmap from '$lib/components/charts/heatmap.svelte';
	import Meter from '$lib/components/charts/meter.svelte';
	import TrendChart from '$lib/components/charts/trend-chart.svelte';
	import type { TrendSeries } from '$lib/components/charts/trend-types';
	import Segmented from '$lib/components/ui/segmented.svelte';
	import { store } from '$lib/data/store.svelte';
	import { adherenceStats } from '$lib/domain/adherence';
	import { rangeEndingAt, today } from '$lib/domain/date';
	import type { JournalEntry } from '$lib/domain/types';
	import { money, percent, plural } from '$lib/utils/format';
	import { ratioTone } from '$lib/utils/status';

	let window = $state<'30' | '90'>('90');
	const days = $derived(Number(window));
	const SMOOTHING_DAYS = 7;

	const dates = $derived(rangeEndingAt(today(), days));
	const stats = $derived(adherenceStats(store.data, days));
	const series = $derived(stats.series);

	const journalByDate = $derived.by(() => {
		const byDate: Record<string, JournalEntry> = {};
		for (const entry of store.journal) byDate[entry.date] = entry;
		return byDate;
	});

	/**
	 * Raw 1–5 daily scores plotted straight are visual noise: three lines jumping a whole
	 * point a day, with holes wherever nothing was logged. A trailing seven-day mean is
	 * what the eye is actually looking for, and it bridges the odd missed day without
	 * inventing data — a gap only appears when a whole week went unlogged.
	 */
	function rolling(pick: (entry: JournalEntry) => number): (number | null)[] {
		return dates.map((_, i) => {
			const from = Math.max(0, i - SMOOTHING_DAYS + 1);
			const values = dates
				.slice(from, i + 1)
				.map((d) => journalByDate[d])
				.filter((e): e is JournalEntry => e !== undefined)
				.map(pick);
			return values.length === 0 ? null : values.reduce((sum, v) => sum + v, 0) / values.length;
		});
	}

	const trends = $derived<TrendSeries[]>([
		{ id: 'energy', label: 'Energy', color: '#C97C2A', points: rolling((e) => e.energy) },
		{ id: 'sleep', label: 'Sleep', color: '#6C63C4', points: rolling((e) => e.sleep) },
		{ id: 'mood', label: 'Mood', color: '#2E8B7A', points: rolling((e) => e.mood) }
	]);

	/** Stack changes drawn onto the trend chart, so a change in scores has a suspect. */
	const markers = $derived(
		store.stack
			.filter((i) => dates.includes(i.startedOn))
			.map((i) => ({ date: i.startedOn, label: `Started ${store.nameOf(i.id)}` }))
	);

	const worst = $derived(store.adherenceByItem.slice(0, 6));
	const topCosts = $derived(store.cost.items.slice(0, 8));
</script>

<PageHeader title="Insights" subtitle="Adherence, spend and how you have actually felt.">
	<Segmented
		label="Time window"
		bind:value={window}
		options={[
			{ value: '30', label: '30 days' },
			{ value: '90', label: '90 days' }
		]}
	/>
</PageHeader>

<div class="mb-6 grid gap-3 sm:grid-cols-4">
	<div class="card p-4">
		<p class="eyebrow">Adherence</p>
		<p class="tnum display mt-1 text-2xl">{percent(stats.average * 100)}</p>
		<p class="text-ink-faint mt-0.5 text-xs">
			{stats.takenTotal} of {stats.expectedTotal} doses
		</p>
	</div>
	<div class="card p-4">
		<p class="eyebrow">Current streak</p>
		<p class="tnum display mt-1 text-2xl">{stats.currentStreak}</p>
		<p class="text-ink-faint mt-0.5 text-xs">Best run {stats.longestStreak} days</p>
	</div>
	<div class="card p-4">
		<p class="eyebrow">Monthly spend</p>
		<p class="tnum display mt-1 text-2xl">
			{money(store.cost.perMonth, store.cost.currency, 0)}
		</p>
		<p class="text-ink-faint mt-0.5 text-xs">
			{money(store.cost.perYear, store.cost.currency, 0)} a year
		</p>
	</div>
	<div class="card p-4">
		<p class="eyebrow">Active items</p>
		<p class="tnum display mt-1 text-2xl">{store.activeStack.length}</p>
		<p class="text-ink-faint mt-0.5 text-xs">
			{plural(store.pausedStack.length, 'paused item')}
		</p>
	</div>
</div>

<div class="space-y-8">
	<section class="card p-5">
		<h2 class="mb-1 text-sm font-semibold">Every day, ticked or not</h2>
		<p class="text-ink-faint mb-4 text-xs">
			Darker is a fuller day. Past days are scored against your current schedule — this prototype
			does not keep a history of schedule changes, so a day before you added something can look
			worse than it was.
		</p>
		<Heatmap {series} />
	</section>

	<section class="card p-5">
		<div class="mb-1 flex flex-wrap items-baseline justify-between gap-2">
			<h2 class="text-sm font-semibold">How you have felt</h2>
			<div class="flex gap-3 text-xs">
				{#each trends as line (line.id)}
					<span class="flex items-center gap-1.5">
						<span class="h-0.5 w-3 rounded-full" style="background: {line.color}"></span>
						<span class="text-ink-soft">{line.label}</span>
					</span>
				{/each}
			</div>
		</div>
		<p class="text-ink-faint mb-3 text-xs">
			Seven-day rolling average of your 1–5 ratings. Dotted verticals mark the day you started
			something; a gap means a whole week went unlogged.
		</p>
		<TrendChart {dates} series={trends} {markers} />
	</section>

	<div class="grid gap-8 lg:grid-cols-2">
		<section>
			<h2 class="mb-1 text-sm font-semibold">The ones you forget</h2>
			<p class="text-ink-faint mb-3 text-xs">Adherence per item over the last 30 days.</p>
			<div class="card divide-hairline divide-y px-4 py-1">
				{#each worst as item (item.stackItemId)}
					<div class="py-3">
						<div class="mb-1.5 flex items-baseline justify-between gap-3">
							<a href="/stack/{item.stackItemId}" class="hover:text-accent truncate text-sm">
								{store.nameOf(item.stackItemId)}
							</a>
							<span class="tnum text-ink-faint shrink-0 text-xs">
								{percent(item.ratio * 100)}
							</span>
						</div>
						<Meter
							value={item.ratio}
							tone={ratioTone(item.ratio)}
							height="sm"
							label="{store.nameOf(item.stackItemId)} adherence"
						/>
					</div>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="mb-1 text-sm font-semibold">Where the money goes</h2>
			<p class="text-ink-faint mb-3 text-xs">
				{money(store.cost.perDay, store.cost.currency)} a day across
				{plural(store.cost.items.length, 'item')}.
			</p>
			<div class="card divide-hairline divide-y px-4 py-1">
				{#each topCosts as item (item.stackItemId)}
					<div class="py-3">
						<div class="mb-1.5 flex items-baseline justify-between gap-3">
							<a href="/stack/{item.stackItemId}" class="hover:text-accent truncate text-sm">
								{store.nameOf(item.stackItemId)}
							</a>
							<span class="tnum shrink-0 text-xs">
								{money(item.perMonth, store.cost.currency, 0)}<span class="text-ink-faint">/mo</span
								>
							</span>
						</div>
						<Meter
							value={item.share}
							tone="accent"
							height="sm"
							label="{store.nameOf(item.stackItemId)} share of spend"
						/>
					</div>
				{/each}
			</div>
		</section>
	</div>
</div>
