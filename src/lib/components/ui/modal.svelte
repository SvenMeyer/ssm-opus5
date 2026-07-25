<script lang="ts">
	import { cn } from '$lib/utils/format';
	import X from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';

	/**
	 * Built on the native <dialog> element: focus trapping, Escape, inertness of the
	 * page behind and the top-layer stacking all come from the platform rather than
	 * from a library.
	 */
	let {
		open = $bindable(false),
		title,
		description,
		size = 'md',
		children,
		footer
	}: {
		open?: boolean;
		title: string;
		description?: string;
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
		footer?: Snippet;
	} = $props();

	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});

	const WIDTH = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };
</script>

<dialog
	bind:this={dialog}
	onclose={() => (open = false)}
	onclick={(e) => {
		// Clicking the backdrop closes: the dialog element itself is the click target
		// only when the press landed outside the content box.
		if (e.target === dialog) open = false;
	}}
	class={cn(
		'card text-ink m-auto w-[calc(100vw-2rem)] p-0 backdrop:bg-black/40 backdrop:backdrop-blur-[2px]',
		WIDTH[size]
	)}
>
	{#if open}
		<div class="border-hairline flex items-start justify-between gap-4 border-b px-5 py-4">
			<div>
				<h2 class="display text-lg">{title}</h2>
				{#if description}
					<p class="text-ink-soft mt-0.5 text-sm">{description}</p>
				{/if}
			</div>
			<button
				type="button"
				onclick={() => (open = false)}
				aria-label="Close"
				class="text-ink-faint hover:bg-raised hover:text-ink -mt-1 -mr-1 rounded-lg p-1.5 transition-colors"
			>
				<X size={18} />
			</button>
		</div>

		<div class="max-h-[70vh] overflow-y-auto px-5 py-4">
			{@render children()}
		</div>

		{#if footer}
			<div class="border-hairline bg-raised/60 flex justify-end gap-2 border-t px-5 py-3">
				{@render footer()}
			</div>
		{/if}
	{/if}
</dialog>
