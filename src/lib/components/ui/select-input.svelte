<script lang="ts">
	import { cn } from '$lib/utils/format';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	let {
		value = $bindable(),
		options,
		class: klass,
		id,
		onchange,
		'aria-label': ariaLabel
	}: {
		value: string;
		options: { value: string; label: string }[];
		class?: string;
		id?: string;
		onchange?: (value: string) => void;
		'aria-label'?: string;
	} = $props();
</script>

<div class={cn('relative', klass)}>
	<select
		{id}
		aria-label={ariaLabel}
		bind:value
		onchange={(e) => onchange?.(e.currentTarget.value)}
		class="border-hairline bg-surface text-ink focus:border-accent h-9.5 w-full appearance-none rounded-lg border pr-9 pl-3 text-sm focus:outline-none"
	>
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
	<ChevronDown
		size={15}
		class="text-ink-faint pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
	/>
</div>
