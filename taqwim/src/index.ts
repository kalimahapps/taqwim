import { loadConfig } from '@taqwim/utils/index.js';
import ProcessFiles from '@taqwim/process-files.js';
import Rules from '@taqwim/process-rules.js';

import type { Report, LintOptions, TaqwimConfig } from '@taqwim/types/';

class Taqwim {
	/**
	 * Rules object
	 */
	rules: any;

	/**
	 * Source code to be processed
	 */
	sourceCode = '';

	/**
	 * Taqwim config
	 */
	taqwimConfig: TaqwimConfig | undefined;

	/**
	 * Constructor function
	 */
	constructor() {
		// Empty
	}

	/**
	 * Load the config file from the current working
	 * directory (if it exists), otherwise load the default config
	 *
	 * @param {string} cwd            Current working directory
	 * @param {string} configFileName Config file name. If supplied, it will be
	 *                                used instead of the default config file names
	 */
	async loadConfig(cwd?: string, configFileName?: string) {
		this.taqwimConfig = await loadConfig(cwd ?? process.cwd(), configFileName);
	}

	/**
	 * Start processing all files
	 *
	 * @param  {LintOptions} options Options object
	 * @return {Report[]}            Full report
	 */
	lint(options: LintOptions): Report[] {
		// console.time('test');
		if (!this.taqwimConfig) {
			throw new Error('Taqwim config not loaded');
		}

		this.rules = new Rules(this.taqwimConfig, options);
		this.rules.registerRules();

		const process = new ProcessFiles(this.rules.getSortedRules(), options, this.taqwimConfig);
		return process.start();

		// console.timeEnd('test');
	}
}

export default Taqwim;