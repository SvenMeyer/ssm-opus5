<script lang="ts">
	import type { Component } from 'svelte';
	import type { Snippet } from 'svelte';

	let {
		icon: Icon,
		title,
		body,
		action
	}: {
		icon?: Component<{ size?: number | string; class?: string }>;
		title: string;
		body?: string;
		action?: Snippet;
	} = $props();
</script>

<div
	class="border-hairline flex flex-col items-center rounded-xl border border-dashed px-6 py-12 text-center"
>
	{#if Icon}
		<Icon size={22} class="text-ink-faint mb-3" />
	{/if}
	<p class="display text-base">{title}</p>
	{#if body}
		<p class="text-ink-faint mt-1 max-w-sm text-sm">{body}</p>
	{/if}
	{#if action}
		<div class="mt-4">{@render action()}</div>
	{/if}
</div>
