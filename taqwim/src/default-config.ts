export default {
	presets: ['taqwim', 'psr'],

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