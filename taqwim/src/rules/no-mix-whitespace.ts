/**
 * Ensure that tabs and spaces are not mixed
 * when indenting code. This rule excludes
 * document blocks (docblocks)
 */
import type { RuleContext, RuleDataOptional } from '@taqwim/types';
import { getOffsetFromLineAndColumn } from '@taqwim/utils/index.js';

const process = (context: RuleContext): boolean => {
	const { node, report } = context;

	const { source } = node.loc;
	if (source === undefined) {
		return false;
	}

	const lines = source.split('\n');

	let isDocumentBlock = false;
	lines.forEach((line, index) => {
		// Make sure we don't check inside a document block
		if (line.includes('/**')) {
			isDocumentBlock = true;
			return;
		}

		if (line.includes('*/') && isDocumentBlock) {
			isDocumentBlock = false;
			return;
		}

		// Line is not a document block, check for mixed spaces and tabs
		const hasMixSpace = line.match(/^(?<tabsSpaces>\t+ +)|^(?<spacesTabs> +\t+)/u);
		if (isDocumentBlock) {
			return;
		}

		if (hasMixSpace === null) {
			return;
		}

		const startOffset = getOffsetFromLineAndColumn(lines, index, 0);
		const endOffset = getOffsetFromLineAndColumn(lines, index, hasMixSpace[0].length);

		report({
			message: 'Mixing spaces and tabs is not allowed',
			position: {
				start: {
					line: index,
					column: 0,
					offset: startOffset,
				},
				end: {
					line: index,
					column: hasMixSpace[0].length,
					offset: endOffset,
				},
			},
		});
	});

	return true;
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Disallow mixing spaces and tabs for indentation',
			fixable: false,
			preset: 'taqwim',
		},
		severity: 'warning',
		name: 'no-mixed-spaces-and-tabs',
		register: ['program'],
		process,
	};
};
