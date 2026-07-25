<script lang="ts">
	import '../app.css';
	import MobileNav from '$lib/components/app/mobile-nav.svelte';
	import Sidebar from '$lib/components/app/sidebar.svelte';
	import { store } from '$lib/data/store.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// One load for the whole session; every page then reads the same store.
	let loading = $state(true);
	$effect(() => {
		store.init().then(() => (loading = false));
	});
</script>

<svelte:head>
	<title>Supplement Stack Manager</title>
	<meta
		name="description"
		content="Plan a supplement stack, see what it actually adds up to, and catch the timing mistakes."
	/>
</svelte:head>

<div class="flex min-h-dvh">
	<Sidebar />

	<main class="min-w-0 flex-1 pb-20 lg:pb-0">
		<div class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
			{#if loading}
				<div class="text-ink-faint py-24 text-center text-sm">Loading your stack…</div>
			{:else}
				{@render children()}
			{/if}
		</div>
	</main>
</div>

<MobileNav />
