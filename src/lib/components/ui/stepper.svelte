<script lang="ts">
	import { num } from '$lib/utils/format';
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';

	/** Servings are commonly halves, so the default step is 0.5 rather than 1. */
	let {
		value = $bindable(0),
		step = 0.5,
		min = 0,
		max = 20,
		suffix,
		label,
		onchange
	}: {
		value?: number;
		step?: number;
		min?: number;
		max?: number;
		suffix?: string;
		label: string;
		onchange?: (value: number) => void;
	} = $props();

	function set(next: number) {
		value = Math.min(max, Math.max(min, Math.round(next / step) * step));
		onchange?.(value);
	}
</script>

<div class="border-hairline bg-surface inline-flex h-9 items-center rounded-lg border">
	<button
		type="button"
		aria-label="Decrease {label}"
		disabled={value <= min}
		onclick={() => set(value - step)}
		class="text-ink-soft hover:bg-raised hover:text-ink h-full rounded-l-lg px-2.5 transition-colors disabled:opacity-30"
	>
		<Minus size={14} />
	</button>
	<span class="tnum min-w-14 px-1 text-center text-sm font-medium" aria-label={label}>
		{num(value, 2)}{#if suffix}<span class="text-ink-faint ml-0.5 text-xs">{suffix}</span>{/if}
	</span>
	<button
		type="button"
		aria-label="Increase {label}"
		disabled={value >= max}
		onclick={() => set(value + step)}
		class="text-ink-soft hover:bg-raised hover:text-ink h-full rounded-r-lg px-2.5 transition-colors disabled:opacity-30"
	>
		<Plus size={14} />
	</button>
</div>
