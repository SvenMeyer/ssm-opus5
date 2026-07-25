<script lang="ts">
	import type { DayAdherence } from '$lib/domain/adherence';
	import { formatDate } from '$lib/domain/date';
	import { cn } from '$lib/utils/format';

	/**
	 * A contribution-graph style calendar: one column per week, Monday at the top.
	 * Opacity, not hue, carries the value — hue is reserved for safety status.
	 */
	let { series, class: klass }: { series: DayAdherence[]; class?: string } = $props();

	const WEEKDAY_LABEL = ['M', '', 'W', '', 'F', '', 'S'];

	/** Monday-first weekday index, 0–6. */
	function weekdayIndex(iso: string): number {
		const [y, m, d] = iso.split('-').map(Number);
		return (new Date(y, m - 1, d).getDay() + 6) % 7;
	}

	const columns = $derived.by(() => {
		const cols: (DayAdherence | null)[][] = [];
		let current: (DayAdherence | null)[] = Array(weekdayIndex(series[0]?.date ?? '')).fill(null);

		for (const day of series) {
			current.push(day);
			if (current.length === 7) {
				cols.push(current);
				current = [];
			}
		}
		if (current.length > 0) {
			cols.push([...current, ...Array(7 - current.length).fill(null)]);
		}
		return cols;
	});

	function level(ratio: number): string {
		if (ratio >= 0.999) return 'bg-accent';
		if (ratio >= 0.8) return 'bg-accent/70';
		if (ratio >= 0.5) return 'bg-accent/45';
		if (ratio > 0) return 'bg-accent/22';
		return 'bg-raised border border-hairline';
	}
</script>

<div class={cn('flex gap-2', klass)}>
	<div class="text-ink-faint grid grid-rows-7 gap-[3px] pt-px text-[0.5625rem] leading-none">
		{#each WEEKDAY_LABEL as day, i (i)}
			<span class="flex h-3 items-center">{day}</span>
		{/each}
	</div>

	<div class="flex gap-[3px] overflow-x-auto pb-1">
		{#each columns as week, wi (wi)}
			<div class="grid grid-rows-7 gap-[3px]">
				{#each week as day, di (di)}
					{#if day}
						<span
							class={cn('h-3 w-3 rounded-[3px]', level(day.ratio))}
							title="{formatDate(day.date)} — {day.taken}/{day.expected} doses"
						></span>
					{:else}
						<span class="h-3 w-3"></span>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
</div>
