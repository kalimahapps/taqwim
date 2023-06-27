/**
 * Ensure that methods visibility is set
 *
 * @see https://www.php-fig.org/psr/psr-12/#44-methods-and-functions
 */
import type { RuleContext, RuleDataOptional } from '@taqwim/types';

const FUNCTION_KEYWORD_LENGTH = 8;

const process = (context: RuleContext) => {
	const { report, node } = context;
	const { visibility, loc, name } = node;

	if (visibility !== '') {
		return;
	}

	report({
		message: `Visibility must be declared on method \`${name?.name}\``,
		position: {
			start: {
				line: loc.start.line,
				column: loc.start.column,
				offset: loc.start.offset,
			},
			end: {
				line: loc.start.line,
				column: loc.start.column + FUNCTION_KEYWORD_LENGTH,
				offset: loc.start.offset + FUNCTION_KEYWORD_LENGTH,
			},
		},
	});
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that methods visibility is set',
			fixable: false,
			preset: 'psr',
		},
		name: 'method.visibility',
		register: ['method'],
		process,
	};
};
