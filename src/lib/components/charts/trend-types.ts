export interface TrendSeries {
	id: string;
	label: string;
	color: string;
	/** Aligned index-for-index with the chart's `dates`; null means no entry that day. */
	points: (number | null)[];
}

export interface TrendMarker {
	date: string;
	label: string;
}
