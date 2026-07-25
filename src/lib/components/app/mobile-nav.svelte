<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '$lib/components/app/theme-toggle.svelte';
	import { store } from '$lib/data/store.svelte';
	import { ALL_NAV_ITEMS, isActive, MOBILE_PRIMARY, type NavItem } from '$lib/nav';
	import { cn } from '$lib/utils/format';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';

	let moreOpen = $state(false);

	const primary = ALL_NAV_ITEMS.filter((i) => MOBILE_PRIMARY.includes(i.href));
	const secondary = ALL_NAV_ITEMS.filter((i) => !MOBILE_PRIMARY.includes(i.href));

	const moreActive = $derived(secondary.some((i) => isActive(page.url.pathname, i.href)));

	function badgeCount(item: NavItem): number {
		if (item.badge === 'problems') return store.problems.length;
		if (item.badge === 'reorder') return store.reorder.length;
		return 0;
	}

	const hiddenProblems = $derived(secondary.reduce((sum, item) => sum + badgeCount(item), 0));
</script>

<!-- Bottom bar: the four daily destinations plus everything else behind "More". -->
<nav
	class="border-hairline bg-surface/95 fixed inset-x-0 bottom-0 z-40 flex border-t backdrop-blur lg:hidden"
	style="padding-bottom: env(safe-area-inset-bottom)"
>
	{#each primary as item (item.href)}
		{@const active = isActive(page.url.pathname, item.href)}
		{@const count = badgeCount(item)}
		<a
			href={item.href}
			aria-current={active ? 'page' : undefined}
			class={cn(
				'relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.625rem] font-medium transition-colors',
				active ? 'text-accent' : 'text-ink-faint'
			)}
		>
			<item.icon size={19} />
			{item.label}
			{#if count > 0}
				<span class="bg-caution absolute top-1.5 right-1/2 h-1.5 w-1.5 translate-x-3.5 rounded-full"
				></span>
			{/if}
		</a>
	{/each}

	<button
		type="button"
		onclick={() => (moreOpen = true)}
		class={cn(
			'relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.625rem] font-medium transition-colors',
			moreActive ? 'text-accent' : 'text-ink-faint'
		)}
	>
		<Ellipsis size={19} />
		More
		{#if hiddenProblems > 0}
			<span class="bg-warn absolute top-1.5 right-1/2 h-1.5 w-1.5 translate-x-3.5 rounded-full"
			></span>
		{/if}
	</button>
</nav>

{#if moreOpen}
	<!-- Backdrop + sheet. A plain fixed layer rather than a <dialog>: this one is a
	     navigation surface, and swallowing focus for a menu is more harm than help. -->
	<button
		type="button"
		aria-label="Close menu"
		onclick={() => (moreOpen = false)}
		class="fixed inset-0 z-40 bg-black/35 lg:hidden"
	></button>
	<div
		class="border-hairline bg-surface fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t p-4 pb-8 lg:hidden"
	>
		<div class="mb-3 flex items-center justify-between">
			<p class="eyebrow">More</p>
			<ThemeToggle />
		</div>
		<ul class="grid grid-cols-2 gap-2">
			{#each secondary as item (item.href)}
				{@const count = badgeCount(item)}
				<li>
					<a
						href={item.href}
						onclick={() => (moreOpen = false)}
						class={cn(
							'card flex items-center gap-2.5 px-3 py-2.5 text-sm',
							isActive(page.url.pathname, item.href) && 'border-accent/50 text-accent-ink'
						)}
					>
						<item.icon size={16} />
						<span class="flex-1">{item.label}</span>
						{#if count > 0}
							<span
								class="bg-warn-soft text-warn tnum rounded px-1.5 text-[0.6875rem] font-semibold"
							>
								{count}
							</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</div>
{/if}
