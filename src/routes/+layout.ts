/**
 * Client-only rendering.
 *
 * Every byte of state in this prototype lives in localStorage, so rendering on the
 * server would mean painting seed data and then swapping it for the user's own — a
 * flash and a hydration mismatch in exchange for nothing. When the real database
 * lands, deleting this line and moving reads into `+page.server.ts` is the migration.
 */
export const ssr = false;
export const prerender = false;
