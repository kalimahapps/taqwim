/**
 * Ensure that property is not declared with var.
 *
 * @see https://www.php-fig.org/psr/psr-12/#43-properties-and-constants
 */

import type { RuleContext, RuleDataOptional } from '@taqwim/types';

const process = (context: RuleContext) => {
	const { report, node, sourceLines } = context;
	const { loc } = node;
	const { start } = loc;

	const line = sourceLines[start.line];
	const variableIndex = line.indexOf('var');

	if (variableIndex === -1) {
		return;
	}

	report({
		message: 'Property should not be declared with var',
		position: {
			start: {
				...start,
				column: variableIndex,
			},
			end: {
				...start,
				column: variableIndex + 3,
			},
		},
	});
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that property is not declared with var',
			fixable: false,
			preset: 'psr',
		},
		name: 'property-no-var',
		register: ['propertystatement'],

		/*
		* Order is not required for this rule.
		* This is for demonstration and testing purposes.
		*/
		order: 1,
		process,
	};
};