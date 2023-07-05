import { builtinModules } from 'node:module';
import { resolve, join as joinPath } from 'node:path';
import { readFileSync } from 'node:fs';
import { configDefaults, defineConfig } from 'vitest/config';

const getPackageDependencies = () => {
	const packageJson = readFileSync(joinPath(process.cwd(), './package.json'), 'utf8');
	const { dependencies } = JSON.parse(packageJson);

	return Object.keys(dependencies);
};

export default defineConfig({
	test: {
		include: ['**/*.test.ts'],
		coverage: {
			exclude: [...configDefaults.coverage.exclude ?? '', '**/src/phpparser/*'],
			reporter: ['text', 'html'],
		},
	},
	build: {
		target: 'ES2020',
		minify: false,
		emptyOutDir: true,
		lib: {
			entry: resolve(__dirname, 'src/cli/index.ts'),
			name: 'taqwim',
			fileName: '[name]',
			formats: ['es'],
		},
		rollupOptions: {
			external: [
				'yargs/helpers',
				'tslib',
				...getPackageDependencies(),
				...builtinModules,
				...builtinModules.map((module) => {
					return `node:${module}`;
				}),
			],
			output: {
				banner: function (file) {
					// Shebang is removed during transpilation, so we add it here
					if (file.name === 'cli/index') {
						return '#!/usr/bin/env node';
					}
					return '';
				},
				preserveModules: true,
				dir: resolve(__dirname, 'dist'),
			},
		},
	},
	resolve: {
		alias: {
			'@taqwim': resolve(__dirname, 'src/'),
			'@taqwim-test': resolve(__dirname, 'test/'),
		},
	},
});