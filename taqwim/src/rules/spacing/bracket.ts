/**
 * Ensure that square brackets `[]` have consistent spacing
 */
/* eslint complexity: ["warn", 14] */
import type Fixer from '@taqwim/fixer';
import type {
	RuleDataOptional,
	RuleContext,
	AllAstTypes,
	Loc,
	AstLookup,
	AstArray,
	AstEntry,
	RangeMatchType
} from '@taqwim/types';
import { findAheadRegex } from '@taqwim/utils';

type SpaceType = 'leading' | 'trailing';
type BracketType = 'opening' | 'closing';

class BracketSpacing {
	/**
	 * Rule context
	 */
	context = {} as RuleContext;

	/**
	 * Current node
	 */
	node = {} as AllAstTypes;

	/**
	 * Closing bracket should have a single space after it
	 * if it is followed by one of these characters
	 */
	singleSpaceChars = ['=', '?', ':', '.', '!', '|', '&', '+', '-', '*', '/', '%', '^', '>', '<'];

	/**
	 * Opening bracket should have no leading space
	 * if it is preceded by one of these characters
	 */
	noSpaceChars = ['[', '('];

	/**
	 * Report and fix the spacing
	 *
	 * @param {Loc}         left               The location data of the left node
	 * @param {Loc}         right              The location data of the right node
	 * @param {BracketType} bracketType        The type of bracket
	 * @param {SpaceType}   spaceType          The type of space
	 * @param {number}      expectedSpaceCount How many spaces are required
	 */
	reportAndFix(
		left: Loc,
		right: Loc,
		bracketType: BracketType = 'opening',
		spaceType: SpaceType = 'leading',
		expectedSpaceCount = 0
	) {
		// Make sure it is the same line
		if (left.start.line !== right.end.line) {
			return;
		}

		const spaceLength = right.start.offset - left.end.offset;

		if (spaceLength === expectedSpaceCount) {
			return;
		}

		const { report } = this.context;
		const position = {
			start: left.end,
			end: right.start,
		};

		const spaceLocation = spaceType === 'leading' ? 'before' : 'after';
		const spaceText = expectedSpaceCount === 0 ? 'no' : 'a single';
		const message = `There must be ${spaceText} spaces ${spaceLocation} the ${bracketType} bracket. Found ${spaceLength} spaces.`;

		report({
			message,
			position,
			fix: (fixer: Fixer) => {
				const replacement = expectedSpaceCount === 0 ? '' : ' ';
				return fixer.replaceRange(position, replacement);
			},
		});
	}

	/**
	 * Handle offset lookup opening
	 * e.g. $foo = $bar [ 'baz'];
	 */
	handleOffsetLookupOpening() {
		const { sourceLines } = this.context;
		const { offset, what } = this.node as AstLookup;

		if (offset === false) {
			return;
		}

		if (['string', 'number'].includes(offset.kind) === false) {
			return;
		}

		const { loc: whatLoc } = what;
		const { loc: offsetLoc } = offset;
		const openBracketPosition = findAheadRegex(
			sourceLines,
			{
				start: whatLoc.end,
				end: offsetLoc.start,
			},
			/\[/u
		);

		if (openBracketPosition === false) {
			return;
		}

		// Fix leading space
		this.reportAndFix(whatLoc, openBracketPosition);

		// Fix trailing space
		this.reportAndFix(openBracketPosition, offsetLoc, 'opening', 'trailing');
	}

	/**
	 * Handle offset lookup closing
	 * e.g. $foo = $bar['baz' ];
	 */
	handleOffsetLookupClosing() {
		const { sourceLines } = this.context;
		const { offset, traverse, nodeName } = this.node as AstLookup;

		if (offset === false) {
			return;
		}

		if (['string', 'number'].includes(offset.kind) === false) {
			return;
		}

		const parent = traverse.parent();
		if (parent === false) {
			return;
		}

		const { loc: offsetLoc } = offset;

		const closeBracketPosition = findAheadRegex(
			sourceLines,
			{
				start: offsetLoc.end,
				end: parent.loc.end,
			},
			/(?<bracket>\])\s*(?<charAfter>.{1})(?<secondCharAfter>.{0,1})/u
		);

		if (closeBracketPosition === false || closeBracketPosition?.groups === undefined) {
			return;
		}

		// Fix leading space
		this.reportAndFix(offsetLoc, closeBracketPosition, 'closing');

		const { charAfter, secondCharAfter, bracket } = closeBracketPosition.groups;
		if (!charAfter || !bracket) {
			return;
		}

		// Ignore if the string after is an opening bracket because
		// it will be handled by the opening bracket
		// e.g. $foo['bar'] ['baz']
		if (charAfter.value === '[') {
			return;
		}

		// Ignore if the string after is a `->` because
		// it will be handled by the `spacing.accessor` rule
		if (`${charAfter.value}${secondCharAfter?.value}` === '->') {
			return;
		}

		const expectedSpaceCount = this.singleSpaceChars.includes(charAfter.value) ? 1 : 0;

		// Assignment will be handled by `spacing.assignment` rule
		// e.g. $bar['baz']['qux']   = 'quux';
		if (nodeName === 'left' && parent.kind === 'assign') {
			return;
		}

		// Fix trailing space
		this.reportAndFix(bracket, charAfter, 'closing', 'trailing', expectedSpaceCount);
	}

	/**
	 * Report and fix empty array
	 * e.g. $foo = [ ];
	 */
	reportAndFixEmptyArray() {
		const { loc } = this.node as AstArray;
		const { report } = this.context;
		const { start, end } = loc;
		const isSameLine = start.line === end.line;

		if (isSameLine === false) {
			return;
		}

		// Create for position and eliminate the brackets
		const position = {
			start: {
				line: start.line,
				column: start.column + 1,
				offset: start.offset + 1,
			},
			end: {
				line: end.line,
				column: end.column - 1,
				offset: end.offset - 1,
			},
		};

		const foundSpaces = position.end.offset - position.start.offset;
		if (foundSpaces === 0) {
			return;
		}

		const message = `There must be no spaces between the brackets of an empty array. Found ${foundSpaces} spaces.`;
		report({
			message,
			position,
			fix: (fixer: Fixer) => {
				return fixer.removeRange(position);
			},
		});
	}

	/**
	 * Handle array opening
	 * e.g. $foo =  [  1, 2, 3];
	 */
	handleArrayOpening() {
		const { sourceLines } = this.context;
		const { loc: nodeLoc, items } = this.node as AstArray;

		const openBracketPosition = findAheadRegex(
			sourceLines,
			{
				start: {
					// same line as the end. This will help finding the opening bracket
					// in nested arrays, regardless of the nesting level
					// e.g. $foo = [[1, 2, 3], [4, 5, 6]];
					line: nodeLoc.start.line,
					column: 0,
				},
				end: {
					line: nodeLoc.start.line,
					column: nodeLoc.start.column + 1,
				},
			},
			/(?<stringBefore>.{1})(?<space>\s*)(?<bracket>\[)$/u
		);

		if (openBracketPosition === false || openBracketPosition?.groups === undefined) {
			return;
		}

		const { bracket, stringBefore } = openBracketPosition.groups;
		if (!bracket || !stringBefore) {
			return;
		}

		const expectedSpaceCount = this.noSpaceChars.includes(stringBefore.value) ? 0 : 1;

		// Fix leading space
		// Ignore:
		// - if the string before is an opening bracket because
		// it will be handled by trailing space report of that bracket
		// - if it is the first character of the line, since it will be
		// handled by the `indent` rule
		const bracketLine = sourceLines[openBracketPosition.start.line];
		const hasIndent = bracketLine.slice(0, bracket.start.column).trim().length === 0;

		if (stringBefore.value !== '[' && hasIndent === false) {
			this.reportAndFix(stringBefore, bracket, 'opening', 'leading', expectedSpaceCount);
		}

		// Fix trailing space
		this.reportAndFix(bracket, items[0].loc, 'opening', 'trailing');
	}

	/**
	 * Handle array closing bracket
	 * e.g. $foo = [1, 2, 3  ]  ;
	 */
	handleArrayClosing() {
		const { sourceLines } = this.context;
		const { loc: nodeLoc, items } = this.node as AstArray;

		const closeBracketPosition = findAheadRegex(
			sourceLines,
			{
				start: {
					line: nodeLoc.end.line,
					column: nodeLoc.end.column - 1,
					offset: nodeLoc.end.offset - 1,
				},
				end: {
					line: sourceLines.length,
					column: sourceLines.at(-1)?.length ?? 0,
					offset: -1,
				},
			},
			/(?<bracket>\])(?<spaceAfter>\s*)(?<stringAfter>.{1})/u
		);

		if (closeBracketPosition === false || closeBracketPosition?.groups === undefined) {
			return;
		}

		const { bracket, stringAfter } = closeBracketPosition.groups;
		if (!bracket) {
			return;
		}

		let leftNode: Omit<RangeMatchType, 'value'> = bracket;
		const lastItem = items.at(-1) as AstEntry;
		if (lastItem !== undefined) {
			leftNode = lastItem.loc;
		}

		// Fix leading space
		this.reportAndFix(leftNode, bracket, 'closing', 'leading');

		// fix trailing space
		// Ignore if the string after is a closing bracket because
		// it will be handled by leading space report
		if (!stringAfter || stringAfter.value === ']') {
			return;
		}

		this.reportAndFix(bracket, stringAfter, 'closing', 'trailing');
	}

	/**
	 * Process the rule
	 *
	 * @param {RuleContext} context Rule context
	 */
	process(context: RuleContext) {
		this.context = context;
		this.node = context.node;
		const { node } = context;
		const { kind } = node as AstLookup;

		if (kind === 'offsetlookup') {
			this.handleOffsetLookupOpening();
			this.handleOffsetLookupClosing();

			return;
		}

		const { shortForm, items } = node as AstArray;
		if (shortForm === false) {
			return;
		}

		// Handle empty array
		if (items.length === 0) {
			this.reportAndFixEmptyArray();
			return;
		}

		// Handle short array syntax
		this.handleArrayOpening();
		this.handleArrayClosing();
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that square brackets `[]` have consistent spacing',
			fixable: true,
			preset: 'psr',
		},
		name: 'spacing.bracket',
		register: ['offsetlookup', 'array'],
		bindClass: BracketSpacing,
	};
};
