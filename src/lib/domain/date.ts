/**
 * Date helpers. Everything in this app is a *local* calendar day (`YYYY-MM-DD`) —
 * "did I take my morning dose" is a question about the wall clock where you live,
 * never about UTC. Constructing `new Date(iso)` from a bare date string would parse
 * as UTC and shift the day backwards for anyone west of Greenwich, so we never do it.
 */

export type IsoDate = string;

export function toIso(date: Date): IsoDate {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function fromIso(iso: IsoDate): Date {
	const [y, m, d] = iso.split('-').map(Number);
	return new Date(y, m - 1, d);
}

export function today(): IsoDate {
	return toIso(new Date());
}

export function addDays(iso: IsoDate, days: number): IsoDate {
	const d = fromIso(iso);
	d.setDate(d.getDate() + days);
	return toIso(d);
}

export function daysBetween(from: IsoDate, to: IsoDate): number {
	const ms = fromIso(to).getTime() - fromIso(from).getTime();
	return Math.round(ms / 86_400_000);
}

/** Inclusive range, oldest first. */
export function rangeEndingAt(end: IsoDate, days: number): IsoDate[] {
	const out: IsoDate[] = [];
	for (let i = days - 1; i >= 0; i--) out.push(addDays(end, -i));
	return out;
}

/** "HH:MM" → minutes since midnight. */
export function minutesOfDay(time: string): number {
	const [h, m] = time.split(':').map(Number);
	return h * 60 + m;
}

/**
 * Hours between two slot times, treating the day as a cycle: a bedtime slot and the
 * next morning's slot are close together, not 14 hours apart. Always 0–12.
 */
export function hoursApart(timeA: string, timeB: string): number {
	const diff = Math.abs(minutesOfDay(timeA) - minutesOfDay(timeB));
	const cyclic = Math.min(diff, 1440 - diff);
	return cyclic / 60;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso: IsoDate): string {
	const d = fromIso(iso);
	return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatLongDate(iso: IsoDate): string {
	const d = fromIso(iso);
	return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "today", "yesterday", "3 days ago", "in 5 days". */
export function relativeDay(iso: IsoDate, from: IsoDate = today()): string {
	const delta = daysBetween(from, iso);
	if (delta === 0) return 'today';
	if (delta === 1) return 'tomorrow';
	if (delta === -1) return 'yesterday';
	if (delta < 0) return `${-delta} days ago`;
	return `in ${delta} days`;
}

/** 12h clock, used in slot headers. */
export function formatTime(time: string): string {
	const [h, m] = time.split(':').map(Number);
	const suffix = h < 12 ? 'am' : 'pm';
	const hour = h % 12 === 0 ? 12 : h % 12;
	return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, '0')}${suffix}`;
}
