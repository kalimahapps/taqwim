/*
 * PHP Parser is writting in common js, and it is compile using
 * webpack. One of the issues is that in production, 'self' is
 * undefined. This is because webpack is using 'self' to refer
 * to the global object. This is not the case in nodejs.
 * 
 * This script is used to compile PHP Parser to esm
 * using vite. Using the built-in esm module, we don't run
 * into the issue of 'self' being undefined.
 */
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const dirname = fileURLToPath(new URL('.', import.meta.url));
const entry = resolve(dirname, '..', 'node_modules', 'php-parser', 'src', 'index.js');

const config = {
	build: {
		target: 'esnext',
		emptyOutDir: true,
		lib: {
			entry,
			name: 'php-parser',
			fileName: '[name]',
			format: 'es',
		},
		rollupOptions: {
			output: {
				preserveModules: false,
				dir: resolve(dirname, '..', 'src', 'phpparser'),
			},
		},
	},
};

await build(config);
