/**
 * Break parameter into multiple lines if the line exceeds the maximum length
 */
import type { RuleContext, RuleDataOptional } from '@taqwim/types';
import { RuleOptionError } from '@taqwim/throws/rule-error.js';

const process = (context: RuleContext) => {
	const { report, node, options, ruleName } = context;
	const { arguments: parameters } = node;

	if (options.max < 2) {
		throw new RuleOptionError(
			`The maximum number of parameter must be at least 2. Current value is ${options.max}`,
			ruleName,
			'max'
		);
	}

	if (parameters === undefined || parameters.length <= options.max) {
		return;
	}

	// Check that parameter are not already broken into multiple lines
	const firstParameter = parameters[0];
	const lastParameter = parameters.at(-1);
	const firstParameterLine = firstParameter.loc.start.line;
	const lastParameterLine = lastParameter?.loc.end.line;
	if (firstParameterLine !== lastParameterLine) {
		return;
	}

	report({
		message: `Break parameters into multiple lines because they exceeds the maximum length of ${options.max} parameters.`,
		position: {
			start: parameters[0].loc.start,
			end: parameters?.at(-1)?.loc.end ?? parameters[0].loc.start,
		},
	});
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Break parameters into multiple lines if the line exceeds the maximum length',
			fixable: false,
			preset: 'taqwim',
		},
		defaultOptions: {
			max: {
				type: 'number',
				default: 5,
				description: 'The maximum number of parameter before breaking them into multiple lines',
			},
		},
		name: 'method.break-parameters',
		register: ['method', 'function'],
		process,
	};
};
