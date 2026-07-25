<script lang="ts" generics="T extends string">
	import { cn } from '$lib/utils/format';

	/** A compact radio group. Used wherever a page has two or three ways to look at itself. */
	let {
		options,
		value = $bindable(),
		size = 'md',
		class: klass,
		label,
		onchange
	}: {
		options: { value: T; label: string; count?: number }[];
		value: T;
		size?: 'sm' | 'md';
		class?: string;
		label?: string;
		onchange?: (value: T) => void;
	} = $props();

	function select(next: T) {
		value = next;
		onchange?.(next);
	}
</script>

<div
	role="radiogroup"
	aria-label={label}
	class={cn('bg-raised border-hairline inline-flex gap-0.5 rounded-lg border p-0.5', klass)}
>
	{#each options as option (option.value)}
		<button
			type="button"
			role="radio"
			aria-checked={value === option.value}
			onclick={() => select(option.value)}
			class={cn(
				'inline-flex items-center gap-1.5 rounded-[0.4rem] font-medium transition-colors',
				size === 'sm' ? 'h-6.5 px-2 text-[0.75rem]' : 'h-8 px-3 text-[0.8125rem]',
				value === option.value
					? 'bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
					: 'text-ink-faint hover:text-ink'
			)}
		>
			{option.label}
			{#if option.count !== undefined}
				<span class="tnum text-ink-faint text-[0.6875rem]">{option.count}</span>
			{/if}
		</button>
	{/each}
</div>
