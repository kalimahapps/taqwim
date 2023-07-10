/**
 * Ensure consistent parentheses spacing.
 * This rule enures:
 * - Single space after control structure keywords (if, for, foreach, while, do, switch, catch)
 * - No space before the opening parenthesis of functions, methods, closures, calls and arrays
 * - No space after the opening parenthesis
 * - No space before the closing parenthesis
 * - A single space after the closing parenthesis (except when followed by a semicolon)
 */
/* eslint max-lines-per-function: ["warn", 110],complexity: ["warn", 11] */
import { findAhead, findAheadRegex } from '@taqwim/utils/index';
import type {
	AllAstTypes,
	AstArray,
	AstCall,
	AstClosure,
	AstDo,
	AstExpression,
	Loc,
	RuleContext,
	RuleDataOptional
} from '@taqwim/types';
import type Fixer from '@taqwim/fixer';
import { WithCallMapping } from '@taqwim/decorators';

type FixData = {
	condition: (Loc | boolean | undefined)[];
	payload?: string;
	message: string;
	fix: 'after' | 'removeRange' | 'replaceRange';
};

class ParenSpacing {
	/**
	 * The context of the rule
	 */
	context = {} as RuleContext;

	/**
	 * The node being processed
	 */
	node = {} as AllAstTypes;

	/**
	 * Callbacks for each node type
	 */
	callbacksMap = {
		arrayCallback: ['array'],
		doCallback: ['do'],
		closureCallback: ['closure'],
		callCallback: ['call'],
		binCallback: ['bin'],
		generalCallback: ['function', 'method', 'if', 'isset', 'for', 'foreach', 'while', 'do', 'switch', 'catch'],
	};

	/**
	 * These characters should not have spaces before them when they
	 * are preceded by a closing parenthesis.
	 * `-` is a reference to the first char of the accessor operator `->`,
	 * it is not to be confused with the subtraction operator which is
	 * handled by the spacing.operator rule
	 */
	noSpaceChars = [';', ',', ':', ')', '-'];

	/**
	 * Keywords that should not have spaces after them
	 * when they are followed by an opening parenthesis
	 */
	noSpaceKeywords = ['function', 'method', 'closure', 'call', 'array', 'isset'];

	/**
	 * Keywords that can be nested
	 *
	 * @example
	 * if ( isset (condition) ) {
	 * $this->callMethod( $param, array ("this", "methid") );
	 * public function getFoo(#[FooClassAttrib(28  ) ] $a ): string
	 */
	canBeNested = ['array', 'if', 'call', 'function', 'method'];

	/**
	 * Helper method to report and fix paren spacing
	 *
	 * @param {FixData} fixData The data to use for reporting and fixing
	 */
	reportfixParen(fixData: FixData) {
		const { report } = this.context;
		const { condition, payload = '', message, fix } = fixData;

		const hasPassed = condition.every((value) => {
			return value !== false && value !== undefined;
		});

		if (hasPassed === false) {
			return;
		}

		const position = condition[0] as unknown as Loc;

		report({
			message,
			position,
			fix: (fixer: Fixer) => {
				switch (fix) {
					case 'after': {
						return fixer.after(position, payload);
					}
					case 'removeRange': {
						return fixer.removeRange(position);
					}
					default: {
						return fixer.replaceRange(position, payload);
					}
				}
			},
		});
	}

	/**
	 * Report and fix closing parenthesis
	 *
	 * @param {Loc} [nodeLoc] The location of the node to process.
	 *                        If not provided, the location of the current node will be used
	 */
	processClosingParen(nodeLoc?: Loc) {
		const { sourceLines } = this.context;
		const { kind } = this.node;
		const loc = nodeLoc ?? this.node.loc;

		const regex = [
			'(?<stringBefore>\\S{0,1})',
			'(?<spaceBefore>\\s*)',
			'(?<paren>\\))',
			'(?<spaceAfter>\\s*)',

			// Match a character except for a parenthesis
			// This will help avoid mistmatch of cases like if(isset($test))
			'(?<stringAfter>[^\\)]{0,1})',
		];

		// For if statements, match the end of the line
		// to avoid matching the nested parenthesis
		if (this.canBeNested.includes(kind)) {
			regex.push('(?!.*\\).*$)');
		}

		const closingparenthesis = findAheadRegex(
			sourceLines,
			loc,
			new RegExp(regex.join(''), 'u')
		);

		if (closingparenthesis === false || closingparenthesis.groups === undefined) {
			return;
		}

		const {
			stringBefore,
			paren,
			spaceBefore,
			spaceAfter,
			stringAfter,
		} = closingparenthesis.groups;

		this.reportfixParen({
			condition: [spaceBefore, stringBefore, spaceBefore && spaceBefore.value.length > 0],
			message: `There must be no space before the closing parenthesis. Found ${spaceBefore?.value.length} spaces`,
			fix: 'removeRange',
		});

		if (stringAfter !== undefined) {
			this.reportfixParen({
				condition: [spaceAfter, this.noSpaceChars.includes(stringAfter.value)],
				message: `There must be no space after the closing parenthesis. Found ${spaceAfter?.value.length} spaces`,
				fix: 'removeRange',
			});
		}

		if (stringAfter === undefined || this.noSpaceChars.includes(stringAfter.value)) {
			return;
		}

		this.reportfixParen({
			condition: [spaceAfter, spaceAfter && spaceAfter.value.length > 1],
			message: `There must be a single space after the closing parenthesis. Found ${spaceAfter?.value.length} spaces`,
			fix: 'replaceRange',
			payload: ' ',
		});

		this.reportfixParen({
			condition: [paren, spaceAfter === undefined],
			message: 'There must be a single space after the closing parenthesis. Found 0 spaces',
			fix: 'after',
			payload: ' ',
		});
	}

	/**
	 * Report and fix opening parenthesis
	 *
	 * @param  {Loc}     nodeLoc The location of the node to process.
	 * @param  {boolean} isUse   Whether the opening parenthesis is for a use statement
	 *
	 * @return {boolean}         Whether the function has process all the checks
	 */
	processOpenParen(nodeLoc?: Loc, isUse = false): boolean {
		const { sourceLines } = this.context;
		const { kind } = this.node;
		const loc = nodeLoc ?? this.node.loc;

		const regex = [
			'(?<stringBefore>\\S{0,1})',
			'(?<spaceBefore>\\s*)',
			'(?<paren>\\()',
			'(?<spaceAfter>\\s*)',
			'(?<stringAfter>\\S{0,1})',
		];

		if (kind === 'call') {
			regex.push('(?!.*\\(.*$)');
		}

		const openingparenthesis = findAheadRegex(
			sourceLines,
			loc,
			new RegExp(regex.join(''), 'u')
		);

		if (openingparenthesis === false || openingparenthesis.groups === undefined) {
			return false;
		}

		const {
			stringBefore,
			spaceBefore,
			spaceAfter,
			paren,
			stringAfter,
		} = openingparenthesis.groups;

		// Process the space after the opening paren
		// if there is a string after the opening paren
		this.reportfixParen({
			condition: [spaceAfter, stringAfter],
			message: `There must be no space after the opening parenthesis. Found ${spaceAfter?.value.length} spaces`,
			fix: 'removeRange',
		});

		// If there is no string before the opening parenthesis, it means
		// that the opening parenthesis has not been preceded by a keyword
		// so we don't need to check for spacing
		if (stringBefore === undefined) {
			return false;
		}

		// These nodes should not have a space before the opening parenthesis
		// e.g. function foo() {}, function(){}, callFunction($first), array($item)
		const shouldHaveSpace = this.noSpaceKeywords.includes(kind);

		this.reportfixParen({
			condition: [spaceBefore, shouldHaveSpace, !isUse],
			message: `There must be no space before the opening parenthesis. Found ${spaceBefore?.value.length} spaces`,
			fix: 'removeRange',
		});

		if (shouldHaveSpace && !isUse) {
			return false;
		}

		this.reportfixParen({
			condition: [paren, spaceBefore === undefined],
			message: 'There must be a single space before the opening parenthesis. Found 0 spaces',
			fix: 'replaceRange',
			payload: ' (',
		});

		this.reportfixParen({
			condition: [spaceBefore, spaceBefore && spaceBefore?.value.length > 1],
			message: `There must be a single space before the opening parenthesis. Found ${spaceBefore?.value.length} spaces`,
			fix: 'replaceRange',
			payload: ' ',
		});

		return true;
	}

	/**
	 * Report and fix empty parentheses 
	 *
	 * @return {boolean} Whether parentheses have been found 
	 */
	processEmptyParens(): boolean {
		const { node, sourceLines, report } = this.context;
		const { loc, kind } = node;

		let searchRange: Loc = loc;

		if (['function', 'method'].includes(kind)) {
			const { body } = node;
			searchRange = {
				start: loc.start,
				end: body.loc.start,
			};
		}

		const regex = ['\\((?<space>\\s+)\\)'];
		if (this.canBeNested.includes(kind)) {
			// Match the end of the line
			// the semicolon is for call nodes because in AST it is 
			// added to the source
			regex.push('(;*)$');
		}

		const findParens = findAheadRegex(
			sourceLines,
			searchRange,
			new RegExp(regex.join(''), 'ums')
		);

		if (findParens === false || findParens.groups === undefined) {
			return false;
		}
		const { space } = findParens.groups;

		/* space can not be undefined because it is
		* matched by the regex. However, we need to add 
		* this check since `groups` properties can be undefined 
		*/
		/* c8 ignore next 3 */
		if (space === undefined) {
			return true;
		}

		report({
			message: `There must be no space between empty parentheses. Found ${space.value.length} spaces`,
			position: space,
			fix: (fixer: Fixer) => {
				return fixer.removeRange(space);
			},
		});

		return true;
	}

	/**
	 * Handle array nodes
	 */
	arrayCallback() {
		const { loc, shortForm, items } = this.node as AstArray;

		// Short arrays don't have parentheses
		if (shortForm === true) {
			return;
		}

		// Get last item
		const lastItem = items.at(-1);
		if (lastItem === undefined) {
			return;
		}

		const { end } = loc;
		const {
			line: endLine,
			column: endColumn,
			offset: endOffset,
		} = lastItem.loc.end;

		const nodeLoc = {
			start: {
				line: endLine,
				column: endColumn - 1,
				offset: endOffset - 1,
			},
			end,
		};
		this.processOpenParen();
		this.processClosingParen(nodeLoc);
	}

	/**
	 * Handle closure nodes
	 *
	 * @return {boolean} Whether the parenthesis have been processed
	 */
	closureCallback(): boolean {
		const { uses, loc: closureLoc } = this.node as AstClosure;

		this.processOpenParen();
		this.processClosingParen();

		// Check if closure has a use statement
		if (uses.length === 0) {
			return false;
		}

		const { sourceLines } = this.context;
		const useNodeLoc = findAhead(sourceLines, closureLoc, 'use');
		if (useNodeLoc === false) {
			return false;
		}
		const searchRange = {
			start: useNodeLoc,
			end: closureLoc.end,
		};

		this.processOpenParen(searchRange, true);
		this.processClosingParen(searchRange);

		return true;
	}

	/**
	 * Handle do nodes
	 *
	 * @return {boolean} Whether the parenthesis have been processed
	 */
	doCallback(): boolean {
		const { sourceLines } = this.context;
		const { loc } = this.node;
		const {
			body: {
				loc: bodyLoc,
			},
		} = this.node as AstDo;

		const whileSearchRange = {
			start: bodyLoc.end,
			end: loc.end,
		};

		const whileNodeLoc = findAhead(sourceLines, whileSearchRange, 'while');
		if (whileNodeLoc === false) {
			return false;
		}

		const searchRange = {
			start: whileNodeLoc,
			end: loc.end,
		};

		this.processOpenParen(searchRange);
		this.processClosingParen();

		return true;
	}

	/**
	 * Handle call nodes
	 */
	callCallback() {
		const { arguments: parameters, loc, what } = this.node as AstCall;

		const { end: whatEnd } = what.loc;
		const openParenSearchRange: Loc = {
			start: {
				line: whatEnd.line,
				column: whatEnd.column - 1,
				offset: whatEnd.offset - 1,
			},
			end: {
				line: loc.start.line,
				column: loc.start.column + 1,
				offset: loc.start.offset + 1,
			},
		};

		let closeParenSearchRange: Loc = loc;
		if (parameters.length > 0) {
			const { start } = parameters[0].loc;
			openParenSearchRange.end = {
				line: start.line,
				column: start.column + 1,
				offset: start.offset + 1,
			};

			const lastElement = parameters.at(-1);
			if (lastElement) {
				const { end } = lastElement.loc;
				closeParenSearchRange = {
					start: {
						line: end.line,
						column: end.column - 1,
						offset: end.offset - 1,
					},
					end: {
						line: loc.end.line,
						column: loc.end.column + 1,
						offset: loc.end.offset + 1,
					},
				};
			}
		}

		this.processOpenParen(openParenSearchRange);
		this.processClosingParen(closeParenSearchRange);
	}

	/**
	 * Binary expressions
	 *
	 * @example
	 * if ( $a + $b ) {}
	 * 
	 * @return {boolean} Whether the parenthesis have been processed
	 */
	binCallback(): boolean {
		const { kind, parenthesizedExpression, loc, traverse } = this.node as AstExpression;

		// Ignore non parenthesized bin expressions
		// e.g. $a = $b + $c;
		if (kind === 'bin' && parenthesizedExpression !== true) {
			return false;
		}

		// Get parent to set the search range
		const parent = traverse.parent();

		if (parent === false) {
			return false;
		}

		// Also get next and prev sibling, if it exists, to set the search range
		const sibling = traverse.nextSibling();
		const previousSibling = traverse.prevSibling();

		const { loc: parentLoc } = parent;
		const { start: parentStart, end: parentEnd } = parentLoc;

		// Set the open paren search range to start from the parent start
		const openParenSearchRange = {
			start: previousSibling === false ? parentStart : previousSibling.loc.end,
			end: {
				line: loc.start.line,
				column: loc.start.column + 1,
				offset: loc.start.offset + 1,
			},
		};

		// Set the close paren search range to end at the 
		// sibling start or parent end
		const closeParenSearchRange = {
			start: {
				line: loc.end.line,
				column: loc.end.column - 1,
				offset: loc.end.offset - 1,
			},
			end: sibling === false ? parentEnd : sibling.loc.start,
		};

		this.processOpenParen(openParenSearchRange);
		this.processClosingParen(closeParenSearchRange);

		return true;
	}

	/**
	 * Handle all other nodes
	 */
	generalCallback() {
		this.processOpenParen();
		this.processClosingParen();
	}

	/**
	 * Entry point of the rule processing
	 *
	 * @param  {RuleContext} context The context of the rule
	 * @return {boolean}             Whether the rule should be processed
	 */
	@WithCallMapping
	process(context: RuleContext): boolean {
		this.context = context;
		const { node } = this.context;
		this.node = node;

		const hasFoundEmptyParen = this.processEmptyParens();
		if (hasFoundEmptyParen) {
			return false;
		}

		return true;
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure consistent parentheses spacing',
			fixable: true,
			preset: 'psr',
		},
		severity: 'warning',
		name: 'spacing.paren',
		register: [
			'function',
			'method',
			'if',
			'isset',
			'bin',
			'for',
			'foreach',
			'while',
			'do',
			'switch',
			'catch',
			'closure',
			'call',
			'array',
		],
		bindClass: ParenSpacing,
	};
};
