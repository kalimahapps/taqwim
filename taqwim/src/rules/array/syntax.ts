/**
 * Ensure that array syntax is consistent.
 */
import type { RuleDataOptional, RuleContext } from '@taqwim/types';

const process = (context: RuleContext): boolean => {
	const { node, report, options } = context;
	const { loc, shortForm } = node;
	if (loc.source === undefined) {
		return false;
	}
	const { type } = options;
	const useLongType = type === 'long';

	// Convert to long syntax
	if (useLongType === true && shortForm === true) {
		const longSyntax = loc.source.replace(/^\[/u, 'array(').replace(/\]$/u, ')');

		report({
			message: 'Use long syntax for arrays',
			position: loc,
			fix(fixer) {
				return fixer.replaceRange(loc, longSyntax);
			},
		});
	}

	// Convert to short syntax
	if (useLongType === false && shortForm === false) {
		const shortSyntax = loc.source.replace(/^array\(/u, '[').replace(/\)$/u, ']');

		report({
			message: 'Use short syntax for arrays',
			position: loc,
			fix(fixer) {
				return fixer.replaceRange(loc, shortSyntax);
			},
		});
	}

	return true;
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that array syntax is consistent',
			fixable: true,
			preset: 'taqwim',
		},
		severity: 'warning',
		name: 'array.syntax',
		defaultOptions: {
			type: {
				type: 'string',
				default: 'long',
				description: 'Set the type of array syntax to be used. Defaults to "long".',
				oneOf: [
					{
						type: 'string',
						const: 'long',
						description: 'Use long syntax for arrays',
					},
					{
						type: 'string',
						const: 'short',
						description: 'Use short syntax for arrays',
					},
				],
			},
		},
		register: ['array'],
		process,
	};
};
