/**
 * Ensure that default arguments are sorted
 * last in the argument list
 *
 * @see https://www.php-fig.org/psr/psr-12/#45-method-and-function-arguments
 */

import type { RuleContext, RuleDataOptional } from '@taqwim/types';

const process = (context: RuleContext) => {
	const { report, node } = context;
	const { arguments: functionArguments } = node;

	if (functionArguments === undefined || functionArguments.length === 0) {
		return;
	}

	const argumentsLength = functionArguments.length - 1;

	// Check if the default arguments are sorted last
	functionArguments.forEach((argument, argumentIndex) => {
		const { value, loc } = argument;

		// No default value for this argument
		if (value === null) {
			return;
		}

		// Default value is sorted last
		if (argumentIndex >= argumentsLength) {
			return;
		}

		const nextArgument = functionArguments[argumentIndex + 1];
		const { value: nextValue } = nextArgument;

		// Next argument has default value
		if (nextValue !== null) {
			return;
		}

		report({
			message: 'Default parameter must be sorted last in the parameter list',
			position: loc,
		});
	});
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that default paramters are sorted last in the paramters list',
			fixable: false,
			preset: 'psr',
		},
		name: 'method.default-last',
		register: ['method', 'function'],
		process,
	};
};
