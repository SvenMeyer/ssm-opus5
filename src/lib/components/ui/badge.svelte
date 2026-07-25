<script lang="ts">
	import { cn } from '$lib/utils/format';
	import { TONE_SOFT, type Tone } from '$lib/utils/status';
	import type { Snippet } from 'svelte';

	let {
		tone = 'inert',
		class: klass,
		title,
		children
	}: { tone?: Tone; class?: string; title?: string; children: Snippet } = $props();
</script>

<span
	{title}
	class={cn(
		'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.6875rem] font-medium whitespace-nowrap',
		TONE_SOFT[tone],
		klass
	)}
>
	{@render children()}
</span>
