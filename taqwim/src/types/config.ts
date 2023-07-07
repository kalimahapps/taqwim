import type { RuleDataOptional } from '@taqwim/types';

type SingleRuleConfig = {
	[key: string]: string | number | boolean | Record<string, SingleRuleConfig>;
};

type TaqwimConfig = {

	/**
	 * List of rules to override
	 */
	rules?: {
		[key: string]: SingleRuleConfig;
	},

	/**
	 * List of presets to use
	 */
	presets: string[];

	/**
	 * List of plugins to use
	 */
	plugins: (() => RuleDataOptional)[];

	/**
	 * Number of times to run the linter
	 */
	runs: number;

	/**
	 * List of files/directories to ignore.
	 * It is passed to glob module as is.
	 */
	ignore: string[],

	/**
	 * Whether to run the linter in debug mode.
	 */
	debug: boolean;
};

export type {
	TaqwimConfig,
	SingleRuleConfig
};