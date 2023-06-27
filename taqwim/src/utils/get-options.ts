import type { RuleContext, RulePostContext } from '@taqwim/types';

/**
 * This will check if there is an inline config for the rule
 * and return the value if found
 *
 * @param  {RuleContext|RulePostContext} context    Rule context
 * @param  {number}                      lineNumber Line number to check
 * @return {object}                                 Options for the rule
 */
const getOptions = (
	context: RuleContext | RulePostContext,
	lineNumber: number
) => {
	const { options, inlineConfig, ruleName } = context;

	if (inlineConfig === undefined) {
		return options;
	}

	// Check if any inline config is applied to this line
	const config = inlineConfig.getUpdatedRule(ruleName, {
		start: {
			line: lineNumber,
			column: 0,
			offset: -1,
		},
		end: {
			line: lineNumber,
			column: 0,
			offset: -1,
		},
	});

	if (config === false) {
		return options;
	}

	return {
		...options,
		...config,
	};
};

export {
	getOptions
};