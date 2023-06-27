/**
 * Check that a PHP file does not end with a blank line
 *
 * @see https://www.php-fig.org/psr/psr-12/#22-files
 */

import type { RuleContext, RuleDataOptional } from '@taqwim/types';
import type Fixer from '@taqwim/fixer';
import { getOffsetFromLineAndColumn } from '@taqwim/utils/index.js';

const getTrailingEmptyLines = (lines: string[]) => {
	const clonedLines = [...lines];
	const emptyLines = [];
	let foundNonEmptyLine = false;

	// Find the last non-empty line in the file
	while (foundNonEmptyLine === false) {
		const line = clonedLines.pop();
		if (line === undefined) {
			break;
		}

		const isBlank = /^(?<whitespace>\s*)$/u.test(line);
		if (isBlank === true) {
			emptyLines.push(clonedLines.length + 1);
			continue;
		}
		foundNonEmptyLine = true;
	}

	return emptyLines;
};

const process = (context: RuleContext): boolean => {
	const { node, report, sourceLines } = context;
	const { source } = node.loc;

	if (source === undefined) {
		return false;
	}

	const emptyLines = getTrailingEmptyLines(sourceLines);
	if (emptyLines.length === 0) {
		return false;
	}

	// emptylines is an array of the line numbers that are empty
	// They are in reverse order, so the last line index
	// is at the start of the array
	const reverseEmptyLines = emptyLines.reverse();

	const startOffset = getOffsetFromLineAndColumn(
		sourceLines,
		<number>reverseEmptyLines[0] - 1,
		0
	);

	const endOffset = getOffsetFromLineAndColumn(
		sourceLines,
		// eslint-disable-next-line space-infix-ops
		<number>reverseEmptyLines.at(-1) - 1,
		0
	);

	const range = {
		start: {
			line: reverseEmptyLines[0],
			column: 0,
			offset: startOffset - 1,
		},
		end: {
			line: <number>reverseEmptyLines.at(-1),
			column: 0,
			offset: endOffset,
		},
	};

	report({
		position: range,
		message: 'A PHP file must not end with blank lines',
		fix(fixer: Fixer) {
			return fixer.removeRange(range);
		},
	});

	return true;
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Check that a PHP file does not end with a blank line',
			fixable: true,
			preset: 'psr',
		},
		name: 'file-end-line',
		register: ['program'],
		process,
	};
};
