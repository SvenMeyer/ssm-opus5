<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '$lib/components/app/theme-toggle.svelte';
	import { store } from '$lib/data/store.svelte';
	import { isActive, NAV_GROUPS, SETTINGS_ITEM, type NavItem } from '$lib/nav';
	import { cn } from '$lib/utils/format';

	function badgeCount(item: NavItem): number {
		if (item.badge === 'problems') return store.problems.length;
		if (item.badge === 'reorder') return store.reorder.length;
		return 0;
	}
</script>

<aside
	class="border-hairline bg-surface/60 sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r px-3 py-4 lg:flex"
>
	<a href="/" class="mb-6 flex items-center gap-2.5 px-2">
		<span
			class="bg-accent grid h-7 w-7 place-items-center rounded-lg text-[0.8125rem] font-bold text-white"
		>
			S
		</span>
		<span class="display text-[0.9375rem] leading-tight">
			Stack<span class="text-ink-faint">Manager</span>
		</span>
	</a>

	<nav class="flex-1 space-y-5 overflow-y-auto">
		{#each NAV_GROUPS as group (group.label)}
			<div>
				<p class="eyebrow px-2 pb-1.5">{group.label}</p>
				<ul class="space-y-0.5">
					{#each group.items as item (item.href)}
						{@const active = isActive(page.url.pathname, item.href)}
						{@const count = badgeCount(item)}
						<li>
							<a
								href={item.href}
								aria-current={active ? 'page' : undefined}
								class={cn(
									'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors',
									active
										? 'bg-accent-soft text-accent-ink font-medium'
										: 'text-ink-soft hover:bg-raised hover:text-ink'
								)}
							>
								<item.icon size={16} class="shrink-0" />
								<span class="flex-1">{item.label}</span>
								{#if count > 0}
									<span
										class={cn(
											'tnum rounded px-1.5 text-[0.6875rem] font-semibold',
											item.badge === 'problems'
												? 'bg-warn-soft text-warn'
												: 'bg-caution-soft text-caution'
										)}
									>
										{count}
									</span>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>

	<div class="border-hairline mt-4 flex items-center justify-between border-t pt-3">
		<a
			href={SETTINGS_ITEM.href}
			class={cn(
				'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors',
				isActive(page.url.pathname, SETTINGS_ITEM.href)
					? 'bg-accent-soft text-accent-ink font-medium'
					: 'text-ink-soft hover:bg-raised hover:text-ink'
			)}
		>
			<SETTINGS_ITEM.icon size={16} />
			{SETTINGS_ITEM.label}
		</a>
		<ThemeToggle />
	</div>
</aside>
