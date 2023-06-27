/**
 * Set the maximum number of arguments a method or function can have.
 */
import type { RuleDataOptional, RuleContext } from '@taqwim/types';
import { RuleOptionError } from '@taqwim/throws/rule-error.js';

const process = (context: RuleContext) => {
	const { report, node, options, ruleName } = context;
	const { arguments: parameters, kind } = node;

	if (options.max < 2) {
		throw new RuleOptionError(
			`The maximum number of parameters must be at least 2. Current value is ${options.max}`,
			ruleName,
			'max'
		);
	}

	if (parameters === undefined || parameters.length <= options.max) {
		return;
	}

	report({
		message: `This ${kind} has ${parameters.length} parameters. Maximum allowed is ${options.max}`,
		position: {
			start: parameters[0].loc.start,
			end: parameters?.at(-1)?.loc.end ?? parameters[0].loc.start,
		},
	});
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that a method or function does not have too many parameters',
			fixable: false,
			preset: 'taqwim',
		},
		defaultOptions: {
			max: {
				description: 'The maximum number of parameters a method or function can have',
				type: 'number',
				default: 5,
			},
		},
		name: 'method.max-parameters',
		register: ['method', 'function'],
		process,
	};
};
