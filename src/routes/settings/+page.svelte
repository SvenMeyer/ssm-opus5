<script lang="ts">
	import PageHeader from '$lib/components/app/page-header.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Field from '$lib/components/ui/field.svelte';
	import Modal from '$lib/components/ui/modal.svelte';
	import SelectInput from '$lib/components/ui/select-input.svelte';
	import Segmented from '$lib/components/ui/segmented.svelte';
	import TextInput from '$lib/components/ui/text-input.svelte';
	import Toggle from '$lib/components/ui/toggle.svelte';
	import { store } from '$lib/data/store.svelte';
	import { today } from '$lib/domain/date';
	import type { SlotKind } from '$lib/domain/types';
	import { plural } from '$lib/utils/format';
	import Download from '@lucide/svelte/icons/download';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Upload from '@lucide/svelte/icons/upload';

	let newLabel = $state('');
	let newTime = $state('15:00');
	let newKind = $state<SlotKind>('meal');

	let importOpen = $state(false);
	let importText = $state('');
	let importError = $state('');
	let resetOpen = $state(false);
	let removeSlot = $state<string | null>(null);

	const KIND_OPTIONS: { value: SlotKind; label: string }[] = [
		{ value: 'fasted', label: 'Empty stomach' },
		{ value: 'meal', label: 'With a meal' },
		{ value: 'workout', label: 'Around training' },
		{ value: 'bed', label: 'Before bed' }
	];

	/** How many scheduled doses a slot would take with it if removed. */
	function dosesIn(slotId: string): number {
		return store.stack.reduce(
			(sum, item) => sum + item.doses.filter((d) => d.slotId === slotId).length,
			0
		);
	}

	function download() {
		const blob = new Blob([store.exportJson()], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		// today(), not toISOString() — the latter is UTC and stamps yesterday's date on
		// an evening export anywhere west of Greenwich.
		a.download = `supplement-stack-${today()}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function runImport() {
		importError = (await store.importJson(importText)) ?? '';
		if (!importError) {
			importOpen = false;
			importText = '';
		}
	}

	async function reset() {
		await store.resetToDemo();
		resetOpen = false;
	}
</script>

<PageHeader title="Settings" subtitle="Your day structure, your data, your eyes." />

<div class="space-y-8">
	<section>
		<h2 class="mb-1 text-sm font-semibold">Time slots</h2>
		<p class="text-ink-faint mb-3 text-xs">
			The shape of your day. The timing engine reads the clock time and the kind of slot — rename or
			retime these and every interaction check follows.
		</p>

		<div class="card divide-hairline divide-y">
			{#each store.slots as slot (slot.id)}
				{@const count = dosesIn(slot.id)}
				<div class="flex flex-wrap items-center gap-3 px-4 py-3">
					<!-- TextInput is w-full by design; sizing goes on a wrapper so the two
					     width utilities never fight over specificity. -->
					<div class="w-40">
						<TextInput
							value={slot.label}
							aria-label="{slot.label} name"
							oninput={(e) => store.saveSlot({ ...slot, label: e.currentTarget.value })}
						/>
					</div>
					<input
						type="time"
						value={slot.time}
						aria-label="{slot.label} time"
						name="slot-time-{slot.id}"
						onchange={(e) => store.saveSlot({ ...slot, time: e.currentTarget.value })}
						class="border-hairline bg-surface tnum focus:border-accent h-9.5 rounded-lg border px-2 text-sm focus:outline-none"
					/>
					<SelectInput
						value={slot.kind}
						options={KIND_OPTIONS}
						class="w-44"
						aria-label="{slot.label} kind"
						onchange={(kind) => store.saveSlot({ ...slot, kind: kind as SlotKind })}
					/>
					<span class="text-ink-faint ml-auto text-xs">{plural(count, 'dose')}</span>
					<button
						type="button"
						onclick={() => (removeSlot = slot.id)}
						disabled={store.slots.length <= 1}
						aria-label="Remove {slot.label}"
						class="text-ink-faint hover:bg-raised hover:text-warn rounded-lg p-2 transition-colors disabled:opacity-30"
					>
						<Trash2 size={15} />
					</button>
				</div>
			{/each}
		</div>

		<div class="card mt-3 flex flex-wrap items-end gap-3 p-4">
			<Field label="New slot" class="w-40">
				<TextInput bind:value={newLabel} name="new-slot-label" placeholder="Afternoon" />
			</Field>
			<Field label="Time">
				<input
					type="time"
					bind:value={newTime}
					name="new-slot-time"
					aria-label="New slot time"
					class="border-hairline bg-surface tnum focus:border-accent h-9.5 rounded-lg border px-2 text-sm focus:outline-none"
				/>
			</Field>
			<Field label="Kind" class="w-44">
				<SelectInput bind:value={newKind} options={KIND_OPTIONS} name="new-slot-kind" />
			</Field>
			<Button
				variant="primary"
				disabled={!newLabel.trim()}
				onclick={() => {
					store.addSlot(newLabel.trim(), newTime, newKind);
					newLabel = '';
				}}
			>
				Add slot
			</Button>
		</div>
	</section>

	<section>
		<h2 class="mb-3 text-sm font-semibold">Appearance & units</h2>
		<div class="card space-y-4 p-4">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p class="text-sm font-medium">Theme</p>
					<p class="text-ink-faint text-xs">System follows your operating system.</p>
				</div>
				<Segmented
					label="Theme"
					value={store.settings.theme}
					options={[
						{ value: 'light', label: 'Light' },
						{ value: 'dark', label: 'Dark' },
						{ value: 'system', label: 'System' }
					]}
					onchange={(theme) => store.updateSettings({ theme })}
				/>
			</div>

			<div class="border-hairline flex flex-wrap items-center justify-between gap-3 border-t pt-4">
				<div>
					<p class="text-sm font-medium">Currency</p>
					<p class="text-ink-faint text-xs">
						All prices are held in one currency. Switching relabels every figure — it does not
						convert, because this prototype carries no exchange rates.
					</p>
				</div>
				<SelectInput
					value={store.settings.currency}
					class="w-28"
					aria-label="Currency"
					options={[
						{ value: 'EUR', label: 'EUR €' },
						{ value: 'USD', label: 'USD $' },
						{ value: 'GBP', label: 'GBP £' }
					]}
					onchange={(currency) => store.updateSettings({ currency })}
				/>
			</div>

			<div class="border-hairline border-t pt-4">
				<Toggle
					checked={store.settings.showEmptyNutrients}
					label="Show nutrients your stack delivers none of"
					description="Turns the Nutrients page into a full checklist rather than a summary of what you take."
					onchange={(showEmptyNutrients) => store.updateSettings({ showEmptyNutrients })}
				/>
			</div>
		</div>
	</section>

	<section>
		<h2 class="mb-1 text-sm font-semibold">Your data</h2>
		<p class="text-ink-faint mb-3 text-xs">
			Everything lives in this browser's local storage — nothing is sent anywhere. Export before
			clearing site data, or the stack goes with it.
		</p>
		<div class="card flex flex-wrap gap-2 p-4">
			<Button onclick={download}>
				<Download size={14} />
				Export JSON
			</Button>
			<Button onclick={() => (importOpen = true)}>
				<Upload size={14} />
				Import JSON
			</Button>
			<Button variant="danger" class="ml-auto" onclick={() => (resetOpen = true)}>
				<RotateCcw size={14} />
				Reset to demo data
			</Button>
		</div>
	</section>

	<section>
		<h2 class="mb-1 text-sm font-semibold">About this prototype</h2>
		<div class="card text-ink-soft space-y-2 p-4 text-sm">
			<p>
				A frontend-only prototype: the calculations are real, the catalog is invented. Brands like
				Nordkap and Terra Vitae do not exist, and reference values are approximate adult figures
				rather than a maintained clinical dataset.
			</p>
			<p>
				It is not medical advice. Interaction rules cover common supplement pairings only — they say
				nothing about prescription medication, which is a conversation for a pharmacist.
			</p>
		</div>
	</section>
</div>

<Modal
	bind:open={importOpen}
	title="Import a stack"
	description="Paste a JSON export. This replaces everything currently stored."
>
	<textarea
		bind:value={importText}
		name="import-json"
		aria-label="Exported JSON to import"
		rows="10"
		placeholder="Paste the contents of your export file…"
		class="border-hairline bg-surface placeholder:text-ink-faint focus:border-accent w-full rounded-lg border px-3 py-2 font-mono text-xs focus:outline-none"
	></textarea>
	{#if importError}
		<p class="text-warn mt-2 text-sm">{importError}</p>
	{/if}
	{#snippet footer()}
		<Button onclick={() => (importOpen = false)}>Cancel</Button>
		<Button variant="primary" disabled={!importText.trim()} onclick={runImport}>Import</Button>
	{/snippet}
</Modal>

<Modal
	bind:open={resetOpen}
	title="Reset to demo data?"
	description="Your stack, dose history and journal are replaced by the seeded demo."
>
	<p class="text-ink-soft text-sm">
		This cannot be undone. Export first if there is anything here you want to keep.
	</p>
	{#snippet footer()}
		<Button onclick={() => (resetOpen = false)}>Cancel</Button>
		<Button variant="danger" onclick={reset}>Reset everything</Button>
	{/snippet}
</Modal>

<Modal
	bind:open={
		() => removeSlot !== null,
		(v) => {
			if (!v) removeSlot = null;
		}
	}
	title="Remove this slot?"
	description="Any doses scheduled into it are removed with it."
>
	<p class="text-ink-soft text-sm">
		{removeSlot ? plural(dosesIn(removeSlot), 'scheduled dose') : ''} will be unscheduled. The stack items
		themselves stay.
	</p>
	{#snippet footer()}
		<Button onclick={() => (removeSlot = null)}>Cancel</Button>
		<Button
			variant="danger"
			onclick={() => {
				if (removeSlot) store.removeSlot(removeSlot);
				removeSlot = null;
			}}
		>
			Remove slot
		</Button>
	{/snippet}
</Modal>
