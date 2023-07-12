/**
 * Ensure that ternary statements are not nested
 */

import type { AstReturnIf, RuleContext, RuleDataOptional } from '@taqwim/types';

const process = (context: RuleContext) => {
	const { report, node } = context;
	const { loc, traverse } = node as AstReturnIf;

	const { closest } = traverse;
	if (closest('retif') === false) {
		return;
	}

	report({
		message: 'Nested ternary statements are not allowed',
		position: loc,
	});
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that ternary statements are not nested',
			fixable: true,
			preset: 'taqwim',
		},
		name: 'no-nested-ternary',
		register: ['retif'],
		process,
	};
};
