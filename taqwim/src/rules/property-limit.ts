/**
 * Ensure that only one property declared per statement.
 *
 * @see https://www.php-fig.org/psr/psr-12/#43-properties-and-constants
 */

import type { RuleContext, RuleDataOptional } from '@taqwim/types';

const process = (context: RuleContext) => {
	const { report, node } = context;
	const { properties, loc } = node;

	if (!properties || properties.length === 1) {
		return;
	}

	report({
		message: `Only one property should be declared per statement. Found ${properties.length} properties.`,
		position: loc,
	});
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that only one property declared per statement',
			fixable: false,
			preset: 'psr',
		},
		name: 'property-limit',
		register: ['propertystatement'],
		process,
	};
};
