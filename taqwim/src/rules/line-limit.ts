/**
 * Ensure that lines do not exceed a given limit
 *
 * @see https://www.php-fig.org/psr/psr-12/#23-lines
 */
import type { RuleDataOptional, RuleContext, AstComment } from '@taqwim/types';
import { getOffsetFromLineAndColumn, getOptions } from '@taqwim/utils/index.js';

/**
 * Check if a line is inside a comment
 *
 * @param  {AstComment[]} comments  Array of comments
 * @param  {number}       lineIndex Line index
 * @return {boolean}                True if line is inside a comment
 */
const isInsideComment = (comments: AstComment[], lineIndex: number): boolean => {
	return comments.some((comment: AstComment) => {
		return lineIndex > comment.loc.start.line && lineIndex < comment.loc.end.line;
	});
};

const process = (context: RuleContext): boolean => {
	const { node, report, sourceLines } = context;
	const { source } = node.loc;
	if (source === undefined) {
		return false;
	}

	const { comments } = node;
	/* eslint complexity: ["warn", 7] */
	sourceLines.forEach((line, lineIndex) => {
		let { code, comment } = getOptions(context, lineIndex);

		// Set max comment length to the value of code, if not provided
		if (comment === undefined) {
			comment = code;
		}

		const lineLength = line.length;
		let maxLength: number = code;

		// Set max comment length, if this is a comment line
		if (comments && (comments.length > 0 && code !== comment)) {
			const isCommentLine = isInsideComment(comments, lineIndex);
			maxLength = isCommentLine ? comment : code;
		}

		// Line length is less than or equal to the max length, skip
		if (lineLength <= maxLength) {
			return;
		}

		const range = {
			start: {
				line: lineIndex,
				column: lineLength - 5,
				offset: getOffsetFromLineAndColumn(sourceLines, lineIndex, lineLength - 5),
			},
			end: {
				line: lineIndex,
				column: lineLength,
				offset: getOffsetFromLineAndColumn(sourceLines, lineIndex, lineLength),
			},
		};

		report({
			message: `Line length must not exceed ${maxLength} characters. Current length is ${lineLength}`,
			position: range,
		});
	});

	return true;
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that lines do not exceed a given limit',
			fixable: false,
			preset: 'psr',
		},
		defaultOptions: {
			code: {
				type: 'number',
				default: 80,
				description: 'Maximum length of a code line',
			},
			comment: {
				type: 'number',
				description: 'Maximum length of a comment line. Defaults to the value of code',
			},
		},
		severity: 'warning',
		name: 'line-limit',
		register: ['program'],
		process,
	};
};
