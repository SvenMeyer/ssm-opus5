<script lang="ts">
	import PageHeader from '$lib/components/app/page-header.svelte';
	import Meter from '$lib/components/charts/meter.svelte';
	import NutrientBar from '$lib/components/charts/nutrient-bar.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { store } from '$lib/data/store.svelte';
	import { statusFor } from '$lib/domain/totals';
	import { amount, percent, plural } from '$lib/utils/format';
	import { ratioTone } from '$lib/utils/status';
	import Check from '@lucide/svelte/icons/check';
	import Minus from '@lucide/svelte/icons/minus';
</script>

<PageHeader
	title="Goals"
	subtitle="What you are actually taking this stack for, and whether it covers the ground."
/>

<div class="space-y-4">
	{#each store.coverage as coverage (coverage.goal.id)}
		<section class="card p-5">
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div class="min-w-48 flex-1">
					<div class="flex items-center gap-2">
						<span
							class="h-2.5 w-2.5 shrink-0 rounded-full"
							style="background: {coverage.goal.color}"
						></span>
						<h2 class="display text-lg leading-none">{coverage.goal.name}</h2>
					</div>
					<p class="text-ink-soft mt-1.5 text-sm">{coverage.goal.blurb}</p>
				</div>

				<div class="w-40">
					<div class="mb-1 flex items-baseline justify-between text-xs">
						<span class="text-ink-faint">Coverage</span>
						<span class="tnum font-medium">{percent(coverage.coverage * 100)}</span>
					</div>
					<Meter
						value={coverage.coverage}
						tone={ratioTone(coverage.coverage)}
						label="{coverage.goal.name} coverage"
					/>
					<p class="text-ink-faint mt-1.5 text-[0.6875rem]">
						{coverage.covered.length} of {coverage.nutrients.length} nutrients ·
						{plural(coverage.itemCount, 'item')} assigned
					</p>
				</div>
			</div>

			<div class="mt-5 grid gap-5 sm:grid-cols-2">
				<div>
					<p class="eyebrow mb-2">Nutrient coverage</p>
					<ul class="space-y-2.5">
						{#each coverage.nutrients as state (state.nutrient.id)}
							<li>
								<div class="mb-1 flex items-center justify-between gap-2 text-xs">
									<span class="flex min-w-0 items-center gap-1.5">
										{#if state.covered}
											<Check size={11} class="text-ok shrink-0" />
										{:else}
											<Minus size={11} class="text-ink-faint shrink-0" />
										{/if}
										<span class="truncate">{state.nutrient.name}</span>
									</span>
									<span class="tnum text-ink-faint shrink-0">
										{state.amount > 0 ? amount(state.amount, state.nutrient.unit) : '—'}
									</span>
								</div>
								<NutrientBar
									nutrient={state.nutrient}
									amount={state.amount}
									status={statusFor(state.nutrient, state.amount)}
									height="sm"
									showTicks={state.nutrient.rda !== undefined}
								/>
							</li>
						{/each}
					</ul>
				</div>

				<div>
					<p class="eyebrow mb-2">Assigned to this goal</p>
					{#if coverage.items.length === 0}
						<p class="text-ink-faint text-xs">
							Nothing assigned. Open a stack item and tag it with {coverage.goal.name} — coverage is measured
							from nutrients either way, but assignment is what tells you why a bottle is on the shelf.
						</p>
					{:else}
						<ul class="space-y-1">
							{#each coverage.items as item (item.id)}
								<li>
									<a
										href="/stack/{item.id}"
										class="text-ink-soft hover:text-accent block truncate text-sm"
									>
										{store.nameOf(item.id)}
									</a>
								</li>
							{/each}
						</ul>
					{/if}

					{#if coverage.missing.length > 0}
						<p class="eyebrow mt-4 mb-1.5">Gaps</p>
						<p class="text-ink-soft text-xs">
							Nothing in your stack covers
							{coverage.missing.map((m) => m.nutrient.name).join(', ')}.
						</p>
						<Button
							href="/catalog?q={encodeURIComponent(coverage.missing[0].nutrient.name)}"
							variant="link"
							class="mt-1.5 text-xs"
						>
							Find {coverage.missing[0].nutrient.name} in the catalog
						</Button>
					{/if}
				</div>
			</div>
		</section>
	{/each}
</div>
