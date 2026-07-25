<script lang="ts">
	import { cn } from '$lib/utils/format';
	import type { Tone } from '$lib/utils/status';
	import type { Snippet } from 'svelte';

	/** Progress ring. Used for today's adherence and nothing else — it stays special. */
	let {
		value,
		size = 84,
		stroke = 7,
		tone = 'accent',
		class: klass,
		children
	}: {
		/** 0–1 */
		value: number;
		size?: number;
		stroke?: number;
		tone?: Tone;
		class?: string;
		children?: Snippet;
	} = $props();

	const radius = $derived((size - stroke) / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const dash = $derived(circumference * Math.min(1, Math.max(0, value)));

	const STROKE: Record<Tone, string> = {
		ok: 'stroke-ok',
		caution: 'stroke-caution',
		warn: 'stroke-warn',
		inert: 'stroke-inert',
		accent: 'stroke-accent'
	};
</script>

<div
	class={cn('relative inline-grid place-items-center', klass)}
	style="width: {size}px; height: {size}px"
>
	<svg width={size} height={size} viewBox="0 0 {size} {size}" class="-rotate-90" aria-hidden="true">
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke-width={stroke}
			class="stroke-hairline"
		/>
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke-width={stroke}
			stroke-linecap="round"
			stroke-dasharray="{dash} {circumference}"
			class={cn('transition-[stroke-dasharray] duration-500', STROKE[tone])}
		/>
	</svg>
	{#if children}
		<div class="absolute inset-0 grid place-items-center text-center">{@render children()}</div>
	{/if}
</div>
