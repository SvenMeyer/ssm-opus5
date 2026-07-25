<script lang="ts">
	import { cn } from '$lib/utils/format';
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		value = $bindable(),
		class: klass,
		...rest
	}: { value?: string | number; class?: string } & Omit<HTMLInputAttributes, 'value'> = $props();
</script>

<input
	bind:value
	class={cn(
		'border-hairline bg-surface text-ink placeholder:text-ink-faint h-9.5 w-full rounded-lg border px-3 text-sm',
		'focus:border-accent focus:outline-none',
		klass
	)}
	{...rest}
/>
