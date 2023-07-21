/**
 * Ensure that class instantiations are followed by parentheses
 *
 * @see https://www.php-fig.org/psr/psr-12/#4-classes-properties-and-methods
 */

import type Fixer from '@taqwim/fixer';
import type { RuleContext, RuleDataOptional } from '@taqwim/types';

const process = (context: RuleContext) => {
	const { report, node } = context;
	const { what, loc } = node;
	const { source } = loc;

	// Ignore if not a class instantiation or if there are arguments
	if (source === undefined || what?.kind !== 'name' || node.arguments?.length !== 0) {
		return;
	}

	// Check if the next token is a parenthesis
	const hasParentheses = source.match(/\(\s*\)/u);
	if (hasParentheses) {
		return;
	}

	// Class does not have parentheses, report error
	const { name, loc: whatLoc } = what;
	report({
		message: `Class instantiation for "${name}" must be followed by parentheses`,
		position: whatLoc,
		fix: (fixer: Fixer) => {
			return fixer.after(whatLoc, '()');
		},
	});
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that class instantiations are followed by parentheses',
			fixable: true,
			preset: 'psr',
		},
		name: 'new-class-parentheses',
		register: ['new'],
		process,
	};
};
