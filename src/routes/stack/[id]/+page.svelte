<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import FindingCard from '$lib/components/app/finding-card.svelte';
	import PageHeader from '$lib/components/app/page-header.svelte';
	import Meter from '$lib/components/charts/meter.svelte';
	import NutrientBar from '$lib/components/charts/nutrient-bar.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Modal from '$lib/components/ui/modal.svelte';
	import Segmented from '$lib/components/ui/segmented.svelte';
	import Stepper from '$lib/components/ui/stepper.svelte';
	import { store } from '$lib/data/store.svelte';
	import { costPerDay } from '$lib/domain/cost';
	import { formatLongDate, formatTime } from '$lib/domain/date';
	import { findingsForItem } from '$lib/domain/interactions';
	import { inventoryFor } from '$lib/domain/inventory';
	import { statusFor } from '$lib/domain/totals';
	import { getNutrient } from '$lib/domain/nutrients';
	import type { FoodRequirement } from '$lib/domain/types';
	import { amount, cn, FORM_LABEL, money, plural, units } from '$lib/utils/format';
	import { stockTone, TONE_TEXT } from '$lib/utils/status';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	const item = $derived(store.stackItemById.get(page.params.id ?? ''));
	const product = $derived(item ? store.productById.get(item.productId) : undefined);
	const inventory = $derived(item && product ? inventoryFor(item, product) : null);
	const findings = $derived(item ? findingsForItem(store.findings, item.id) : []);

	let confirmDelete = $state(false);
	let notes = $derived(item?.notes ?? '');

	const FOOD_OPTIONS: { value: FoodRequirement; label: string }[] = [
		{ value: 'any', label: 'Either' },
		{ value: 'with', label: 'With food' },
		{ value: 'without', label: 'Empty' }
	];

	function remove() {
		if (!item) return;
		store.removeFromStack(item.id);
		confirmDelete = false;
		goto('/stack');
	}
</script>

{#if !item || !product}
	<PageHeader title="Not found" subtitle="That item is no longer in your stack." />
	<Button href="/stack"><ArrowLeft size={14} />Back to stack</Button>
{:else}
	<a
		href="/stack"
		class="text-ink-faint hover:text-accent mb-4 inline-flex items-center gap-1.5 text-sm"
	>
		<ArrowLeft size={14} />
		Stack
	</a>

	<PageHeader
		title={product.name}
		subtitle="{product.brand} · {FORM_LABEL[product.form]} · started {formatLongDate(
			item.startedOn
		)}"
	>
		{#snippet actions()}
			<Button size="sm" onclick={() => store.toggleStatus(item!.id)}>
				{item.status === 'active' ? 'Pause' : 'Resume'}
			</Button>
			<Button size="sm" variant="danger" onclick={() => (confirmDelete = true)}>
				<Trash2 size={14} />
				Remove
			</Button>
		{/snippet}
	</PageHeader>

	{#if findings.length > 0}
		<section class="mb-8 space-y-2">
			<p class="eyebrow mb-2">Flagged for this item</p>
			{#each findings as finding (finding.id)}
				<FindingCard {finding} />
			{/each}
		</section>
	{/if}

	<div class="grid gap-8 lg:grid-cols-[1fr_20rem]">
		<div class="space-y-8">
			<!-- Schedule editor: one row per slot, servings and food requirement inline. -->
			<section>
				<h2 class="mb-1 text-sm font-semibold">Schedule</h2>
				<p class="text-ink-faint mb-3 text-xs">
					Set servings per slot. Zero removes the dose. One serving is {units(
						product.unitsPerServing,
						product.form
					)}.
				</p>

				<div class="card divide-hairline divide-y">
					{#each store.slots as slot (slot.id)}
						{@const dose = item.doses.find((d) => d.slotId === slot.id)}
						<div class="flex flex-wrap items-center gap-3 px-4 py-3">
							<div class="min-w-28 flex-1">
								<p class={cn('text-sm', dose ? 'font-medium' : 'text-ink-faint')}>{slot.label}</p>
								<p class="tnum text-ink-faint text-xs">{formatTime(slot.time)}</p>
							</div>

							<Stepper
								value={dose?.servings ?? 0}
								label="{slot.label} servings"
								suffix="×"
								onchange={(servings) => store.setDose(item!.id, slot.id, servings)}
							/>

							{#if dose}
								<Segmented
									size="sm"
									label="Food requirement at {slot.label}"
									value={dose.withFood}
									options={FOOD_OPTIONS}
									onchange={(food) => store.setDoseFood(item!.id, slot.id, food)}
								/>
							{/if}
						</div>
					{/each}
				</div>
			</section>

			<section>
				<h2 class="mb-3 text-sm font-semibold">What one serving delivers</h2>
				<div class="card divide-hairline divide-y px-4 py-1">
					{#each product.ingredients as ingredient (ingredient.nutrientId)}
						{@const nutrient = getNutrient(ingredient.nutrientId)}
						{#if nutrient}
							{@const total = store.totals.find((t) => t.nutrient.id === nutrient.id)}
							<div class="py-3">
								<div class="mb-1.5 flex items-baseline justify-between gap-3">
									<span class="text-sm">{nutrient.name}</span>
									<span class="tnum text-sm">
										{amount(ingredient.amountPerServing, nutrient.unit)}
									</span>
								</div>
								<NutrientBar
									{nutrient}
									amount={ingredient.amountPerServing}
									status={statusFor(nutrient, ingredient.amountPerServing)}
									height="sm"
								/>
								{#if total && total.contributions.length > 1}
									<p class="text-ink-faint mt-1 text-[0.6875rem]">
										Your whole stack delivers {amount(total.amount, nutrient.unit)} a day across
										{plural(total.contributions.length, 'product')}.
									</p>
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			</section>

			<section>
				<h2 class="mb-3 text-sm font-semibold">Goals</h2>
				<div class="flex flex-wrap gap-2">
					{#each store.goals as goal (goal.id)}
						{@const on = item.goalIds.includes(goal.id)}
						<button
							type="button"
							onclick={() => store.toggleGoal(item!.id, goal.id)}
							aria-pressed={on}
							class={cn(
								'rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
								on
									? 'border-transparent text-white'
									: 'border-hairline text-ink-soft hover:bg-raised'
							)}
							style={on ? `background: ${goal.color}` : ''}
						>
							{goal.name}
						</button>
					{/each}
				</div>
			</section>

			<section>
				<h2 class="mb-3 text-sm font-semibold">Notes</h2>
				<textarea
					bind:value={notes}
					name="item-notes"
					onblur={() => store.updateItem(item!.id, { notes })}
					rows="3"
					placeholder="Why you take it, what you have noticed, what to ask the doctor…"
					class="border-hairline bg-surface placeholder:text-ink-faint focus:border-accent w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
				></textarea>
			</section>
		</div>

		<aside class="space-y-6">
			<section class="card p-4">
				<h2 class="eyebrow mb-3">Stock</h2>
				<div class="mb-1 flex items-baseline justify-between">
					<span class="tnum text-lg font-medium">{units(item.unitsOnHand, product.form)}</span>
					{#if inventory}
						<span class={cn('tnum text-sm', TONE_TEXT[stockTone(inventory.level)])}>
							{inventory.daysRemaining === null ? '—' : plural(inventory.daysRemaining, 'day')}
						</span>
					{/if}
				</div>
				<Meter
					value={inventory?.fill ?? 0}
					tone={stockTone(inventory?.level ?? 'ok')}
					label="Stock level"
				/>
				{#if inventory?.runoutDate}
					<p class="text-ink-faint mt-2 text-xs">Runs out {formatLongDate(inventory.runoutDate)}</p>
				{/if}
				<div class="mt-3 flex items-center gap-2">
					<Button size="sm" onclick={() => store.restock(item!.id)}>
						Refill to {product.unitsPerContainer}
					</Button>
					<Stepper
						value={item.unitsOnHand}
						step={1}
						max={999}
						label="Units on hand"
						onchange={(unitsOnHand) => store.updateItem(item!.id, { unitsOnHand })}
					/>
				</div>
			</section>

			<section class="card p-4">
				<h2 class="eyebrow mb-3">Cost</h2>
				<dl class="space-y-1.5 text-sm">
					<div class="flex justify-between">
						<dt class="text-ink-soft">Per day</dt>
						<dd class="tnum">{money(costPerDay(item, product), store.settings.currency)}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-ink-soft">Per month</dt>
						<dd class="tnum">
							{money(costPerDay(item, product) * 30.44, store.settings.currency)}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-ink-soft">Container</dt>
						<dd class="tnum">
							{money(product.price, store.settings.currency)} / {product.unitsPerContainer}
						</dd>
					</div>
				</dl>
			</section>

			{#if product.tags.length > 0 || product.notes}
				<section class="card p-4">
					<h2 class="eyebrow mb-3">Product</h2>
					{#if product.notes}
						<p class="text-ink-soft mb-3 text-xs">{product.notes}</p>
					{/if}
					<div class="flex flex-wrap gap-1">
						{#each product.tags as tag (tag)}
							<Badge tone="inert">{tag}</Badge>
						{/each}
					</div>
				</section>
			{/if}
		</aside>
	</div>

	<Modal
		bind:open={confirmDelete}
		title="Remove {product.name}?"
		description="This deletes the item and its dose history. Your other stack items are untouched."
	>
		<p class="text-ink-soft text-sm">
			{plural(store.data.logs.filter((l) => l.stackItemId === item!.id).length, 'logged dose')} will be
			deleted along with it.
		</p>
		{#snippet footer()}
			<Button onclick={() => (confirmDelete = false)}>Cancel</Button>
			<Button variant="danger" onclick={remove}>Remove from stack</Button>
		{/snippet}
	</Modal>
{/if}
