<script lang="ts">
	import { cn } from '$lib/utils/format';
	import type { Snippet } from 'svelte';

	let {
		label,
		hint,
		error,
		class: klass,
		children
	}: {
		label: string;
		hint?: string;
		error?: string;
		class?: string;
		children: Snippet;
	} = $props();
</script>

<label class={cn('block', klass)}>
	<span class="text-ink-soft mb-1.5 block text-[0.8125rem] font-medium">{label}</span>
	{@render children()}
	{#if error}
		<span class="text-warn mt-1 block text-xs">{error}</span>
	{:else if hint}
		<span class="text-ink-faint mt-1 block text-xs">{hint}</span>
	{/if}
</label>
