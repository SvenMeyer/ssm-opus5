<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		subtitle,
		actions,
		children
	}: {
		title: string;
		subtitle?: string;
		actions?: Snippet;
		children?: Snippet;
	} = $props();
</script>

<header class="border-hairline mb-6 border-b pb-4">
	<div class="flex flex-wrap items-end justify-between gap-3">
		<div>
			<h1 class="display text-2xl leading-tight sm:text-[1.75rem]">{title}</h1>
			{#if subtitle}
				<p class="text-ink-soft mt-1 text-sm">{subtitle}</p>
			{/if}
		</div>
		{#if actions}
			<div class="flex flex-wrap items-center gap-2">{@render actions()}</div>
		{/if}
	</div>
	{#if children}
		<div class="mt-4">{@render children()}</div>
	{/if}
</header>
