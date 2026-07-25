<script lang="ts">
	import { cn } from '$lib/utils/format';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'default' | 'ghost' | 'danger' | 'link';
	type Size = 'sm' | 'md' | 'lg' | 'icon';

	type Props = {
		variant?: Variant;
		size?: Size;
		href?: string;
		class?: string;
		children: Snippet;
	} & Omit<HTMLButtonAttributes & HTMLAnchorAttributes, 'children' | 'size'>;

	let { variant = 'default', size = 'md', href, class: klass, children, ...rest }: Props = $props();

	const VARIANTS: Record<Variant, string> = {
		primary: 'bg-accent text-white hover:opacity-90 border border-transparent',
		default: 'card text-ink hover:bg-raised',
		ghost: 'text-ink-soft hover:bg-raised hover:text-ink border border-transparent',
		danger: 'bg-warn-soft text-warn border border-warn/30 hover:bg-warn hover:text-white',
		link: 'text-accent hover:underline underline-offset-4 border border-transparent p-0'
	};

	const SIZES: Record<Size, string> = {
		sm: 'h-8 px-2.5 text-[0.8125rem] gap-1.5',
		md: 'h-9.5 px-3.5 text-sm gap-2',
		lg: 'h-11 px-5 text-[0.9375rem] gap-2',
		icon: 'h-9 w-9 justify-center'
	};

	const classes = $derived(
		cn(
			'inline-flex items-center rounded-lg font-medium transition-colors',
			'disabled:pointer-events-none disabled:opacity-45',
			VARIANTS[variant],
			variant === 'link' ? '' : SIZES[size],
			klass
		)
	);
</script>

{#if href}
	<a {href} class={classes} {...rest}>{@render children()}</a>
{:else}
	<button type="button" class={classes} {...rest}>{@render children()}</button>
{/if}
