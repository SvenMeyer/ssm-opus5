<script lang="ts">
	import { cn } from '$lib/utils/format';
	import { TONE_BG, type Tone } from '$lib/utils/status';

	/** A plain fraction bar — inventory fill, goal coverage, per-item adherence. */
	let {
		value,
		tone = 'accent',
		height = 'md',
		class: klass,
		label
	}: {
		/** 0–1 */
		value: number;
		tone?: Tone;
		height?: 'sm' | 'md';
		class?: string;
		label?: string;
	} = $props();
</script>

<div
	class={cn(
		'bg-raised border-hairline w-full overflow-hidden rounded-full border',
		height === 'sm' ? 'h-1' : 'h-1.5',
		klass
	)}
	role="meter"
	aria-valuenow={Math.round(value * 100)}
	aria-valuemin={0}
	aria-valuemax={100}
	aria-label={label}
>
	<div
		class={cn('h-full rounded-full transition-[width] duration-300', TONE_BG[tone])}
		style="width: {Math.min(100, Math.max(0, value * 100))}%"
	></div>
</div>
