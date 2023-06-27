import { builtinModules } from 'node:module';
import { resolve } from 'node:path';
import fs from 'node:fs';
import { defineConfig } from 'vite';
import { globSync } from 'glob';
import { devDependencies } from './package.json';

/**
 * Rollup ignores test file are are not referenced in the entry point.
 * This plugin emits all test files so they are included in the build.
 */
const buildStart = function () {
	const files = globSync('src/test/**/*.ts', {
		absolute: true,
	});

	for (const file of files) {
		if (fs.statSync(file).isDirectory()) {
			continue;
		}

		this.emitFile({
			type: 'chunk',
			id: file,
		});
	}
};

export default defineConfig(({ command }) => {
	return {
		optimizeDeps: {
			exclude: ['vscode'],
		},
		esbuild: {
			pure: ['console'],
		},
		build: {
			sourcemap: false,
			target: 'esnext',
			minify: false,
			emptyOutDir: true,
			lib: {
				entry: [
					resolve(__dirname, 'src/index.ts'),
					resolve(__dirname, 'src/test/run-tests.ts'),
				],
				name: 'taqwim',
				fileName: '[name]',
				formats: ['cjs'],
			},
			rollupOptions: {
				plugins: [
					{
						name: 'emit-test-files',
						buildStart,
					},
				],
				external: [
					'vscode',
					...builtinModules,
					...builtinModules.map((module) => {
						return `node:${module}`;
					}),
					...Object.keys(devDependencies).filter((dep) => {
						return dep !== 'glob';
					}),
				],
				output: {
					preserveModules: true,
					dir: 'dist',

					// interop: 'esModule',
				},
			},
		},
		resolve: {
			alias: {
				'@extension': resolve(__dirname, 'src/'),
				'@taqwim': resolve(__dirname, 'taqwim/src/'),
			},
		},
	};
});