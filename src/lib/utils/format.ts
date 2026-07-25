import type { ProductForm, Unit } from '$lib/domain/types';

/** Join truthy class fragments. Deliberately not a tailwind-merge — we own the classes. */
export function cn(...parts: (string | false | null | undefined)[]): string {
	return parts.filter(Boolean).join(' ');
}

/**
 * Amounts need to read like a label, not like a float: 0.5 mg stays 0.5, 1000 mg stays
 * 1000, and 66.66666 becomes 66.7.
 */
export function num(value: number, maxDecimals = 1): string {
	const rounded = Math.abs(value) < 1 && value !== 0 ? Number(value.toPrecision(2)) : value;
	return rounded.toLocaleString('en-GB', { maximumFractionDigits: maxDecimals });
}

export function amount(value: number, unit: Unit): string {
	return `${num(value, unit === 'g' ? 2 : 1)} ${unit}`;
}

export function percent(value: number, decimals = 0): string {
	return `${value.toLocaleString('en-GB', { maximumFractionDigits: decimals })}%`;
}

const CURRENCY_SYMBOL: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' };

export function money(value: number, currency = 'EUR', decimals = 2): string {
	const symbol = CURRENCY_SYMBOL[currency] ?? `${currency} `;
	return `${symbol}${value.toLocaleString('en-GB', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	})}`;
}

const FORM_UNIT: Record<ProductForm, [string, string]> = {
	capsule: ['capsule', 'capsules'],
	tablet: ['tablet', 'tablets'],
	softgel: ['softgel', 'softgels'],
	powder: ['scoop', 'scoops'],
	liquid: ['ml', 'ml'],
	gummy: ['gummy', 'gummies'],
	sachet: ['sachet', 'sachets']
};

export function formUnit(form: ProductForm, count: number): string {
	const [one, many] = FORM_UNIT[form];
	return count === 1 ? one : many;
}

/** "2 capsules", "1 scoop", "5 ml". */
export function units(count: number, form: ProductForm): string {
	return `${num(count, 2)} ${formUnit(form, count)}`;
}

export const FORM_LABEL: Record<ProductForm, string> = {
	capsule: 'Capsule',
	tablet: 'Tablet',
	softgel: 'Softgel',
	powder: 'Powder',
	liquid: 'Liquid',
	gummy: 'Gummy',
	sachet: 'Sachet'
};

export function plural(count: number, one: string, many = `${one}s`): string {
	return `${count} ${count === 1 ? one : many}`;
}

export function initials(text: string): string {
	return text
		.split(/\s+/)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase() ?? '')
		.join('');
}
