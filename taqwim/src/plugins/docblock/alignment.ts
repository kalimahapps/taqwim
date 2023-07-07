/**
 * Ensure that docblocks asterisks are aligned
 */
import type Fixer from '@taqwim/fixer';
import { getOffsetFromLineAndColumn } from '@taqwim/utils/index.js';
import type { RuleContext, RuleDataOptional } from '@taqwim/types';

const process = (context: RuleContext) => {
	const { report, node, sourceLines } = context;
	const { leadingComments } = node;

	if (leadingComments?.length === undefined) {
		return;
	}

	const docblock = leadingComments?.[0];

	if (!docblock) {
		return;
	}

	const { loc: commentLoc, value: docblockString } = docblock;

	// Make sure it is a docblock
	if (!docblockString.startsWith('/**')) {
		return;
	}

	const docblockLines = docblockString.split(/\r?\n/u);
	const firstLineCol = commentLoc.start.column;

	// Get whitespace from first line to apply to other lines
	const firstLineWhitespace = sourceLines[commentLoc.start.line].match(/^\s*/u);

	// Remove first line
	docblockLines.shift();

	// Loop through each line and compare position to first line
	docblockLines.forEach((line: string, index: number) => {
		const linePosition = line.indexOf('*');
		if (linePosition === firstLineCol + 1) {
			return;
		}

		const lineIndex = index + 1;

		const position = {
			start: {
				line: commentLoc.start.line + lineIndex,
				column: linePosition,
				offset: getOffsetFromLineAndColumn(
					sourceLines,
					commentLoc.start.line + lineIndex,
					0
				),
			},
			end: {
				line: commentLoc.start.line + lineIndex,
				column: linePosition + 1,
				offset: getOffsetFromLineAndColumn(
					sourceLines,
					commentLoc.start.line + lineIndex,
					linePosition
				),
			},
		};

		report({
			message: 'Docblock asterisk is not aligned',
			position,
			fix: (fixer: Fixer) => {
				const space = firstLineWhitespace?.[0] ?? '';
				return fixer.replaceRange(position, `${space} `);
			},
		});
	});
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that docblocks asterisks are aligned',
			preset: 'docblock',
			fixable: true,
		},
		name: 'alignment',
		severity: 'warning',
		register: [
			'function',
			'method',
			'class',
			'interface',
			'trait',
			'constant',
			'propertystatement',
		],
		process,
	};
};
