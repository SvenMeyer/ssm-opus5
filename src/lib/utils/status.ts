import type { Severity } from '$lib/domain/types';
import type { NutrientStatus } from '$lib/domain/totals';
import type { StockLevel } from '$lib/domain/inventory';

/**
 * The single mapping from domain state to colour.
 *
 * Green / amber / red mean exactly one thing in this app — how safe a number is — and
 * that meaning is defined here and nowhere else. The brand accent is a cool blue
 * precisely so it can never be mistaken for a status.
 */
export type Tone = 'ok' | 'caution' | 'warn' | 'inert' | 'accent';

export const TONE_TEXT: Record<Tone, string> = {
	ok: 'text-ok',
	caution: 'text-caution',
	warn: 'text-warn',
	inert: 'text-inert',
	accent: 'text-accent'
};

export const TONE_BG: Record<Tone, string> = {
	ok: 'bg-ok',
	caution: 'bg-caution',
	warn: 'bg-warn',
	inert: 'bg-inert',
	accent: 'bg-accent'
};

export const TONE_SOFT: Record<Tone, string> = {
	ok: 'bg-ok-soft text-ok',
	caution: 'bg-caution-soft text-caution',
	warn: 'bg-warn-soft text-warn',
	inert: 'bg-inert-soft text-ink-soft',
	accent: 'bg-accent-soft text-accent-ink'
};

export const TONE_BORDER: Record<Tone, string> = {
	ok: 'border-ok/40',
	caution: 'border-caution/40',
	warn: 'border-warn/40',
	inert: 'border-hairline',
	accent: 'border-accent/40'
};

export function nutrientTone(status: NutrientStatus): Tone {
	switch (status) {
		case 'over':
			return 'warn';
		case 'high':
			return 'caution';
		case 'ok':
			return 'ok';
		case 'low':
			return 'accent';
		default:
			return 'inert';
	}
}

export function severityTone(severity: Severity): Tone {
	switch (severity) {
		case 'warning':
			return 'warn';
		case 'caution':
			return 'caution';
		default:
			return 'accent';
	}
}

export function stockTone(level: StockLevel): Tone {
	switch (level) {
		case 'out':
			return 'warn';
		case 'critical':
			return 'warn';
		case 'low':
			return 'caution';
		default:
			return 'ok';
	}
}

/** Coverage and adherence share one scale: below half is a problem, above 80% is good. */
export function ratioTone(ratio: number): Tone {
	if (ratio >= 0.8) return 'ok';
	if (ratio >= 0.5) return 'caution';
	return 'warn';
}
