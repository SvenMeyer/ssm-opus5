<script lang="ts">
	import { formatDate } from '$lib/domain/date';
	import { cn } from '$lib/utils/format';
	import type { TrendMarker, TrendSeries } from './trend-types';

	/**
	 * Multi-series line chart with event markers.
	 *
	 * Hand-rolled rather than pulled from a chart library: three lines, a y-axis of
	 * fixed range and some vertical rules is not worth 60 kB and a second design
	 * language. Gaps in a series are genuine gaps — the line breaks rather than
	 * interpolating across days the user did not log.
	 */
	let {
		dates,
		series,
		markers = [],
		min = 1,
		max = 5,
		height = 180,
		class: klass
	}: {
		dates: string[];
		series: TrendSeries[];
		markers?: TrendMarker[];
		min?: number;
		max?: number;
		height?: number;
		class?: string;
	} = $props();

	const W = 1000;
	const PAD = { top: 10, right: 8, bottom: 6, left: 26 };

	const x = (i: number) =>
		dates.length <= 1 ? PAD.left : PAD.left + (i / (dates.length - 1)) * (W - PAD.left - PAD.right);

	const y = (value: number) => {
		const span = max - min || 1;
		const inner = height - PAD.top - PAD.bottom;
		return PAD.top + (1 - (value - min) / span) * inner;
	};

	/** Split into runs of consecutive non-null points so gaps stay visible. */
	function paths(points: (number | null)[]): string[] {
		const out: string[] = [];
		let run: string[] = [];
		points.forEach((point, i) => {
			if (point === null) {
				if (run.length > 1) out.push(run.join(' '));
				run = [];
				return;
			}
			run.push(`${run.length === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(point).toFixed(1)}`);
		});
		if (run.length > 1) out.push(run.join(' '));
		return out;
	}

	const markerPositions = $derived(
		markers.map((m) => ({ ...m, index: dates.indexOf(m.date) })).filter((m) => m.index >= 0)
	);
</script>

<div class={cn('w-full', klass)}>
	<svg viewBox="0 0 {W} {height}" class="h-auto w-full" role="img" aria-label="Journal trends">
		{#each [min, (min + max) / 2, max] as gridline (gridline)}
			<line
				x1={PAD.left}
				x2={W - PAD.right}
				y1={y(gridline)}
				y2={y(gridline)}
				class="stroke-hairline"
				stroke-width="1"
			/>
			<text
				x={PAD.left - 6}
				y={y(gridline)}
				text-anchor="end"
				dominant-baseline="middle"
				font-size="11"
				class="fill-ink-faint"
			>
				{gridline}
			</text>
		{/each}

		{#each markerPositions as marker (marker.date + marker.label)}
			<line
				x1={x(marker.index)}
				x2={x(marker.index)}
				y1={PAD.top}
				y2={height - PAD.bottom}
				class="stroke-ink-faint"
				stroke-width="1"
				stroke-dasharray="3 3"
			/>
			<circle cx={x(marker.index)} cy={PAD.top} r="3" class="fill-ink-faint">
				<title>{formatDate(marker.date)} — {marker.label}</title>
			</circle>
		{/each}

		{#each series as line (line.id)}
			{#each paths(line.points) as d, i (i)}
				<path
					{d}
					fill="none"
					stroke={line.color}
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			{/each}
		{/each}
	</svg>
</div>
