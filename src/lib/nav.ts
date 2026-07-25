import Activity from '@lucide/svelte/icons/activity';
import BookOpen from '@lucide/svelte/icons/book-open';
import LayoutGrid from '@lucide/svelte/icons/layout-grid';
import Library from '@lucide/svelte/icons/library';
import Settings from '@lucide/svelte/icons/settings';
import Sun from '@lucide/svelte/icons/sun';
import Target from '@lucide/svelte/icons/target';
import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
import TrendingUp from '@lucide/svelte/icons/trending-up';
import type { Component } from 'svelte';

export interface NavItem {
	href: string;
	label: string;
	icon: Component<{ size?: number | string; class?: string }>;
	/** Which store counter, if any, to show as a badge. */
	badge?: 'problems' | 'reorder';
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

/**
 * Nine routes without a nine-item wall: three labelled groups on desktop, and on
 * mobile the five that matter day to day with the rest behind "More".
 */
export const NAV_GROUPS: NavGroup[] = [
	{
		label: 'Daily',
		items: [
			{ href: '/', label: 'Today', icon: Sun },
			{ href: '/stack', label: 'Stack', icon: LayoutGrid, badge: 'reorder' },
			{ href: '/catalog', label: 'Catalog', icon: Library }
		]
	},
	{
		label: 'Analysis',
		items: [
			{ href: '/nutrients', label: 'Nutrients', icon: Activity },
			{ href: '/interactions', label: 'Interactions', icon: TriangleAlert, badge: 'problems' },
			{ href: '/insights', label: 'Insights', icon: TrendingUp }
		]
	},
	{
		label: 'Personal',
		items: [
			{ href: '/goals', label: 'Goals', icon: Target },
			{ href: '/journal', label: 'Journal', icon: BookOpen }
		]
	}
];

export const SETTINGS_ITEM: NavItem = { href: '/settings', label: 'Settings', icon: Settings };

export const ALL_NAV_ITEMS: NavItem[] = [...NAV_GROUPS.flatMap((g) => g.items), SETTINGS_ITEM];

/** The five that earn a permanent place on a phone. */
export const MOBILE_PRIMARY = ['/', '/stack', '/catalog', '/nutrients'];

export function isActive(pathname: string, href: string): boolean {
	return href === '/' ? pathname === '/' : pathname.startsWith(href);
}
