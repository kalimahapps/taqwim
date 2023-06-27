/**
 * Check that PHP files do not end with a closing tag
 */
import type { RuleContext, RuleDataOptional } from '@taqwim/types';
import type Fixer from '@taqwim/fixer';
import { getOffsetFromLineAndColumn } from '@taqwim/utils/index.js';

/**
 * Get the last non-empty line in the file by
 * looping through the lines in reverse order.
 * Finding last line is guaranteed because the source
 * is being trimmed and checked for ?> at the end.
 *
 * @param  {string[]} lines Array of lines in the file
 * @return {object}         Object containing the line and line index.
 */
const getLastLine = (lines: string[]) => {
	let foundNonEmptyLine = false;

	let lastLine = '';

	// Find the last non-empty line in the file
	while (foundNonEmptyLine === false) {
		const line = lines.pop();
		if (line === undefined) {
			break;
		}

		const isBlank = /^(?<whitespace>\s*)$/u.test(line);
		if (isBlank !== true) {
			lastLine = line;
			foundNonEmptyLine = true;
		}
	}

	return {
		line: lastLine,
		lineIndex: lines.length,
	};
};

/**
 * Process the rule
 *
 * @param {RuleContext} context Rule context.
 */
const process = (context: RuleContext) => {
	const { node, report, sourceLines } = context;

	const { source } = node.loc;
	if (!source) {
		return;
	}

	// Trim and check for ?> at the end of the file
	const trimmedSource = source.trim();
	if (trimmedSource.endsWith('?>') !== true) {
		return;
	}

	const { line, lineIndex } = getLastLine(sourceLines);

	// Find the last ?> in the file
	const closeTagIndex = line.indexOf('?>');
	const offset = getOffsetFromLineAndColumn(sourceLines, lineIndex, closeTagIndex);

	const range = {
		start: {
			line: lineIndex,
			column: closeTagIndex,
			offset,
		},
		end: {
			line: lineIndex,
			column: closeTagIndex + 2,
			offset: offset + 2,
		},
	};

	report({
		message: 'PHP files should not end with ?>',
		position: range,
		fix(fixer: Fixer) {
			return fixer.replaceRange(range, '');
		},
	});
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that PHP files do not end with a closing tag',
			fixable: true,
			preset: 'psr',
		},
		name: 'file-closing-tag',
		register: ['program'],
		process,
	};
};
