/**
 * Ensure there is no comment or a statement after a brace on the same line
 *
 * @see https://www.php-fig.org/psr/psr-12/#4-classes-properties-and-methods
 */

import type Fixer from '@taqwim/fixer';
import type { RuleContext, RuleDataOptional } from '@taqwim/types';
import { getOffsetFromLineAndColumn } from '@taqwim/utils/index.js';

const process = (context: RuleContext) => {
	const { node, report, sourceLines } = context;

	const { isAnonymous, loc } = node;

	// Ignore anonymous classes
	if (isAnonymous) {
		return;
	}

	const {
		end: {
			line,
		},
	} = loc;

	const endLineSource = sourceLines[line];

	// Check if there are any comments or statements after the closing brace
	const getTrailingContent = endLineSource.trim().match(/^\}\s*(?<trailingContent>.*)/u);
	const trailingComment = getTrailingContent?.groups?.trailingContent;
	if (!trailingComment) {
		return;
	}

	const braceIndex = endLineSource.indexOf('}');
	const offset = getOffsetFromLineAndColumn(sourceLines, line, braceIndex + 1);

	const range = {
		start: {
			line,
			column: braceIndex + 1,
			offset,
		},
		end: {
			line,
			column: braceIndex + 1,
			offset,
		},
	};

	report({
		message: 'Closing brace must not be followed by any comment or statement on the same line.',
		position: range,
		fix: (fixer: Fixer) => {
			return fixer.before(range, '\n');
		},
	});
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure there is no comment or a statement after a brace on the same line',
			fixable: true,
			preset: 'psr',
		},
		name: 'no-content-after-brace',
		register: ['class', 'interface', 'trait', 'function', 'method'],
		process,
	};
};
