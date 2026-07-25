<script lang="ts">
	import { store } from '$lib/data/store.svelte';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';

	/** Flips between light and dark, which also drops the "system" preference. */
	function toggle() {
		store.updateSettings({ theme: store.isDark ? 'light' : 'dark' });
	}
</script>

<button
	type="button"
	onclick={toggle}
	aria-label="Switch to {store.isDark ? 'light' : 'dark'} mode"
	class="text-ink-faint hover:bg-raised hover:text-ink rounded-lg p-2 transition-colors"
>
	{#if store.isDark}
		<Sun size={17} />
	{:else}
		<Moon size={17} />
	{/if}
</button>
