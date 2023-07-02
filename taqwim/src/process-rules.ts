import * as rules from '@taqwim/rules';
import type {
	RuleDataStrict,
	RuleOptionDefaultValue,
	RuleDefaultOptions,
	RuleDataOptional,
	RuleSeverityLevels,
	TaqwimConfig,
	LintOptions
} from '@taqwim/types/';

class ProcessRules {
	/**
	 * List of rules files
	 */
	rulesFiles: string[] = [];

	/**
	 * List of rules
	 */
	rules: RuleDataStrict[] = [];

	/**
	 * Default and custom configurations
	 */
	taqwimConfig: TaqwimConfig;

	/**
	 * Rules options
	 */
	options: Record<string, any> = {};

	/**
	 * Constructor function
	 *
	 * @param {TaqwimConfig} config  Full configuration (custom and default)
	 * @param {LintOptions}  options Options
	 */
	constructor(config: TaqwimConfig, options: LintOptions) {
		this.taqwimConfig = config;
		this.options = options;
	}

	/**
	 * Load rule files and register them.
	 * Filter rules if the rules argument is provided
	 */
	registerRules() {
		let filterBy = this.options.rule?.split(',') ?? [];
		filterBy = filterBy.map((rule: string) => {
			return rule.toLowerCase();
		});

		for (const rule of Object.values(rules as Record<string, () => RuleDataOptional>)) {
			const ruleResult = rule();
			const { name, meta } = ruleResult;
			const { preset } = meta;

			const ruleName = `${preset.toLowerCase()}/${name.toLowerCase()}`;

			if (filterBy.length === 0) {
				this.addRule(ruleResult);
				continue;
			}

			if (filterBy.includes(ruleName)) {
				this.addRule(ruleResult);
			}
		}
	}

	/**
	 * Merge custom options with the default options
	 *
	 * @param  {string}                  name                 Rule name
	 * @param  {RuleDefaultOptions}      defaultOptionsSchema Default options object
	 * @return {Record<string, unknown>}                      Merged options
	 */
	getMergedOptions = (
		name: string,
		defaultOptionsSchema: Record<string, RuleDefaultOptions> | undefined
	): Record<string, RuleOptionDefaultValue> => {
		const customOptions = this.getCustomRuleOptions(name);

		// If there are not default options (like max, type, etc),
		// return the custom options
		if (!defaultOptionsSchema) {
			return customOptions;
		}

		// Filter default options schema to get only the default options
		const defaultOptions = Object.entries(defaultOptionsSchema)
			.reduce((accumulator, [key, data]) => {
				if (data?.default === undefined || data?.default === null) {
					return accumulator;
				}

				accumulator[key] = data.default;
				return accumulator;
			},
				{} as Record<string, RuleOptionDefaultValue>);

		return {
			...defaultOptions,
			...customOptions,
		};
	};

	/**
	 * Get the custom options for a rule
	 *
	 * @param  {string}                                 ruleName Rule name
	 * @return {Record<string, RuleOptionDefaultValue>}          Custom options
	 */
	getCustomRuleOptions(ruleName: string): Record<string, RuleOptionDefaultValue> {
		const { rules } = this.taqwimConfig;
		if (rules === undefined) {
			return {};
		}

		const ruleOptions = rules[ruleName];
		if (ruleOptions === undefined) {
			return {};
		}

		if (typeof ruleOptions === 'object') {
			return ruleOptions;
		}

		return {
			severity: ruleOptions,
		};
	}

	/**
	 * Add a rule to the list of rules
	 *
	 * @param {RuleDataOptional} ruleData The rule data
	 */
	/*eslint complexity: ["warn", 10]*/
	addRule(ruleData: RuleDataOptional) {
		const {
			register,
			process,
			name,
			defaultOptions,
			severity: ruleDataSeverity,
			meta,
			pre,
			post,
			bindClass,
			order = 0,
		} = ruleData;
		const { preset } = meta;

		if (
			register === undefined
			|| !this.taqwimConfig?.presets?.includes(preset.toLowerCase())
		) {
			return;
		}

		const ruleName = `${preset}/${name}`;
		const options = this.getMergedOptions(ruleName, defaultOptions);

		const { severity, ...remainingOptions } = options;

		if (severity === 'off') {
			return;
		}

		let classInstance;
		if (bindClass) {
			classInstance = new bindClass();
		}

		const newRuleData: RuleDataStrict = {
			severity: <RuleSeverityLevels>severity ?? ruleDataSeverity ?? 'warning',
			register,
			options: remainingOptions,
			name: ruleName,
			order,
			meta,
			process: classInstance?.process ? classInstance.process.bind(classInstance) : process,
			pre: classInstance?.pre ? classInstance.pre.bind(classInstance) : pre,
			post: classInstance?.post ? classInstance.post.bind(classInstance) : post,
		};
		this.rules.push(newRuleData);
	}

	/**
	 * Get all the rules sorted by order
	 *
	 * @return {Record<string, RuleDataStrict>} Sorted rules
	 */
	getSortedRules(): Record<string, RuleDataStrict> {
		this.rules.sort((a: RuleDataStrict, b: RuleDataStrict) => {
			if (a.order < b.order) {
				return -1;
			}

			if (a.order > b.order) {
				return 1;
			}

			return 0;
		});

		// Build object with the sorted rules
		const sortedRules: Record<string, RuleDataStrict> = {};
		this.rules.forEach((rule: RuleDataStrict) => {
			sortedRules[rule.name] = rule;
		});

		return sortedRules;
	}
}

export default ProcessRules;