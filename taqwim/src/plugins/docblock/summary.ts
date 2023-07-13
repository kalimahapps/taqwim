/**
 * Ensure that docblocks have a short summary and that is properly formatted
 */
import type Fixer from '@taqwim/fixer';
import type { RuleContext, RuleDataOptional } from '@taqwim/types';

import Parser from '@taqwim/docblock-parser';

const process = (context: RuleContext) => {
	const { report, node } = context;
	const { leadingComments, name, kind } = node;

	const docblock = leadingComments?.[0];
	if (!docblock) {
		return;
	}

	const { loc: commentLoc, value: docblockString } = docblock;

	// Make sure the comment is a docblock
	if (!docblockString.trim().startsWith('/**')) {
		return;
	}

	const {
		summary: {
			value: summaryValue,
			position: summaryPosition,
		},
	} = new Parser().parse(docblockString);

	const nodeKind = kind;
	const identifierName = name?.name;

	if (summaryValue.length === 0) {
		report({
			message: `Missing short description in docblock for "${identifierName}" ${nodeKind} declaration`,
			position: {
				start: commentLoc.start,
				end: {
					...commentLoc.start,
					column: commentLoc.start.column + 3,
				},
			},
		});
	}

	// Check if short description does not end with a period
	if (summaryValue.at(-1) === '.' || summaryPosition === undefined) {
		return;
	}

	const position = {
		start: {
			line: commentLoc.start.line + summaryPosition.start.line,
			column: summaryPosition.start.column,
			offset: commentLoc.start.offset + summaryPosition.start.offset,
		},
		end: {
			line: commentLoc.start.line + summaryPosition.end.line,
			column: summaryPosition.end.column,
			offset: commentLoc.start.offset + summaryPosition.end.offset,
		},
	};

	report({
		message: `Short description in docblock for "${identifierName}" ${nodeKind} declaration does not end with a period`,
		position,
		fix: (fixer: Fixer) => {
			return fixer.after(position, '.');
		},
	});
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that docblocks have a short summary and that is properly formatted',
			preset: 'docblock',
			fixable: false,
		},
		name: 'summary',
		register: ['function', 'method', 'class', 'interface', 'trait'],
		process,
	};
};
