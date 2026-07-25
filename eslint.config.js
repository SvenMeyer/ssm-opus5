import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

// Note: this project has no svelte.config.js — SvelteKit is configured inline in
// vite.config.ts (SvelteKit 2.6x style), so no `svelteConfig` is passed to the parser.
export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			],
			// This app is served from the root and configures no `base` path, so wrapping
			// every internal href in resolve() would add noise without buying anything.
			// Turn it back on the day a base path is introduced.
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser,
				extraFileExtensions: ['.svelte']
			}
		}
	},
	{
		ignores: ['.svelte-kit/', 'build/', 'node_modules/', 'static/', 'pnpm-lock.yaml']
	}
);
