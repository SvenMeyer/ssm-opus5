<script lang="ts">
	import { cn } from '$lib/utils/format';
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		value = $bindable(),
		class: klass,
		name,
		...rest
	}: { value?: string | number; class?: string } & Omit<HTMLInputAttributes, 'value'> = $props();

	// Chrome warns about form fields with neither id nor name. Most call sites already
	// carry an aria-label for screen readers, so derive the name from it rather than
	// making every caller invent one twice.
	const resolvedName = $derived(
		name ?? rest['aria-label']?.toLowerCase().replace(/[^a-z0-9]+/g, '-')
	);
</script>

<input
	bind:value
	name={resolvedName}
	class={cn(
		'border-hairline bg-surface text-ink placeholder:text-ink-faint h-9.5 w-full rounded-lg border px-3 text-sm',
		'focus:border-accent focus:outline-none',
		klass
	)}
	{...rest}
/>
