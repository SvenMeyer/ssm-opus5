<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import { store } from '$lib/data/store.svelte';
	import type { Finding } from '$lib/domain/interactions';
	import { cn } from '$lib/utils/format';
	import { severityTone, TONE_BORDER, TONE_SOFT, TONE_TEXT } from '$lib/utils/status';
	import Check from '@lucide/svelte/icons/check';
	import Gauge from '@lucide/svelte/icons/gauge';
	import Info from '@lucide/svelte/icons/info';
	import Link2 from '@lucide/svelte/icons/link-2';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Wand from '@lucide/svelte/icons/wand-sparkles';

	let { finding }: { finding: Finding } = $props();

	const tone = $derived(finding.positive ? 'ok' : severityTone(finding.severity));

	const KIND_LABEL = {
		conflict: 'Interaction',
		timing: 'Timing',
		synergy: 'Synergy',
		ceiling: 'Ceiling'
	} as const;
</script>

<article class={cn('card p-4', TONE_BORDER[tone])}>
	<div class="flex items-start gap-3">
		<span class={cn('mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg', TONE_SOFT[tone])}>
			{#if finding.positive}
				<Check size={14} />
			{:else if finding.kind === 'ceiling'}
				<Gauge size={14} />
			{:else if finding.kind === 'synergy'}
				<Link2 size={14} />
			{:else if finding.severity === 'info'}
				<Info size={14} />
			{:else}
				<TriangleAlert size={14} />
			{/if}
		</span>

		<div class="min-w-0 flex-1">
			<div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
				<h3 class="text-sm font-semibold">{finding.title}</h3>
				<span class={cn('eyebrow', TONE_TEXT[tone])}>{KIND_LABEL[finding.kind]}</span>
			</div>
			<p class="text-ink-soft mt-1 text-sm">{finding.detail}</p>

			<div class="mt-2.5 flex flex-wrap items-center gap-2">
				{#each finding.stackItemIds as id (id)}
					<a
						href="/stack/{id}"
						class="bg-raised text-ink-soft hover:text-accent rounded-md px-1.5 py-0.5 text-[0.6875rem]"
					>
						{store.nameOf(id)}
					</a>
				{/each}
			</div>

			{#if finding.fix}
				<div class="mt-3">
					<Button size="sm" variant="primary" onclick={() => store.applyFix(finding.fix!)}>
						<Wand size={13} />
						{finding.fix.label}
					</Button>
				</div>
			{:else if !finding.positive && finding.kind === 'ceiling'}
				<p class="text-ink-faint mt-2.5 text-xs">
					No automatic fix — reduce a dose or drop one of the products contributing to it.
				</p>
			{/if}
		</div>
	</div>
</article>
