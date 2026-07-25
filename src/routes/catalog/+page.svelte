<script lang="ts">
	import { page } from '$app/state';
	import AddToStackDialog from '$lib/components/app/add-to-stack-dialog.svelte';
	import CustomProductDialog from '$lib/components/app/custom-product-dialog.svelte';
	import PageHeader from '$lib/components/app/page-header.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import EmptyState from '$lib/components/ui/empty-state.svelte';
	import SelectInput from '$lib/components/ui/select-input.svelte';
	import TextInput from '$lib/components/ui/text-input.svelte';
	import { store } from '$lib/data/store.svelte';
	import { CATEGORY_ORDER, getNutrient, NUTRIENT_CATEGORY_LABEL } from '$lib/domain/nutrients';
	import type { Product } from '$lib/domain/types';
	import { FORM_LABEL, money, plural, units } from '$lib/utils/format';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import SearchX from '@lucide/svelte/icons/search-x';

	// Deep links from the Goals page arrive as ?q=<nutrient>, so a gap turns into a search.
	let query = $state(page.url.searchParams.get('q') ?? '');
	let form = $state('all');
	let category = $state('all');
	let selected = $state<Product | null>(null);
	let dialogOpen = $state(false);
	let customOpen = $state(false);

	const inStack = $derived(new Set(store.stack.map((i) => i.productId)));

	/** Searches brand, name, tags and — the useful one — ingredient names. */
	const results = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return store.products.filter((product) => {
			if (form !== 'all' && product.form !== form) return false;

			if (category !== 'all') {
				const hit = product.ingredients.some(
					(i) => getNutrient(i.nutrientId)?.category === category
				);
				if (!hit) return false;
			}

			if (q === '') return true;
			const haystack = [
				product.name,
				product.brand,
				...product.tags,
				...product.ingredients.map((i) => getNutrient(i.nutrientId)?.name ?? '')
			]
				.join(' ')
				.toLowerCase();
			return haystack.includes(q);
		});
	});

	const formOptions = [
		{ value: 'all', label: 'Any form' },
		...Object.entries(FORM_LABEL).map(([value, label]) => ({ value, label }))
	];

	const categoryOptions = [
		{ value: 'all', label: 'Any category' },
		...CATEGORY_ORDER.map((value) => ({ value, label: NUTRIENT_CATEGORY_LABEL[value] }))
	];

	function open(product: Product) {
		selected = product;
		dialogOpen = true;
	}
</script>

<PageHeader
	title="Catalog"
	subtitle="{plural(store.products.length, 'product')} · search by name, brand, tag or ingredient"
>
	{#snippet actions()}
		<Button size="sm" onclick={() => (customOpen = true)}>
			<Plus size={14} />
			Add your own
		</Button>
	{/snippet}

	<div class="flex flex-wrap gap-2">
		<div class="relative min-w-52 flex-1">
			<Search size={15} class="text-ink-faint absolute top-1/2 left-3 -translate-y-1/2" />
			<TextInput
				bind:value={query}
				placeholder="magnesium, sleep, Nordkap…"
				class="pl-9"
				aria-label="Search the catalog"
			/>
		</div>
		<SelectInput bind:value={form} options={formOptions} class="w-36" aria-label="Filter by form" />
		<SelectInput
			bind:value={category}
			options={categoryOptions}
			class="w-44"
			aria-label="Filter by nutrient category"
		/>
	</div>
</PageHeader>

{#if results.length === 0}
	<EmptyState
		icon={SearchX}
		title="Nothing matches"
		body="Try a broader search, or add the product yourself if it is not in the catalog."
	>
		{#snippet action()}
			<Button variant="primary" onclick={() => (customOpen = true)}>Add your own product</Button>
		{/snippet}
	</EmptyState>
{:else}
	<p class="text-ink-faint mb-3 text-xs">{plural(results.length, 'result')}</p>
	<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
		{#each results as product (product.id)}
			<article class="card flex flex-col p-4">
				<div class="flex items-start justify-between gap-2">
					<div class="min-w-0">
						<h3 class="truncate text-sm font-semibold">{product.name}</h3>
						<p class="text-ink-faint text-xs">{product.brand}</p>
					</div>
					{#if inStack.has(product.id)}
						<Badge tone="ok">In stack</Badge>
					{:else if product.custom}
						<Badge tone="accent">Yours</Badge>
					{/if}
				</div>

				<ul class="text-ink-soft mt-3 flex-1 space-y-0.5 text-xs">
					{#each product.ingredients.slice(0, 4) as ingredient (ingredient.nutrientId)}
						{@const nutrient = getNutrient(ingredient.nutrientId)}
						{#if nutrient}
							<li class="flex justify-between gap-2">
								<span class="truncate">{nutrient.name}</span>
								<span class="tnum text-ink-faint shrink-0">
									{ingredient.amountPerServing}
									{nutrient.unit}
								</span>
							</li>
						{/if}
					{/each}
					{#if product.ingredients.length > 4}
						<li class="text-ink-faint">+{product.ingredients.length - 4} more</li>
					{/if}
				</ul>

				<div class="border-hairline mt-3 flex items-center justify-between border-t pt-2.5">
					<div class="text-xs">
						<span class="tnum">{money(product.price, store.settings.currency)}</span>
						<span class="text-ink-faint">
							· {units(product.unitsPerServing, product.form)}/serving
						</span>
					</div>
					<Button
						size="sm"
						variant={inStack.has(product.id) ? 'default' : 'primary'}
						onclick={() => open(product)}
					>
						{inStack.has(product.id) ? 'Add again' : 'Add'}
					</Button>
				</div>
			</article>
		{/each}
	</div>
{/if}

<AddToStackDialog bind:product={selected} bind:open={dialogOpen} />
<CustomProductDialog bind:open={customOpen} />
