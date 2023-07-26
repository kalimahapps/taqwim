/**
 * Ensure consistent instruction spacing
 * This rule enures that:
 * - Array entries, match arms and conds commas are not preceded by a space
 * - List entries commas are not preceded by a space (except if they are empty)
 * - Arguments and parameters commas are not preceded by a space
 * - Arguments and parameters commas are followed by a single space (if on the same line)
 * - For loop statements have a single space after the semicolon (if on the same line)
 * - For loop statements separators (semicolon) are not preceded by a space
 * - Echo statements commas are not preceded by a space
 * - The semicolon is not preceded by a space for the following statements:
 * Return, goto, label, continue, break, exit, declare, include, namespace, usegroup,
 * property statement, traituse, case, constant statement, class constant, assign,
 * function, method, closure, call, array, list, unset, global
 */

import type {
	RuleContext,
	RuleDataOptional,
	AllAstTypes,
	Loc,
	AstArray,
	AstMethod,
	AstClosure,
	AstEcho,
	AstConstantStatement,
	AstCall,
	AstCase,
	AstUnset,
	AstFor,
	AstGlobal,
	AstUseGroup,
	AstNamespace,
	AstPropertyStatement,
	AstTraitUse,
	AstAssign,
	AstMatch,
	AstMatchArm,
	AstEnumCase
} from '@taqwim/types';
import type Fixer from '@taqwim/fixer';
import { WithCallMapping } from '@taqwim/decorators';
import { findAhead, findAheadRegex } from '@taqwim/utils';

class SeparationSpacing {
	/**
	 * The context of the rule
	 */
	context = {} as RuleContext;

	node = {} as AllAstTypes;

	callbacksMap = {
		arrayCallback: ['array', 'list'],
		functionCallback: ['function', 'method', 'closure', 'new'],
		parametersCallback: ['call', 'unset', 'global'],
		echoCallback: ['echo'],
		forCallback: ['for'],
		statementCallback: ['return', 'goto', 'label', 'continue', 'break', 'exit', 'declare', 'include', 'yield'],
		usegroupCallback: ['usegroup'],
		namespaceCallback: ['namespace'],
		propertyStatementCallback: ['propertystatement'],
		assignCallback: ['assign'],
		traitUseCallback: ['traituse'],
		caseCallback: ['case'],
		constantStatementCallback: ['constantstatement', 'classconstant'],
		matchCallback: ['match'],
		matchArmCallback: ['matcharm'],
		enumcaseCallback: ['enumcase'],
	};

	/**
	 * Handle echo statements
	 */
	echoCallback() {
		const { expressions: children } = this.node as AstEcho;

		this.removeSeparatorLeadingSpace();

		// Process further if there are multiple expressions
		if (children?.length <= 1) {
			return;
		}

		children.slice(0, -1).forEach(this.processEntries.bind(this));
	}

	/**
	 * Handle enumcase statements
	 *
	 * @return {boolean} false if the function was stopped
	 */
	enumcaseCallback(): boolean {
		const { sourceLines } = this.context;
		const { loc, traverse } = this.node as AstEnumCase;
		const parent = traverse.parent();
		if (parent === false) {
			return false;
		}

		const findSemiscolon = findAhead(
			sourceLines,
			{
				start: loc.end,
				end: parent.loc.end,
			},
			';'
		);

		if (findSemiscolon === false) {
			return false;
		}

		this.removeSeparatorLeadingSpace({
			start: loc.end,
			end: {
				line: findSemiscolon.line,
				column: findSemiscolon.column + 1,
				offset: findSemiscolon.offset + 1,
			},
		});

		return true;
	}

	/**
	 * Handle traituse including precedence statements
	 * e.g use A, B {
	 * B::smallTalk insteadof A;
	 * A::bigTalk insteadof B;
	 * B::bigTalk as talk;
	 * }
	 *
	 * @return {boolean} false if the function was stopped
	 */
	traitUseCallback(): boolean {
		const { sourceLines } = this.context;
		const { loc, adaptations, traits } = this.node as AstTraitUse;

		traits.slice(0, -1).forEach(this.processEntries.bind(this));

		if (!adaptations) {
			this.removeSeparatorLeadingSpace(loc);
			return true;
		}

		adaptations.forEach((adaptation) => {
			const findSemiscolon = findAhead(
				sourceLines,
				{
					start: adaptation.loc.end,
					end: loc.end,
				},
				';'
			);

			const { loc: adaptationLoc } = adaptation;
			if (findSemiscolon === false) {
				return;
			}

			this.removeSeparatorLeadingSpace({
				start: adaptationLoc.start,
				end: {
					line: findSemiscolon.line,
					column: findSemiscolon.column + 1,
					offset: findSemiscolon.offset + 1,
				},
			});
		});

		return true;
	}

	/**
	 * Handle assign statements.
	 * e.g. $a = 1;
	 */
	assignCallback() {
		const { loc, right, traverse } = this.node as AstAssign;

		// Don't process if the assign is inside a for loop
		const closestFor = traverse.parent();
		if (closestFor && closestFor.kind === 'for') {
			return;
		}

		this.removeSeparatorLeadingSpace({
			start: right.loc.end,
			end: loc.end,
		});
	}

	/**
	 * Handle for loop statements
	 * e.g. for ($i = 0; $i < 10; $i++) {}
	 * e.g. for ($i = 0;;;) {}
	 * e.g. for ($i,$j;$<10;$--) {}
	 */
	forCallback() {
		const { sourceLines } = this.context;
		const { init, test, loc, body } = this.node as AstFor;

		[init, test].forEach((forNode) => {
			if (forNode.length === 0) {
				return;
			}
			forNode.slice(0, -1).forEach(this.processEntries.bind(this));

			const lastChild = forNode.at(-1);
			if (!lastChild) {
				return;
			}

			const findSemiscolon = findAhead(
				sourceLines,
				{
					start: lastChild.loc.end,
					end: loc.end,
				},
				';'
			);

			if (findSemiscolon === false) {
				return;
			}

			this.removeSeparatorLeadingSpace({
				start: lastChild.loc.end,
				end: {
					line: findSemiscolon.line,
					column: findSemiscolon.column + 1,
					offset: findSemiscolon.offset + 1,
				},
			});

			this.processTrailingSpace({
				start: lastChild.loc.end,
				end: body.loc.start,
			});
		});
	}

	/**
	 * Handle return, goto, label, continue, break, exit, declare, include statements
	 */
	statementCallback() {
		this.removeSeparatorLeadingSpace();
	}

	/**
	 * Handle namespace statements
	 * e.g. namespace MyNamespace;
	 */
	namespaceCallback() {
		const { children, loc } = this.node as AstNamespace;

		if (children.length === 0) {
			this.removeSeparatorLeadingSpace();
			return;
		}

		const [firstChild] = children;
		if (!firstChild) {
			return;
		}

		const { loc: childLoc } = firstChild;

		const findSemiscolon = findAhead(
			this.context.sourceLines,
			{
				start: loc.start,
				end: childLoc.start,
			},
			';'
		);

		if (findSemiscolon === false) {
			return;
		}

		this.removeSeparatorLeadingSpace({
			start: loc.start,
			end: childLoc.start,
		});
	}

	/**
	 * Handle property statements.
	 * e.g. public $property = 'value';
	 * e.g. public $property1 = 'value1', $property2 = 'value2';
	 *
	 * @return {boolean} false if the function was stopped
	 */
	propertyStatementCallback(): boolean {
		const { properties, loc, traverse } = this.node as AstPropertyStatement;

		if (properties.length > 1) {
			properties.slice(0, -1).forEach(this.processEntries.bind(this));
		}

		const parent = traverse.parent();
		if (parent === false) {
			return false;
		}

		const findSemiscolon = findAhead(
			this.context.sourceLines,
			{
				start: loc.start,
				end: parent.loc.end,
			},
			';'
		);

		if (findSemiscolon === false) {
			return false;
		}

		this.removeSeparatorLeadingSpace({
			start: loc.start,
			end: {
				line: findSemiscolon.line,
				column: findSemiscolon.column + 1,
				offset: findSemiscolon.offset + 1,
			},
		});

		return true;
	}

	/**
	 * Process usegroup statements. 
	 * Add spaces after commas and remove leading
	 * spaces before semicolons and commas
	 */
	usegroupCallback() {
		const { sourceLines } = this.context;
		const { items } = this.node as AstUseGroup;

		if (items.length > 1) {
			items.slice(0, -1).forEach(this.processEntries.bind(this));
		}

		const lastItem = items.at(-1);
		if (!lastItem) {
			return;
		}

		const { loc } = lastItem;
		const findSemiscolon = findAhead(
			sourceLines,
			{
				start: loc.end,
				end: {
					line: sourceLines.length - 1,
					column: sourceLines.at(-1)?.length ?? 0,
					offset: -1,
				},
			},
			';'
		);

		if (findSemiscolon === false) {
			return;
		}

		this.removeSeparatorLeadingSpace({
			start: loc.end,
			end: {
				line: findSemiscolon.line,
				column: findSemiscolon.column + 1,
				offset: findSemiscolon.offset + 1,
			},
		});
	}

	/**
	 * Handle case statements inside switch statements
	 *
	 * @return {boolean} false if the function was stopped
	 */
	caseCallback(): boolean {
		const { body, loc } = this.node as AstCase;
		if (!body) {
			return false;
		}

		const { children } = body;

		// Get the first child loc
		const [firstChild] = children;
		if (!firstChild) {
			return false;
		}

		const { loc: firstChildLoc } = firstChild;
		const searchRange = {
			start: loc.start,
			end: firstChildLoc.start,
		};

		this.removeSeparatorLeadingSpace(searchRange);

		return true;
	}

	/**
	 * Handle match statements
	 *
	 * @return {boolean} false if the function was stopped
	 */
	matchCallback(): boolean {
		const { arms, loc } = this.node as AstMatch;
		if (arms.length === 0) {
			return false;
		}

		arms.slice(0, -1).forEach(this.processEntries.bind(this));

		// Handle last arm if it has a trailing comma
		const lastArm = arms.at(-1) as AstMatchArm;

		const { loc: armLoc } = lastArm;

		this.removeLeadingSpace({
			start: armLoc.end,
			end: loc.end,
		});

		return true;
	}

	/**
	 * Handle match arms conds
	 */
	matchArmCallback() {
		const { conds } = this.node as AstMatchArm;

		if (!conds || conds.length === 0) {
			return;
		}

		conds.slice(0, -1).forEach(this.processEntries.bind(this));
	}

	/**
	 * Handle constant statements e.g. const CONSTANT = 'value';
	 *
	 * @return {boolean} false if the function was stopped
	 */
	constantStatementCallback(): boolean {
		const { constants, traverse, loc, kind } = this.node as AstConstantStatement;

		if (constants.length === 0) {
			return false;
		}

		constants.slice(0, -1).forEach(this.processEntries.bind(this));

		// Class constants includes a trailing semicolon in loc,
		// so there is no need to find it
		if (kind === 'constantstatement') {
			this.removeSeparatorLeadingSpace();
			return true;
		}

		// Regular constants don't include a trailing semicolon in loc,
		// so we need to find it
		const nextSibling = traverse.nextSibling();
		const parent = traverse.parent();

		if (parent === false) {
			return false;
		}

		const searchRange = {
			start: loc.end,
			end: nextSibling === false ? parent.loc.end : nextSibling.loc.start,
		};

		this.removeSeparatorLeadingSpace(searchRange);

		return true;
	}

	/**
	 * Handle function, method, closure and new statements
	 *
	 * @example
	 * function myFunction($a, $b) {}
	 * function myFunction($a, $b): void {}
	 * function myFunction($a, $b) use ($c) {}
	 * new MyClass($a, $b)
	 */
	functionCallback() {
		const {
			arguments: parameters,
			uses,
		} = this.node as AstMethod & AstClosure;

		if (uses?.length > 0) {
			uses.slice(0, -1).forEach(this.processEntries.bind(this));
		}

		if (parameters.length <= 1) {
			return;
		}
		parameters.slice(0, -1).forEach(this.processEntries.bind(this));
	}

	/**
	 * Handle statements with parameters like call, unset, global
	 */
	parametersCallback() {
		let children: any = [];
		const { kind } = this.node;

		if (kind === 'call') {
			children = (this.node as AstCall).arguments;
		}

		if (kind === 'unset') {
			children = (this.node as AstUnset).variables;
		}

		if (kind === 'global') {
			children = (this.node as AstGlobal).items;
		}

		if (children.length > 1) {
			children.slice(0, -1).forEach(this.processEntries.bind(this));
		}

		this.removeSeparatorLeadingSpace();
	}

	/**
	 * Callback for nodes with array entries, for nodes
	 * such as array, list
	 *
	 * @return {boolean} false if not items are found
	 */
	arrayCallback(): boolean {
		const { items } = this.node as AstArray;

		this.removeSeparatorLeadingSpace();

		// Array and list
		if (items.length === 0) {
			return false;
		}

		items.slice(0, -1).forEach(this.processEntries.bind(this));

		return false;
	}

	/**
	 * Add a leading space before a comma
	 *
	 * @param  {Loc}     searchRange The search range
	 * @return {boolean}             Whether it has reported the error
	 */
	addLeadingSpace(searchRange: Loc): boolean {
		const { sourceLines, report } = this.context;

		const findComma = findAheadRegex(
			sourceLines,
			searchRange,
			/(?<leadingSpace>\s*)(?<comma>,)/u
		);

		if (findComma === false || findComma.groups === undefined) {
			return false;
		}

		const { leadingSpace } = findComma.groups;

		let message = 'Comma must be preceded by a single space. Found 0 spaces';
		if (leadingSpace !== undefined && leadingSpace.value.length !== 1) {
			message = `Comma must be preceded by a single space. Found ${leadingSpace.value.length} spaces`;
		}

		if (leadingSpace !== undefined && leadingSpace.value.length === 1) {
			return false;
		}

		report({
			message,
			position: findComma,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(findComma, ' ,');
			},
		});

		return true;
	}

	/**
	 * Remove any leading space before a comma 
	 *
	 * @param  {Loc}     searchRange The node location
	 * @return {boolean}             Whether it has reported the error
	 */
	removeLeadingSpace(searchRange: Loc): boolean {
		const { sourceLines, report } = this.context;

		const findComma = findAheadRegex(
			sourceLines,
			searchRange,
			/(?<leadingSpace>\s*)(?<comma>,)/u
		);

		if (findComma === false || findComma.groups === undefined) {
			return false;
		}

		const { leadingSpace } = findComma.groups;
		if (leadingSpace === undefined) {
			return false;
		}
		const message = `Comma must not be preceded by a single space. Found ${leadingSpace.value.length} spaces`;

		report({
			message,
			position: findComma,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(findComma, ',');
			},
		});

		return true;
	}

	/**
	 * Process trailing space.
	 * Remove/add a space after a comma or semicolon.
	 * Generally, a space is not added after a semicolon,
	 * but in case of a for loop, a space is added between
	 * the semicolon and the next expression.
	 *
	 * @param {Loc} nodeLoc The node location
	 */
	/* eslint complexity: ["warn", 9] */
	processTrailingSpace(nodeLoc: Loc): boolean {
		const { sourceLines, report } = this.context;

		const findSeparatorWithSpace = findAheadRegex(
			sourceLines,
			nodeLoc,
			/^\s*(?<separator>,|;)(?<spaces>\s*)/u
		);

		if (findSeparatorWithSpace === false || findSeparatorWithSpace.groups === undefined) {
			return false;
		}

		const { groups } = findSeparatorWithSpace;
		const { separator, spaces } = groups;

		if (separator === undefined || spaces?.value.length === 1) {
			return false;
		}

		const {
			end,
			start: separatorStart,
			value: separatorValue,
		} = separator;

		// Check if the separator is the last character in the line
		// If it is, don't processed
		const separatorLine = sourceLines.at(end.line);
		if (separatorLine !== undefined && end.column === separatorLine.length) {
			return false;
		}

		let position: Loc = separator;
		let spacesLength = 0;

		if (spaces !== undefined) {
			spacesLength = spaces.value.length;
			position = {
				start: separatorStart,
				end: spaces.end,
			};
		}

		const type = separatorValue === ',' ? 'Comma' : 'Semicolon';

		report({
			message: `${type} must have a single trailing space. Found ${spacesLength} spaces`,
			position,
			fix: (fixer: Fixer) => {
				if (spacesLength === 0) {
					return fixer.after(separator, ' ');
				}

				const replaceWith = separatorValue === ',' ? ', ' : '; ';
				return fixer.replaceRange(position, replaceWith);
			},
		});

		return true;
	}

	/**
	 * Remove any leading space before a semicolon or colon
	 *
	 * @param  {Loc}     nodeLoc The node location
	 * @return {boolean}         Whether it has reported the error
	 */
	removeSeparatorLeadingSpace(nodeLoc?: Loc): boolean {
		const { sourceLines, report } = this.context;
		const { loc } = this.node;

		const searchRange = nodeLoc ?? loc;
		const lastLine = sourceLines.at(-1);

		if (lastLine === undefined) {
			return false;
		}

		const findSeparator = findAheadRegex(
			sourceLines,
			searchRange,
			/(?<spaces>\s*)(?<separator>;|:)\s*$/u
		);

		if (findSeparator === false || findSeparator.groups === undefined) {
			return false;
		}

		const { spaces, separator } = findSeparator.groups;
		if (!spaces || !separator || spaces.value.length === 0) {
			return false;
		}
		const position = {
			start: spaces.start,
			end: {
				line: separator.end.line,
				column: separator.end.column,
				offset: separator.end.offset,
			},
		};

		const type = separator.value === ':' ? 'Colon' : 'Semicolon';
		report({
			message: `${type} must not have leading spaces. Found ${spaces.value.length} spaces`,
			position,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(position, separator.value);
			},
		});

		return true;
	}

	/**
	 * Process entires by removing leading spaces
	 * and adding/removing trailing spaces as needed
	 *
	 * @param  {any}     entry   The entry to process
	 * @param  {number}  index   The index of the entry
	 * @param  {any[]}   entries The entries array
	 *
	 * @return {boolean}         false if the function was stopped
	 */
	processEntries(entry: any, index: number, entries: any[]): boolean {
		const { loc, kind, traverse } = entry;

		const nextEntry = entries[index + 1];
		const parent = traverse.parent();
		if (parent === false) {
			return false;
		}

		const searchRange = {
			start: loc.end,
			end: nextEntry?.loc.end ?? parent.loc.end,
		};

		// get next entry
		if (nextEntry?.kind !== 'noop') {
			this.processTrailingSpace(searchRange);
		}

		// Noop entries inside list need leading spaces
		if (kind === 'noop') {
			this.addLeadingSpace(searchRange);
			return true;
		}

		this.removeLeadingSpace(searchRange);

		return true;
	}

	/**
	 * Entry point of the rule processing
	 *
	 * @param {RuleContext} context The context of the rule
	 */
	@WithCallMapping
	process(context: RuleContext) {
		this.context = context;
		this.node = context.node;
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure consistent instruction spacing (comma, semicolon, etc.)',
			fixable: true,
			preset: 'psr',
		},
		severity: 'warning',
		name: 'spacing.separation',
		register: [
			'function',
			'method',
			'closure',
			'call',
			'array',
			'list',
			'enumcase',
			'return',
			'echo',
			'constantstatement',
			'classconstant',
			'goto',
			'label',
			'continue',
			'break',
			'case',
			'unset',
			'exit',
			'declare',
			'global',
			'for',
			'usegroup',
			'namespace',
			'propertystatement',
			'traituse',
			'include',
			'assign',
			'yield',
			'match',
			'matcharm',
			'new',
		],
		bindClass: SeparationSpacing,
	};
};