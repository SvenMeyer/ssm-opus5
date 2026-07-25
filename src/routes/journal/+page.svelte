<script lang="ts">
	import PageHeader from '$lib/components/app/page-header.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { store } from '$lib/data/store.svelte';
	import { formatDate, relativeDay, today } from '$lib/domain/date';
	import type { JournalEntry } from '$lib/domain/types';
	import { cn, plural } from '$lib/utils/format';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	const SCALES = [
		{ key: 'energy', label: 'Energy', color: '#C97C2A' },
		{ key: 'sleep', label: 'Sleep', color: '#6C63C4' },
		{ key: 'mood', label: 'Mood', color: '#2E8B7A' }
	] as const;

	let date = $state(today());
	const existing = $derived(store.journalFor(date));

	// The form mirrors whichever day is selected; picking a new date reloads it.
	let draft = $state<JournalEntry>({ date: today(), energy: 3, sleep: 3, mood: 3, note: '' });
	$effect(() => {
		const found = store.journalFor(date);
		draft = found
			? { ...found, note: found.note ?? '' }
			: { date, energy: 3, sleep: 3, mood: 3, note: '' };
	});

	const history = $derived([...store.journal].sort((a, b) => b.date.localeCompare(a.date)));

	/** Stack changes shown alongside entries, so a shift in scores has context. */
	const startsByDate = $derived.by(() => {
		const byDate: Record<string, string[]> = {};
		for (const item of store.stack) {
			(byDate[item.startedOn] ??= []).push(store.nameOf(item.id));
		}
		return byDate;
	});

	function save() {
		store.saveJournalEntry({ ...draft, date, note: draft.note?.trim() || undefined });
	}
</script>

<PageHeader
	title="Journal"
	subtitle="{plural(
		store.journal.length,
		'entry'
	)} · the only honest way to tell whether any of this is working"
/>

<div class="grid gap-8 lg:grid-cols-[22rem_1fr]">
	<section class="card h-fit p-5">
		<div class="mb-4 flex items-center justify-between gap-3">
			<h2 class="text-sm font-semibold">
				{date === today() ? 'Today' : formatDate(date)}
			</h2>
			<input
				type="date"
				bind:value={date}
				max={today()}
				aria-label="Entry date"
				class="border-hairline bg-surface text-ink-soft focus:border-accent rounded-lg border px-2 py-1 text-xs focus:outline-none"
			/>
		</div>

		<div class="space-y-4">
			{#each SCALES as scale (scale.key)}
				<div>
					<div class="mb-1.5 flex items-baseline justify-between">
						<span class="text-sm">{scale.label}</span>
						<span class="tnum text-ink-faint text-xs">{draft[scale.key]}/5</span>
					</div>
					<div class="flex gap-1.5" role="radiogroup" aria-label={scale.label}>
						{#each [1, 2, 3, 4, 5] as value (value)}
							<button
								type="button"
								role="radio"
								aria-checked={draft[scale.key] === value}
								aria-label="{scale.label} {value}"
								onclick={() => (draft = { ...draft, [scale.key]: value })}
								class={cn(
									'h-8 flex-1 rounded-md border text-xs font-medium transition-all',
									draft[scale.key] >= value
										? 'border-transparent text-white'
										: 'border-hairline text-ink-faint hover:bg-raised'
								)}
								style={draft[scale.key] >= value
									? `background: ${scale.color}; opacity: ${0.45 + value * 0.11}`
									: ''}
							>
								{value}
							</button>
						{/each}
					</div>
				</div>
			{/each}

			<div>
				<span class="mb-1.5 block text-sm">Note</span>
				<textarea
					bind:value={draft.note}
					rows="3"
					placeholder="Slept through for once. Knees quieter on the stairs."
					class="border-hairline bg-surface placeholder:text-ink-faint focus:border-accent w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
				></textarea>
			</div>

			<div class="flex items-center gap-2">
				<Button variant="primary" onclick={save} class="flex-1 justify-center">
					{existing ? 'Update entry' : 'Save entry'}
				</Button>
				{#if existing}
					<Button
						variant="ghost"
						onclick={() => store.deleteJournalEntry(date)}
						aria-label="Delete entry"
					>
						<Trash2 size={15} />
					</Button>
				{/if}
			</div>
		</div>
	</section>

	<section>
		<h2 class="eyebrow mb-3">History</h2>
		<ol class="space-y-2">
			{#each history.slice(0, 40) as entry (entry.date)}
				{@const started = startsByDate[entry.date]}
				<li class="card p-4">
					<div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
						<button
							type="button"
							onclick={() => (date = entry.date)}
							class="hover:text-accent text-sm font-medium"
						>
							{formatDate(entry.date)}
						</button>
						<span class="text-ink-faint text-xs">{relativeDay(entry.date)}</span>
					</div>

					<div class="mt-2.5 flex flex-wrap gap-4">
						{#each SCALES as scale (scale.key)}
							<div class="flex items-center gap-1.5">
								<span class="text-ink-faint text-[0.6875rem]">{scale.label}</span>
								<span class="flex gap-0.5" aria-label="{scale.label} {entry[scale.key]} of 5">
									{#each [1, 2, 3, 4, 5] as value (value)}
										<span
											class="h-1.5 w-3 rounded-full"
											style={entry[scale.key] >= value
												? `background: ${scale.color}`
												: 'background: var(--color-hairline)'}
										></span>
									{/each}
								</span>
							</div>
						{/each}
					</div>

					{#if entry.note}
						<p class="text-ink-soft mt-2.5 text-sm">{entry.note}</p>
					{/if}

					{#if started}
						<p class="text-accent mt-2 text-xs">Started {started.join(', ')} on this day</p>
					{/if}
				</li>
			{/each}
		</ol>
	</section>
</div>
