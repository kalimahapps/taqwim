/**
 * Ensure consistent blank lines between lines of code
 * This rule will ensure:
 * - There is no more than a single blank line between lines of code
 * - There is a single blank line before a comment except:
 * -- It is preceded by another comment
 * -- It is the first line of the file, method, function, class, interface, enum, etc.
 * - There is no blank line after a comment
 * - There is no block padding (blank lines at the beginning or end of a block)
 */
/* eslint complexity: ["warn", 10] */

import type {
	RuleDataOptional,
	RuleContext,
	CallbacksMap,
	AllAstTypes,
	Loc,
	RulePostContext,
	RangeMatchType
} from '@taqwim/types';
import type Fixer from '@taqwim/fixer';
import {
	findAhead,
	findAheadRegex,
	findAheadRegexReverse,
	getOffsetFromLineAndColumn
} from '@taqwim/utils';
import { WithCallMapping } from '@taqwim/decorators';

class BlankLines {
	/**
	 * The rule context
	 */
	context = {} as RuleContext | RulePostContext;

	/**
	 * The current node
	 */
	node = {} as AllAstTypes;

	/**
	 * Hold the brace position for control structures
	 * so we can use it to check if the comment is the first line
	 * of the object
	 */
	bracePosition: RangeMatchType | false = false;

	/**
	 * The alternative closing braces for control structures
	 */
	altClosingBrace = ['endif', 'endfor', 'endforeach', 'endwhile', 'endswitch'];

	/**
	 * The callbacks map to map the callback to the node type
	 */
	callbacksMap: CallbacksMap = {
		commentCallback: ['commentline', 'commentblock'],
		objectMethodCallback: ['class', 'interface', 'trait', 'enum', 'method', 'function'],
		controlStructureCallback: ['for', 'foreach', 'while', 'do', 'if', 'switch'],
	};

	/**
	 * Handle control structures (for, foreach, while, do, if, switch)
	 */
	controlStructureCallback() {
		const { report } = this.context;
		const leadingPaddingPosition = this.getBlockLeadingPadding();
		if (leadingPaddingPosition !== false) {
			report({
				message: 'Block should not be padded by blank lines',
				position: leadingPaddingPosition,
				fix: (fixer: Fixer) => {
					return fixer.removeRange(leadingPaddingPosition);
				},
			});
		}

		const trailingPaddingPosition = this.getBlockTrailingPadding();
		if (trailingPaddingPosition !== false) {
			report({
				message: 'Block should not be padded by blank lines',
				position: trailingPaddingPosition,
				fix: (fixer: Fixer) => {
					return fixer.removeRange(trailingPaddingPosition);
				},
			});
		}
	}

	/**
	 * Get the position of the block leading blank lines
	 *
	 * @return {false|Loc} The position of the block leading padding or false if not found
	 */
	getBlockLeadingPadding(): false | Loc {
		const { sourceLines } = this.context;
		const { loc } = this.node;

		// Find brace position
		this.bracePosition = findAheadRegex(
			sourceLines,
			loc,
			/(?<controlStart>\{|:)/u
		);

		if (this.bracePosition === false || this.bracePosition.groups === undefined) {
			return false;
		}

		const {
			start: { line },
		} = this.bracePosition;
		const sourceLine = sourceLines[line].trim();

		// Is the brace last character on the line?
		if (sourceLine.endsWith('{') === false && sourceLine.endsWith(':') === false) {
			return false;
		}

		// find the next non blank line
		const nextBlankLines = this.findNonBlankLine(line + 1);

		// Handle only single blank lines, multiple blank lines
		// will be handled in the post method
		if (nextBlankLines.length !== 1) {
			return false;
		}

		const position = {
			start: {
				line: line + 1,
				column: 0,
				offset: getOffsetFromLineAndColumn(
					sourceLines,
					line + 1,
					0
				),
			},
			end: {
				line: line + 2,
				column: 0,
				offset: getOffsetFromLineAndColumn(
					sourceLines,
					line + 2,
					0
				),
			},
		};

		return position;
	}

	/**
	 * Get the position of the block trailing blank line
	 *
	 * @return {false|Loc} The position of the block trailing padding or false if not found
	 */
	getBlockTrailingPadding(): false | Loc {
		const { sourceLines } = this.context;
		const { loc } = this.node;

		// Find brace position
		const regex = new RegExp(`\\}|${this.altClosingBrace.join('|')}`, 'u');
		const bracePosition = findAheadRegexReverse(
			sourceLines,
			loc,
			regex
		);

		if (bracePosition === false) {
			return false;
		}

		const { line } = bracePosition.start;
		const sourceLine = sourceLines[line].trim();

		// Is the brace the only character on the line?
		if (
			sourceLine !== '}' &&
			this.altClosingBrace.includes(`${sourceLine.toLowerCase()};`) !== false
		) {
			return false;
		}

		// find the next non blank line
		const previousBlankLines = this.findNonBlankLine(line, 'prev');

		// Handle only single blank lines, multiple blank lines
		// will be handled in the post method
		if (previousBlankLines.length !== 1) {
			return false;
		}

		const position = {
			start: {
				line: line - 1,
				column: 0,
				offset: getOffsetFromLineAndColumn(
					sourceLines,
					line - 1,
					0
				),
			},
			end: {
				line,
				column: 0,
				offset: getOffsetFromLineAndColumn(
					sourceLines,
					line,
					0
				),
			},
		};

		return position;
	}

	/**
	 * Handle objects (class, interface, enum, etc.) and methods
	 */
	objectMethodCallback() {
		const { report } = this.context;
		const leadingPaddingPosition = this.getBlockLeadingPadding();
		if (leadingPaddingPosition !== false) {
			report({
				message: 'Block should not be padded by blank lines',
				position: leadingPaddingPosition,
				fix: (fixer: Fixer) => {
					return fixer.removeRange(leadingPaddingPosition);
				},
			});
		}

		const trailingPaddingPosition = this.getBlockTrailingPadding();
		if (trailingPaddingPosition !== false) {
			report({
				message: 'Block should not be padded by blank lines',
				position: trailingPaddingPosition,
				fix: (fixer: Fixer) => {
					return fixer.removeRange(trailingPaddingPosition);
				},
			});
		}
	}

	/**
	 * Check if the comment is nested inside a control structure
	 *
	 * @return {boolean} True if the comment is nested inside a control structure
	 */
	isNested(): boolean {
		const { sourceLines } = this.context;
		const { traverse, loc } = this.node;
		const { start } = loc;

		const parent = traverse.parent();
		if (parent === false) {
			return false;
		}

		const lookFor = ['class', 'interface', 'trait', 'enum', 'method', 'function', 'for', 'foreach', 'while', 'do', 'if', 'switch', 'case'];
		const closest = parent.traverse.closest(lookFor);
		if (closest === false) {
			return false;
		}

		const isShortForm = closest.shortForm === true;
		const isCase = closest.kind === 'case';

		const controlBrace = isShortForm || isCase === true ? ':' : '{';
		const closestParentBracePosition = findAhead(sourceLines, closest.loc, controlBrace);

		if (closestParentBracePosition === false) {
			return false;
		}

		// Does the comment start after the parent brace?
		if (closestParentBracePosition.line + 1 < start.line) {
			return false;
		}

		return true;
	}

	/**
	 * Handle blank lines before comments
	 */
	checkBlankLineBeforeComment() {
		const { report, sourceLines } = this.context;
		const { loc, traverse, path } = this.node;
		const { start, end } = loc;

		// Is it the first line of the file?
		if (start.line === 1) {
			return;
		}

		// is a trailing comment?
		const lastPath = path.at(-1);
		if (lastPath && lastPath.startsWith('trailingComments')) {
			return;
		}

		// Is it the first line of an object or control
		// structure (class, interface, method, function, if, for, etc.)?
		if (this.bracePosition !== false && this.bracePosition.start.line + 1 === start.line) {
			return;
		}

		// Is it preceded by another comment?
		const previousSibling = traverse.prevSibling();
		if (previousSibling && ['commentline', 'commentblock'].includes(previousSibling.kind)) {
			return;
		}

		// Is it nested inside a control structure?
		const isNested = this.isNested();
		if (isNested === true) {
			return;
		}

		// Make sure there is a blank line before a comment
		const previousLine = sourceLines[start.line - 1];
		if (previousLine.trim().length === 0) {
			return;
		}

		const position = {
			start,
			end,
		};

		report({
			message: 'There should be a blank line before a comment',
			position,
			fix: (fixer: Fixer) => {
				const replacePosition = {
					start: {
						line: start.line,
						column: 0,
						offset: getOffsetFromLineAndColumn(
							sourceLines,
							start.line,
							0
						),
					},
					end: {
						line: start.line - 1,
						column: 0,
						offset: getOffsetFromLineAndColumn(
							sourceLines,
							start.line - 1,
							0
						),
					},
				};
				return fixer.before(replacePosition, '\n');
			},
		});
	}

	/**
	 * Handle blank lines after comments
	 */
	checkBlankLineAfterComment() {
		const { report, sourceLines } = this.context;
		const { loc, kind, path } = this.node;
		const { start, end } = loc;

		// is a trailing comment?
		const lastPath = path.at(-1);
		if (lastPath && lastPath.startsWith('trailingComments')) {
			return;
		}

		/**
		 * commentline end position is on the second line of the comment
		 * with column 0. Thus we can not use the end position to get the
		 * next line. We use the start position instead.
		 */
		const nodeLoc = kind === 'commentline' ? start : end;

		// Proceed only if there is a single blank line after the comment,
		// multiple blank lines will be handled in the post method
		const nextBlankLines = this.findNonBlankLine(nodeLoc.line + 1);
		if (nextBlankLines.length > 1) {
			return;
		}

		// Make sure there is no blank line after a comment
		const nextLine = sourceLines[nodeLoc.line + 1];
		if (nextLine.trim().length === 0) {
			const position = {
				start: {
					line: nodeLoc.line + 1,
					column: 0,
					offset: getOffsetFromLineAndColumn(
						sourceLines,
						nodeLoc.line + 1,
						0
					),
				},
				end: {
					line: nodeLoc.line + 2,
					column: 0,
					offset: getOffsetFromLineAndColumn(
						sourceLines,
						nodeLoc.line + 2,
						0
					),
				},
			};

			report({
				message: 'There should be no blank line after a comment',
				position,
				fix: (fixer: Fixer) => {
					return fixer.removeRange(position);
				},
			});
		}
	}

	/**
	 * Handle comments (commentline, commentblock)
	 */
	commentCallback() {
		this.checkBlankLineBeforeComment();

		this.checkBlankLineAfterComment();
	}

	/**
	 * Loop through the source lines and find the next non blank line
	 *
	 * @param  {number}   startFrom The line number to start from
	 * @param  {string}   direction The direction to search in
	 * @return {number[]}           The line numbers of the blank lines
	 */
	findNonBlankLine(startFrom: number, direction: 'next' | 'prev' = 'next'): number[] {
		const { sourceLines } = this.context;
		const processedSourceLines = direction === 'next' ?
			sourceLines.slice(startFrom) :
			sourceLines.slice(0, startFrom).reverse();

		const totalBlankLines = [];

		for (const [lineIndex, line] of processedSourceLines.entries()) {
			const trimmedLine = line.trim();

			if (trimmedLine.length === 0) {
				const index = direction === 'next' ?
					lineIndex + startFrom :
					startFrom - lineIndex - 1;

				totalBlankLines.push(index);
			}

			if (trimmedLine.length > 0) {
				break;
			}
		}

		return direction === 'next' ? totalBlankLines : totalBlankLines.reverse();
	}

	@WithCallMapping
	process(context: RuleContext) {
		this.context = context;
		const { node } = this.context;
		this.node = node;
	}

	/**
	 * Handle multiple blank lines
	 *
	 * @param {RuleContext} context The rule context
	 */
	post(context: RulePostContext) {
		this.context = context;
		const { report, sourceLines } = this.context;

		for (let index = 0; index < sourceLines.length; index++) {
			const blankLines = this.findNonBlankLine(index);
			if (blankLines.length < 2) {
				continue;
			}

			// Jump to the next line after the blank lines
			index = index + blankLines.length;

			const position = {
				start: {
					line: blankLines[0],
					column: 0,
					offset: getOffsetFromLineAndColumn(
						sourceLines,
						blankLines[0],
						0
					),
				},
				end: {
					line: index,
					column: 0,
					offset: getOffsetFromLineAndColumn(
						sourceLines,
						index,
						0
					),
				},
			};

			report({
				message: `There should not be more than a single blank line. Found ${blankLines.length} blank lines.`,
				position,
				fix: (fixer: Fixer) => {
					return fixer.replaceRange(position, '\n');
				},
			});
		}
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Enforce consistent linebreak spaces',
			fixable: true,
			preset: 'taqwim',
		},
		name: 'blank-lines',
		register: [
			'commentline',
			'commentblock',
			'class',
			'interface',
			'trait',
			'enum',
			'method',
			'function',
			'for',
			'foreach',
			'while',
			'do',
			'if',
			'switch',
		],
		severity: 'warning',
		bindClass: BlankLines,
	};
};
