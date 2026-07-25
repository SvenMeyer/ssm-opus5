<script lang="ts">
	import NutrientBar from '$lib/components/charts/nutrient-bar.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Modal from '$lib/components/ui/modal.svelte';
	import Stepper from '$lib/components/ui/stepper.svelte';
	import { store } from '$lib/data/store.svelte';
	import { formatTime } from '$lib/domain/date';
	import { getNutrient } from '$lib/domain/nutrients';
	import { statusFor } from '$lib/domain/totals';
	import type { Dose, Product } from '$lib/domain/types';
	import { amount, cn, FORM_LABEL, money, units } from '$lib/utils/format';
	import { goto } from '$app/navigation';

	let {
		product = $bindable(),
		open = $bindable(false)
	}: { product: Product | null; open?: boolean } = $props();

	let servings = $state<Record<string, number>>({});
	let goalIds = $state<string[]>([]);

	// Reset the form each time a different product opens the dialog.
	$effect(() => {
		if (product) {
			servings = {};
			goalIds = [];
		}
	});

	const doses = $derived<Dose[]>(
		Object.entries(servings)
			.filter(([, value]) => value > 0)
			.map(([slotId, value]) => ({ slotId, servings: value, withFood: 'any' as const }))
	);

	const dailyServings = $derived(doses.reduce((s, d) => s + d.servings, 0));

	function add() {
		if (!product || doses.length === 0) return;
		const id = store.addToStack(product.id, doses, goalIds);
		open = false;
		goto(`/stack/${id}`);
	}
</script>

<Modal
	bind:open
	size="lg"
	title={product?.name ?? ''}
	description={product ? `${product.brand} · ${FORM_LABEL[product.form]}` : ''}
>
	{#if product}
		<div class="space-y-6">
			<section>
				<p class="eyebrow mb-2">Per serving ({units(product.unitsPerServing, product.form)})</p>
				<div class="border-hairline divide-hairline divide-y rounded-lg border px-3">
					{#each product.ingredients as ingredient (ingredient.nutrientId)}
						{@const nutrient = getNutrient(ingredient.nutrientId)}
						{#if nutrient}
							<div class="py-2.5">
								<div class="mb-1 flex items-baseline justify-between gap-3 text-sm">
									<span>{nutrient.name}</span>
									<span class="tnum">{amount(ingredient.amountPerServing, nutrient.unit)}</span>
								</div>
								<NutrientBar
									{nutrient}
									amount={ingredient.amountPerServing}
									status={statusFor(nutrient, ingredient.amountPerServing)}
									height="sm"
								/>
							</div>
						{/if}
					{/each}
				</div>
			</section>

			<section>
				<p class="eyebrow mb-2">When will you take it?</p>
				<div class="border-hairline divide-hairline divide-y rounded-lg border">
					{#each store.slots as slot (slot.id)}
						<div class="flex items-center gap-3 px-3 py-2">
							<div class="flex-1">
								<p class="text-sm">{slot.label}</p>
								<p class="tnum text-ink-faint text-xs">{formatTime(slot.time)}</p>
							</div>
							<Stepper
								value={servings[slot.id] ?? 0}
								suffix="×"
								label="{slot.label} servings"
								onchange={(value) => (servings = { ...servings, [slot.id]: value })}
							/>
						</div>
					{/each}
				</div>
			</section>

			<section>
				<p class="eyebrow mb-2">Goals (optional)</p>
				<div class="flex flex-wrap gap-2">
					{#each store.goals as goal (goal.id)}
						{@const on = goalIds.includes(goal.id)}
						<button
							type="button"
							aria-pressed={on}
							onclick={() =>
								(goalIds = on ? goalIds.filter((g) => g !== goal.id) : [...goalIds, goal.id])}
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

			{#if product.notes}
				<p class="text-ink-soft text-xs">{product.notes}</p>
			{/if}

			<div class="flex flex-wrap gap-1">
				{#each product.tags as tag (tag)}
					<Badge tone="inert">{tag}</Badge>
				{/each}
			</div>
		</div>
	{/if}

	{#snippet footer()}
		{#if product}
			<span class="tnum text-ink-faint mr-auto self-center text-xs">
				{dailyServings > 0
					? `${money((product.price / product.unitsPerContainer) * product.unitsPerServing * dailyServings, product.currency)} a day`
					: 'Pick at least one slot'}
			</span>
		{/if}
		<Button onclick={() => (open = false)}>Cancel</Button>
		<Button variant="primary" disabled={doses.length === 0} onclick={add}>Add to stack</Button>
	{/snippet}
</Modal>
