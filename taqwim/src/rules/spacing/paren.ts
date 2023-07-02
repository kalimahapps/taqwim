/**
 * Ensure consistent parentheses spacing.
 * This rule enures:
 * - Single space after control structure keywords (if, for, foreach, while, do, switch, catch)
 * - No space before the opening parenthesis of functions, methods, closures, calls and arrays
 * - No space after the opening parenthesis
 * - No space before the closing parenthesis
 * - A single space after the closing parenthesis (except when followed by a semicolon)
 */
import { findAhead, findAheadRegex } from '@taqwim/utils/index';
import type { Loc, RuleContext, RuleDataOptional } from '@taqwim/types';
import type Fixer from '@taqwim/fixer';

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
	 * These characters should not have spaces before them
	 * when they are preceded by a closing parenthesis
	 */
	noSpaceChars = [';', ',', ':', ')'];

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
	 */
	canBeNested = ['if', 'call'];

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
	/* eslint complexity: ["warn", 10] */
	processClosingParen(nodeLoc?: Loc) {
		const { node, sourceLines } = this.context;
		const { kind } = node;
		const loc = nodeLoc ?? node.loc;

		const regex = [
			'(?<stringBefore>\\S{0,1})',
			'(?<spaceBefore>\\s*)',
			'(?<paren>\\))',
			'(?<spaceAfter>\\s*)',
			'(?<stringAfter>\\S{0,1})',
		];

		// For if statements, match the end of the line
		// to avoid matching the nested parenthesis
		if (this.canBeNested.includes(kind)) {
			regex.push('$');
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
	 * @param {Loc}     nodeLoc The location of the node to process.
	 * @param {boolean} isUse   Whether the opening parenthesis is for a use statement
	 */
	processOpenParen(nodeLoc?: Loc, isUse = false) {
		const { node, sourceLines } = this.context;
		const { kind } = node;
		const loc = nodeLoc ?? node.loc;

		const openingparenthesis = findAheadRegex(
			sourceLines,
			loc,
			// eslint-disable-next-line max-len, vue/max-len
			/(?<stringBefore>\S{0,1})(?<spaceBefore>\s*)(?<paren>\()(?<spaceAfter>\s*)(?<stringAfter>\S{0,1})/u
		);

		if (openingparenthesis === false || openingparenthesis.groups === undefined) {
			return;
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
			return;
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
			return;
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
	}

	/**
	 * Report and fix empty parentheses 
	 *
	 * @return {boolean} Whether parentheses have been found 
	 */
	processEmptyParens(): boolean {
		const { node, sourceLines, report } = this.context;
		const { loc } = node;

		const findParens = findAheadRegex(
			sourceLines,
			loc,
			/\((?<space>\s+)\)/u
		);

		if (findParens === false || findParens.groups === undefined) {
			return false;
		}

		const { space } = findParens.groups;
		if (space === undefined) {
			return true;
		}

		report({
			message: 'Spaces found. There must be no space between empty parentheses',
			position: space,
			fix: (fixer: Fixer) => {
				return fixer.removeRange(space);
			},
		});

		return true;
	}

	/**
	 * Entry point of the rule processing
	 *
	 * @param {RuleContext} context The context of the rule
	 */
	process(context: RuleContext) {
		this.context = context;

		const { node, sourceLines } = this.context;
		const { kind, loc, shortForm } = node;

		const hasFoundEmptyParen = this.processEmptyParens();
		if (hasFoundEmptyParen) {
			return;
		}

		if (kind === 'array') {
			// Short arrays don't have parentheses
			if (shortForm === true) {
				return;
			}
			const { end } = loc;
			const {
				line: endLine,
				column: endColumn,
				offset: endOffset,
			} = end;

			const nodeLoc = {
				// Search only the last line of the node
				// This is to avoid unintended results when 
				// there is a nested node.
				start: {
					line: endLine,
					column: 0,
					offset: endOffset - endColumn,
				},
				end,
			};
			this.processOpenParen();
			this.processClosingParen(nodeLoc);
			return;
		}

		// this.processClosingParen();

		if (kind === 'closure') {
			const { uses, loc: closureLoc } = node;
			this.processOpenParen();
			this.processClosingParen();

			// Check if closure has a use statement
			if (uses.length === 0) {
				return;
			}

			const { sourceLines } = this.context;
			const useNodeLoc = findAhead(sourceLines, closureLoc, 'use');
			if (useNodeLoc === false) {
				return;
			}
			const searchRange = {
				start: useNodeLoc,
				end: closureLoc.end,
			};

			this.processOpenParen(searchRange, true);
			this.processClosingParen(searchRange);

			return;
		}

		if (kind === 'do') {
			const {
				body: {
					loc: bodyLoc,
				},
			} = node;

			const whileSearchRange = {
				start: bodyLoc.end,
				end: loc.end,
			};

			const whileNodeLoc = findAhead(sourceLines, whileSearchRange, 'while');
			if (whileNodeLoc === false) {
				return;
			}

			const searchRange = {
				start: whileNodeLoc,
				end: loc.end,
			};

			this.processOpenParen(searchRange);
			this.processClosingParen();

			return;
		}

		this.processOpenParen();
		this.processClosingParen();
	}
}

export default (): RuleDataOptional => {
	const parenSpacingClass = new ParenSpacing();
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
		process: parenSpacingClass.process.bind(parenSpacingClass),
	};
};
