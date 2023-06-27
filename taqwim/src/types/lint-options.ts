type LintOptions = {

	/**
	 * Source code to be processed.
	 * Content will have a higher priority than path if both are provided
	 * Path, however, will be returned in the report
	 */
	source: {
		path?: string;
		content?: string;
	}[];

	/**
	 * Style of the report
	 * - none: No report
	 * - json: JSON report
	 * - default: stdout report
	 */
	reportStyle?: 'none' | 'json' | 'default';

	/**
	 * File to write the report to
	 */
	reportFile?: string;

	/**
	 * Current working directory
	 */
	cwd?: string;

	/**
	 * Comma separated list of rules to be used
	 */
	rule?: string;

	/**
	 * Comma separated list of lines to be processed
	 */
	line?: string;

	/**
	 * Comma separated list of columns to be processed
	 */
	column?: string;

	/**
	 * Whether to fix the errors or not
	 */
	fix?: boolean;

	/**
	 * Config file path. Relative to supplied CWD, or current CWD.
	 * If not provided, will first look for .taqwim.json
	 * then taqwim.js
	 */
	configFile?: string;
};

export type {
	LintOptions
};