import { docblock } from '@taqwim/plugins/docblock';
import type { TaqwimConfig } from '@taqwim/types';

const config: TaqwimConfig = {
	/**
	 * List of presets to use.
	 */
	presets: ['taqwim', 'psr', 'docblock'],

	/**
	 * List of plugins to use.
	 */
	plugins: [...docblock],

	/**
	 * Whether to run the linter in debug mode.
	 */
	debug: false,

	/**
	 * Number of times to run the linter
	 */
	runs: 1,

	/**
	 * List of files/directories to ignore.
	 */
	ignore: [
		'**/node_modules/**',
		'**/vendor/**',
	],
};
export default config;