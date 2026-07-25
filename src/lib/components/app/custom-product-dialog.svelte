<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Field from '$lib/components/ui/field.svelte';
	import Modal from '$lib/components/ui/modal.svelte';
	import SelectInput from '$lib/components/ui/select-input.svelte';
	import TextInput from '$lib/components/ui/text-input.svelte';
	import { store } from '$lib/data/store.svelte';
	import { CATEGORY_ORDER, NUTRIENTS, NUTRIENT_CATEGORY_LABEL } from '$lib/domain/nutrients';
	import type { Ingredient, ProductForm } from '$lib/domain/types';
	import { FORM_LABEL } from '$lib/utils/format';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Plus from '@lucide/svelte/icons/plus';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let brand = $state('');
	let name = $state('');
	let form = $state<ProductForm>('capsule');
	let unitsPerServing = $state('1');
	let unitsPerContainer = $state('60');
	let price = $state('');
	let rows = $state<{ nutrientId: string; amount: string }[]>([{ nutrientId: '', amount: '' }]);
	let error = $state('');

	$effect(() => {
		if (open) {
			brand = '';
			name = '';
			form = 'capsule';
			unitsPerServing = '1';
			unitsPerContainer = '60';
			price = '';
			rows = [{ nutrientId: '', amount: '' }];
			error = '';
		}
	});

	const nutrientOptions = [
		{ value: '', label: 'Choose a nutrient…' },
		...CATEGORY_ORDER.flatMap((category) =>
			NUTRIENTS.filter((n) => n.category === category).map((n) => ({
				value: n.id,
				label: `${NUTRIENT_CATEGORY_LABEL[category].replace(/s$/, '')} · ${n.name} (${n.unit})`
			}))
		)
	];

	const formOptions = Object.entries(FORM_LABEL).map(([value, label]) => ({ value, label }));

	function save() {
		const ingredients: Ingredient[] = rows
			.filter((r) => r.nutrientId && Number(r.amount) > 0)
			.map((r) => ({ nutrientId: r.nutrientId, amountPerServing: Number(r.amount) }));

		if (!name.trim()) return (error = 'Give the product a name.');
		if (ingredients.length === 0) return (error = 'Add at least one ingredient with an amount.');
		if (!(Number(unitsPerContainer) > 0))
			return (error = 'A container needs more than zero units.');

		store.addProduct({
			brand: brand.trim() || 'Own entry',
			name: name.trim(),
			form,
			unitsPerServing: Number(unitsPerServing) || 1,
			unitsPerContainer: Number(unitsPerContainer),
			price: Number(price) || 0,
			ingredients,
			tags: ['custom']
		});
		open = false;
	}
</script>

<Modal
	bind:open
	size="lg"
	title="Add your own product"
	description="Copy the numbers off the label. It joins the catalog and every calculation in the app."
>
	<div class="space-y-4">
		<div class="grid gap-3 sm:grid-cols-2">
			<Field label="Product name">
				<TextInput bind:value={name} placeholder="Magnesium Glycinate 200" />
			</Field>
			<Field label="Brand">
				<TextInput bind:value={brand} placeholder="Optional" />
			</Field>
		</div>

		<div class="grid gap-3 sm:grid-cols-4">
			<Field label="Form">
				<SelectInput bind:value={form} options={formOptions} name="custom-product-form" />
			</Field>
			<Field label="Units / serving" hint="e.g. 2 capsules">
				<TextInput bind:value={unitsPerServing} type="number" min="0.5" step="0.5" />
			</Field>
			<Field label="Units / container">
				<TextInput bind:value={unitsPerContainer} type="number" min="1" step="1" />
			</Field>
			<Field label="Price" hint={store.settings.currency}>
				<TextInput bind:value={price} type="number" min="0" step="0.01" placeholder="0.00" />
			</Field>
		</div>

		<div>
			<p class="eyebrow mb-2">Per serving</p>
			<div class="space-y-2">
				{#each rows as _row, i (i)}
					<div class="flex items-start gap-2">
						<SelectInput
							bind:value={rows[i].nutrientId}
							options={nutrientOptions}
							class="flex-1"
							aria-label="Nutrient {i + 1}"
						/>
						<div class="w-28 shrink-0">
							<TextInput
								bind:value={rows[i].amount}
								type="number"
								min="0"
								step="any"
								placeholder="Amount"
								aria-label="Amount {i + 1}"
							/>
						</div>
						<button
							type="button"
							onclick={() => (rows = rows.filter((_, index) => index !== i))}
							disabled={rows.length === 1}
							aria-label="Remove ingredient {i + 1}"
							class="text-ink-faint hover:bg-raised hover:text-warn h-9.5 rounded-lg px-2 transition-colors disabled:opacity-30"
						>
							<Trash2 size={15} />
						</button>
					</div>
				{/each}
			</div>
			<Button
				size="sm"
				class="mt-2"
				onclick={() => (rows = [...rows, { nutrientId: '', amount: '' }])}
			>
				<Plus size={13} />
				Add ingredient
			</Button>
		</div>

		{#if error}
			<p class="text-warn text-sm">{error}</p>
		{/if}
	</div>

	{#snippet footer()}
		<Button onclick={() => (open = false)}>Cancel</Button>
		<Button variant="primary" onclick={save}>Save to catalog</Button>
	{/snippet}
</Modal>
