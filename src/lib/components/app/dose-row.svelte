<script lang="ts">
	import type { Finding } from '$lib/domain/interactions';
	import type { ScheduledDose } from '$lib/domain/schedule';
	import { store } from '$lib/data/store.svelte';
	import { cn, units } from '$lib/utils/format';
	import { severityTone, TONE_SOFT } from '$lib/utils/status';
	import Check from '@lucide/svelte/icons/check';
	import Info from '@lucide/svelte/icons/info';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Utensils from '@lucide/svelte/icons/utensils';

	let {
		dose,
		taken,
		findings = []
	}: { dose: ScheduledDose; taken: boolean; findings?: Finding[] } = $props();

	const product = $derived(store.productById.get(dose.productId));
	const worst = $derived(
		findings.find((f) => f.severity === 'warning') ??
			findings.find((f) => f.severity === 'caution') ??
			findings[0]
	);
</script>

<div class="flex items-center gap-3 py-2">
	<button
		type="button"
		role="checkbox"
		aria-checked={taken}
		aria-label="{taken ? 'Undo' : 'Take'} {product?.name}"
		onclick={() => store.toggleDose(dose.stackItemId, dose.slotId)}
		class={cn(
			'grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-all',
			taken
				? 'bg-accent border-accent text-white'
				: 'border-hairline hover:border-accent bg-surface'
		)}
	>
		{#if taken}<Check size={14} strokeWidth={3} />{/if}
	</button>

	<a href="/stack/{dose.stackItemId}" class="group min-w-0 flex-1">
		<span
			class={cn(
				'block truncate text-sm transition-colors',
				taken ? 'text-ink-faint line-through' : 'text-ink group-hover:text-accent'
			)}
		>
			{product?.name ?? 'Unknown product'}
		</span>
		<span class="text-ink-faint flex items-center gap-1.5 text-xs">
			<span class="tnum">{product ? units(dose.units, product.form) : ''}</span>
			{#if dose.withFood === 'with'}
				<Utensils size={11} aria-label="with food" />
			{:else if dose.withFood === 'without'}
				<span class="text-[0.625rem] tracking-wide uppercase">empty stomach</span>
			{/if}
		</span>
	</a>

	{#if worst}
		<a
			href="/interactions"
			title={worst.detail}
			class={cn(
				'flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.6875rem] font-medium',
				TONE_SOFT[severityTone(worst.severity)]
			)}
		>
			{#if worst.severity === 'info'}
				<Info size={11} />
			{:else}
				<TriangleAlert size={11} />
			{/if}
			<span class="hidden sm:inline">{worst.title}</span>
		</a>
	{/if}
</div>
