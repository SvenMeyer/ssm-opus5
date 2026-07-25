<script lang="ts">
	import { cn } from '$lib/utils/format';

	let {
		checked = $bindable(false),
		label,
		description,
		onchange
	}: {
		checked?: boolean;
		label: string;
		description?: string;
		onchange?: (checked: boolean) => void;
	} = $props();
</script>

<label class="flex cursor-pointer items-start justify-between gap-4">
	<span>
		<span class="block text-sm font-medium">{label}</span>
		{#if description}
			<span class="text-ink-faint mt-0.5 block text-xs">{description}</span>
		{/if}
	</span>
	<input
		type="checkbox"
		bind:checked
		onchange={() => onchange?.(checked)}
		class="peer sr-only"
		aria-label={label}
	/>
	<span
		aria-hidden="true"
		class={cn(
			'relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors',
			'peer-focus-visible:outline-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2',
			checked ? 'bg-accent' : 'bg-inert/40'
		)}
	>
		<span
			class={cn(
				'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform',
				checked && 'translate-x-4'
			)}
		></span>
	</span>
</label>
