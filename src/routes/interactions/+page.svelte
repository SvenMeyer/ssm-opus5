<script lang="ts">
	import FindingCard from '$lib/components/app/finding-card.svelte';
	import PageHeader from '$lib/components/app/page-header.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import EmptyState from '$lib/components/ui/empty-state.svelte';
	import Segmented from '$lib/components/ui/segmented.svelte';
	import { store } from '$lib/data/store.svelte';
	import { plural } from '$lib/utils/format';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';

	type Tab = 'problems' | 'suggestions' | 'wins';
	let tab = $state<Tab>('problems');

	const shown = $derived(
		tab === 'problems' ? store.problems : tab === 'suggestions' ? store.suggestions : store.wins
	);

	const EMPTY: Record<Tab, { title: string; body: string }> = {
		problems: {
			title: 'Nothing is fighting',
			body: 'No ceiling breaches, no absorption conflicts and nothing scheduled at the wrong time of day.'
		},
		suggestions: {
			title: 'No pairings left on the table',
			body: 'Everything that works better together is already scheduled together.'
		},
		wins: {
			title: 'No synergies yet',
			body: 'Once your stack contains a pair that works together, the ones you have scheduled well show up here.'
		}
	};
</script>

<PageHeader
	title="Interactions"
	subtitle="Evaluated against your schedule, not just your ingredient list — same stack, different times, different answer."
>
	<Segmented
		label="Finding type"
		bind:value={tab}
		options={[
			{ value: 'problems', label: 'Problems', count: store.problems.length },
			{ value: 'suggestions', label: 'Suggestions', count: store.suggestions.length },
			{ value: 'wins', label: 'Working well', count: store.wins.length }
		]}
	/>
</PageHeader>

{#if shown.length === 0}
	<EmptyState icon={ShieldCheck} title={EMPTY[tab].title} body={EMPTY[tab].body}>
		{#snippet action()}
			<Button href="/stack">Review your stack</Button>
		{/snippet}
	</EmptyState>
{:else}
	{#if tab === 'problems'}
		<p class="text-ink-soft mb-4 text-sm">
			{store.problems.filter((f) => f.severity === 'warning').length} need attention,
			{store.problems.filter((f) => f.severity === 'caution').length} worth a look,
			{store.problems.filter((f) => f.severity === 'info').length} minor.
		</p>
	{/if}

	<div class="space-y-3">
		{#each shown as finding (finding.id)}
			<FindingCard {finding} />
		{/each}
	</div>
{/if}

<p class="text-ink-faint mt-6 text-xs">
	Prototype rulebook: {plural(store.rules.length, 'rule')} covering mineral competition, fat-soluble absorption,
	stimulant timing and known synergies. Plausible, widely-repeated guidance — not clinical advice, and
	no substitute for asking a pharmacist about your medication.
</p>
