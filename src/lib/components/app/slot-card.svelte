<script lang="ts">
	import DoseRow from '$lib/components/app/dose-row.svelte';
	import { store } from '$lib/data/store.svelte';
	import { formatTime } from '$lib/domain/date';
	import type { Finding } from '$lib/domain/interactions';
	import type { SlotGroup } from '$lib/domain/schedule';
	import { cn } from '$lib/utils/format';
	import Check from '@lucide/svelte/icons/check';

	let { group, findings }: { group: SlotGroup; findings: Finding[] } = $props();

	const done = $derived(
		group.doses.filter((d) => store.takenToday.has(`${d.stackItemId}:${d.slotId}`)).length
	);
	const complete = $derived(done === group.doses.length);

	function findingsFor(stackItemId: string): Finding[] {
		return findings.filter(
			(f) =>
				!f.positive &&
				f.stackItemIds.includes(stackItemId) &&
				(f.slotIds.length === 0 || f.slotIds.includes(group.slot.id))
		);
	}
</script>

<section class="relative pl-7">
	<!-- The timeline rail: a hairline with a node per slot. -->
	<span class="bg-hairline absolute top-2 bottom-0 left-[7px] w-px" aria-hidden="true"></span>
	<span
		class={cn(
			'absolute top-1.5 left-0 grid h-3.5 w-3.5 place-items-center rounded-full border-2',
			complete ? 'bg-accent border-accent' : 'bg-surface border-hairline'
		)}
		aria-hidden="true"
	>
		{#if complete}<Check size={8} strokeWidth={4} class="text-white" />{/if}
	</span>

	<div class="mb-4">
		<div class="mb-1 flex items-baseline gap-2">
			<h2 class="text-sm font-semibold tracking-tight">{group.slot.label}</h2>
			<span class="tnum text-ink-faint text-xs">{formatTime(group.slot.time)}</span>
			<span class="tnum text-ink-faint ml-auto text-xs">{done}/{group.doses.length}</span>
			{#if !complete}
				<button
					type="button"
					onclick={() => store.takeAllInSlot(group.slot.id)}
					class="text-accent text-xs font-medium hover:underline"
				>
					Take all
				</button>
			{/if}
		</div>

		<div class="card divide-hairline divide-y px-3.5 py-1">
			{#each group.doses as dose (dose.key)}
				<DoseRow
					{dose}
					taken={store.takenToday.has(`${dose.stackItemId}:${dose.slotId}`)}
					findings={findingsFor(dose.stackItemId)}
				/>
			{/each}
		</div>
	</div>
</section>
