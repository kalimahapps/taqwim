/**
 * Ensure consistent brace style for blocks
 */
/* eslint complexity: ["warn", 11],max-lines-per-function: ["warn", 120] */
import { getOffsetFromLineAndColumn, findAhead, findAheadRegexReverse } from '@taqwim/utils/index';
import type {
	AllAstTypes,
	AstBlock,
	AstCatch,
	AstClass,
	AstDo,
	AstFor,
	AstForeach,
	AstIf,
	AstInterface,
	AstMatch,
	AstSwitch,
	AstTrait,
	AstTry,
	AstWhile,
	Loc,
	RuleContext,
	CallbacksMap,
	RuleDataOptional
} from '@taqwim/types';
import type Fixer from '@taqwim/fixer';
import { WithCallMapping } from '@taqwim/decorators';

class BraceStyle {
	context = {} as RuleContext;
	node = {} as AllAstTypes;
	braceStyle = '1tbs';

	callbacksMap: CallbacksMap = {
		objectMethodCallback: ['class', 'interface', 'trait', 'enum', 'method', 'function'],
		ifCallback: ['if'],
		tryCatchCallback: ['try'],
		bodyChildrenCallback: ['foreach', 'for', 'while', 'switch', 'case', 'closure'],
		doWhileCallback: ['do'],
		matchCallback: ['match'],
	};

	/**
	 * Make sure that do while statements have consistent brace style
	 *
	 * @return {boolean} True if the callback was processed, false otherwise
	 */
	doWhileCallback(): boolean {
		const { node, context } = this;
		const { sourceLines, sourceCode, report } = context;
		const { body } = node as AstDo;
		const { loc: bodyLoc } = body;

		this.reportAndFixOpeningBrace();

		const searchRange = {
			start: bodyLoc.end,
			end: node.loc.end,
		};

		const findParenthesis = findAhead(sourceLines, searchRange, '(');
		if (findParenthesis === false) {
			return false;
		}

		const {
			end: {
				line: bodyEndLine,
				column: bodyEndColumn,
				offset: bodyEndOffset,
			},
		} = bodyLoc;

		const { line, column, offset } = findParenthesis;
		if (line === bodyEndLine) {
			return false;
		}

		const position = {
			start: {
				line: bodyEndLine,
				column: bodyEndColumn - 1,
				offset: bodyEndOffset - 1,
			},
			end: {
				line,
				column: column + 1,
				offset: offset + 1,
			},
		};

		report({
			message: 'Closing brace, control structure and opening parenthesis must be on the same line',
			position,
			fix(fixer: Fixer) {
				/*
				* Extract text as per the position offset.
				* This will include the closing brace of the previous node,
				* the control structure, and the opening parenthesis of the test expression.
				*/
				let text = sourceCode.slice(position.start.offset, position.end.offset);

				// Make sure there is one space before the opening parenthesis
				text = text.replace(/\s*\(/u, ' (');

				// Make sure there is one space after the closing brace
				text = text.replace(/\}\s*/u, '} ');

				// Remove all newlines and replace with a single space
				text = text.replaceAll('\n', ' ');

				return fixer.replaceRange(position, text);
			},
		});

		return true;
	}

	/**
	 * Ensure consistent brace style for classes,
	 * interfaces, traits, functions and methods
	 *
	 * @return {boolean} True if a report was made, false otherwise
	 */
	objectMethodCallback(): boolean {
		const { node, braceStyle, context } = this;
		const { sourceLines, report } = context;
		const { loc, isAnonymous } = node as AstClass & AstInterface & AstTrait;

		if (isAnonymous) {
			return false;
		}

		const {
			start: {
				line: nodeStartLine,
			},
		} = loc;

		/* Object (classes, traits and interfaces) do not have a body,
		* so we need to find the opening brace position manually
		* We can include functions and methods as well, to lower this method
		* complexity, even though they have a body.
		*/
		const data = findAhead(sourceLines, loc, '{');
		if (data === false) {
			return false;
		}

		const {
			line: braceStartLine,
			column: braceColumnIndex,
			offset: braceOffset,
		} = data;

		const sameLine = nodeStartLine === braceStartLine;
		const shouldTrueBrace = braceStyle === '1tbs' && !sameLine;
		const shouldPsrBrace = braceStyle === 'psr' && sameLine;

		if (!shouldTrueBrace && !shouldPsrBrace) {
			return false;
		}

		const position = {
			start: {
				line: braceStartLine,
				column: braceColumnIndex,
				offset: braceOffset,
			},
			end: {
				line: braceStartLine,
				column: braceColumnIndex + 1,
				offset: braceOffset + 1,
			},
		};

		let message = 'Opening brace must not be on a line by itself';

		if (shouldPsrBrace) {
			message = 'Opening brace must be on a line by itself';
		}

		report({
			message,
			position,
			fix(fixer: Fixer) {
				const startLineContent = sourceLines[nodeStartLine];
				const lineEndOffset =
					getOffsetFromLineAndColumn(sourceLines, nodeStartLine, startLineContent.length);

				const replacePosition = {
					start: {
						...position.start,
						offset: shouldPsrBrace ? braceOffset : lineEndOffset,
					},
					end: {
						...position.end,
					},
				};

				const replacedWith = shouldPsrBrace ? '\n{' : ' {';
				return fixer.replaceRange(replacePosition, replacedWith);
			},
		});

		// Check closing brace position, it should be on a separate line
		// for both 1tbs and psr
		this.reportAndFixClosingBrace(node, false);

		return true;
	}

	/**
	 * Process nodes that have a body property (foreach, for, while ... etc)
	 */
	bodyChildrenCallback() {
		const { node } = this;
		const { kind, shortForm } = node as AstFor & AstForeach & AstWhile & AstSwitch;

		const loopsKind = ['foreach', 'for', 'while', 'switch'];
		if (loopsKind.includes(kind) && shortForm === true) {
			return;
		}

		this.reportAndFixOpeningBrace();
		this.reportAndFixClosingBrace(node, false);
	}

	/**
	 * Handle match statements
	 *
	 * @example
	 * match ($food)
	 * { 'apple' => 'This food is an apple' };
	 * 
	 * @return {boolean} True if the callback was processed, false otherwise
	 */
	matchCallback(): boolean {
		const { arms } = this.node as AstMatch;

		// Get the start location of the first arm
		// and the end location of the last arm to
		// provide it as body location
		if (arms.length === 0) {
			return false;
		}

		const [firstArm] = arms;
		const lastArm = arms.at(-1);

		if (lastArm === undefined) {
			return false;
		}

		const bodyLoc = {
			start: firstArm.loc.start,
			end: lastArm.loc.end,
		};

		this.reportAndFixOpeningBrace(bodyLoc);
		this.reportAndFixClosingBrace(this.node, false);

		return true;
	}

	/**
	 * Process brace style for try catch statements
	 */
	tryCatchCallback() {
		const { node } = this;
		const { body, catches, always } = node as AstTry;

		// Check opening brace for all cases
		this.reportAndFixOpeningBrace();

		// Aggregate all nodes that have a closing brace
		const nodes = [body, ...catches ?? []];
		if (always) {
			nodes.push(always);
		}

		// Loop through all nodes and check the closing brace
		// of each node with the next node
		nodes.forEach((currentNode, index) => {
			const nextNode = nodes[index + 1] ?? false;
			this.reportAndFixClosingBrace(currentNode, nextNode);
		});
	}

	/**
	 * Ensure consistent brace style for if statements
	 */
	ifCallback() {
		const { node } = this;
		const { body, alternate, shortForm } = node as AstIf;

		if (shortForm === true) {
			return;
		}

		// Only if (without elseif/else statements)
		if (alternate === undefined || alternate === null) {
			this.reportAndFixOpeningBrace();
			this.reportAndFixClosingBrace(body, false);
			return;
		}

		// For elseif, else statements
		this.reportAndFixOpeningBrace();
		this.reportAndFixClosingBrace(body, alternate as AstIf);
	}

	/**
	 * Check open brace position and report if it does not match
	 *
	 * @param  {Loc}     bodyLoc Optional body location
	 * @return {boolean}         True if the brace was reported, false otherwise
	 */
	reportAndFixOpeningBrace(bodyLoc?: Loc): boolean {
		const { sourceLines, report } = this.context;
		const { body, loc: nodeLoc } = this.node as AstIf | AstWhile | AstSwitch | AstForeach;
		const { start } = nodeLoc;

		const {
			start: {
				line: bodyStartLine,
			},
		} = bodyLoc ?? body.loc;

		let previousStructure = findAhead(sourceLines, nodeLoc, ')');
		const findOpeningBrace = findAhead(sourceLines, nodeLoc, '{');

		if (findOpeningBrace === false) {
			return false;
		}

		const {
			line: openingBraceLine,
			column: openingBraceColumn,
			offset: openingBraceOffset,
		} = findOpeningBrace;

		// If there is no closing parenthesis `)` or it was found after the opening brace,
		// then we resort to the node start line
		if (
			previousStructure === false
			|| previousStructure.offset > openingBraceOffset
		) {
			previousStructure = start;
		}

		const {
			line: previousStructureLine,
		} = previousStructure;

		// Check if the opening brace is on the same line as the control structure
		// And that it is after the closing parenthesis
		if (previousStructureLine === openingBraceLine) {
			return false;
		}

		const bodyStartLineContent = sourceLines[bodyStartLine];
		const hasSpaceBeforeBrace = bodyStartLineContent[openingBraceColumn - 1] === ' ';
		const startLineContent = sourceLines[previousStructureLine];

		const position = {
			start: {
				line: openingBraceLine,
				column: openingBraceColumn,
				offset: openingBraceOffset,
			},
			end: {
				line: openingBraceLine,
				column: openingBraceColumn + 1,
				offset: openingBraceOffset + 1,
			},
		};

		report({
			message: 'Opening brace must not be on a line by itself',
			position,
			fix(fixer: Fixer) {
				// Initial value of the column is the end of the line
				let column = startLineContent.length;

				/**
				 * Check if there is a comment at the end of the line,
				 * if there is, then we need to insert the brace before
				 * the comment
				 */
				const commentIndex = startLineContent.indexOf('//');
				if (commentIndex !== -1) {
					column = commentIndex;
				}

				const offset =
					getOffsetFromLineAndColumn(sourceLines, previousStructureLine, column);

				const replacePosition = {
					start: {
						offset,
					},
					end: {
						offset,
					},
				};

				// First remove the brace
				const newText = fixer.removeRange(position);
				fixer.setSourceCode(newText);

				const replaceText = hasSpaceBeforeBrace ? '{' : ' {';

				// Add the brace after the end of the previous
				// structure and before the comment (if any)
				return fixer.after(replacePosition, replaceText);
			},
		});

		return true;
	}

	/**
	 * Report and fix closing brace if it is not on
	 * a line by itself. Closing braces is always on a
	 * separate line, regardless of the brace style.
	 *
	 * @param {AllAstTypes}         node      The node to check
	 * @param {false | AllAstTypes} alternate The alternate node to check
	 */
	reportAndFixClosingBrace(node: AllAstTypes, alternate: false | AstIf | AstCatch | AstBlock): boolean {
		const { sourceLines, report, sourceCode } = this.context;
		const {
			end: {
				line: endLine,
			},
		} = node.loc;

		const closingBracePosition = findAheadRegexReverse(
			sourceLines,
			node.loc,
			/(?<brace>\})(?<semiColon>;*)$/u
		);

		// If not closing brace, then it is a possible
		// a single line if, foreach, for, while ... etc
		if (closingBracePosition === false || closingBracePosition.groups === undefined) {
			return false;
		}

		const { brace, semiColon } = closingBracePosition.groups;

		/* brace is always defined since it is not optional in the regex
		* but we need to check for it since the `groups` are 
		* optional in the type definition */
		/* c8 ignore next 3 */
		if (brace === undefined) {
			return false;
		}

		// If not alternate node, check that the line only contains a }
		const nodeEndLineContent = sourceLines[brace.end.line];
		const isOnlyBraceOnLine = /^\};*$/u.test(nodeEndLineContent.trim());

		if (alternate === false && isOnlyBraceOnLine === false) {
			const position = {
				start: brace.start,
				end: semiColon === undefined ? brace.end : semiColon.end,
			};

			report({
				message: 'Closing brace must be on a line by itself',
				position,
				fix(fixer: Fixer) {
					if (semiColon === undefined) {
						return fixer.replaceRange(position, '\n}\n');
					}
					return fixer.replaceRange(position, '\n};\n');
				},
			});

			return true;
		}

		if (alternate === false) {
			return false;
		}

		// Handle alternate node (like elseif, else)
		const location = 'body' in alternate ? (alternate as AstIf | AstCatch).body.loc : alternate.loc;

		const alternateStartLine = location.start.line;
		if (endLine === alternateStartLine) {
			return false;
		}

		const alternateBracePosition = findAhead(
			sourceLines,
			location,
			'{'
		);

		if (alternateBracePosition === false) {
			return false;
		}

		const position = {
			start: brace.start,
			end: {
				line: alternateBracePosition.line,
				column: alternateBracePosition.column + 1,
				offset: alternateBracePosition.offset + 1,
			},
		};

		report({
			message: 'Opening brace, control structure and closing brace must be on the same line',
			position,
			fix(fixer: Fixer) {
				/*
				* Extract text as per the position offset.
				* This will include the closing brace of the previous node,
				* the control structure, and the opening brace of the alternate node.
				*/
				let text = sourceCode.slice(position.start.offset, position.end.offset);

				// Make sure there is one space before the opening brace
				text = text.replace(/\s*\{/u, ' {');

				// Make sure there is one space after the closing brace
				text = text.replace(/\}\s*/u, '} ');

				// Remove all newlines and replace with a single space
				text = text.replaceAll('\n', ' ');

				return fixer.replaceRange(position, text);
			},
		});

		return true;
	}

	/**
	 * Entry point of the rule processing
	 *
	 * @param  {RuleContext} context The context of the rule
	 * @return {boolean}             True if the rule should be processed, false otherwise
	 */
	@WithCallMapping
	process(context: RuleContext): boolean {
		this.context = context;
		this.node = context.node;

		const { options } = this.context;

		this.braceStyle = options.style;

		return true;
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that opening and closing braces have consistent style',
			fixable: true,
			preset: 'psr',
		},
		name: 'brace-style',
		severity: 'warning',
		defaultOptions: {
			style: {
				type: 'string',
				description: 'The brace style to enforce',
				oneOf: [
					{
						type: 'string',
						const: '1tbs',
						description: 'One true brace style. The opening brace of a block is placed on the same line as its corresponding statement or declaration.',
					},
					{
						type: 'string',
						const: 'psr',
						description: 'psr style. See https://www.php-fig.org/psr/psr-12/ for more information',
					},
				],
				default: 'psr',
			},
		},
		register: [
			'class',
			'trait',
			'interface',
			'enum',
			'function',
			'method',
			'if',
			'for',
			'foreach',
			'while',
			'do',
			'switch',
			'try',
			'match',
		],
		bindClass: BraceStyle,
	};
};
