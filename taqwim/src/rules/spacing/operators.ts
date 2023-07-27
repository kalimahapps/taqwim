/**
 * Ensure consistent operators spacing.
 * This rule ensures that operators have a single space before and after them.
 * Operators include: `+`, `-`, `*`, `/`, `%`, `**`, `&`, `|`, `^`, `<<`, `>>`,
 * `===`, `!==`, `==`, `!=`, `<=`, `>=`, `<`, `>`
 *
 * Assignment operator `=` is handled by the `spacing.assignment` rule.
 * Pair operator `=>` is handled by the `spacing.pair` rule.
 */
/* eslint complexity: ["warn", 9] */
import type {
	RuleContext,
	RuleDataOptional,
	AllAstTypes,
	AstBin,
	AstReturnIf,
	Loc,
	AstUnary,
	AstPost,
	AstParameter,
	AstArrowFunction,
	AstFunction,
	AstIdentifier
} from '@taqwim/types';
import type Fixer from '@taqwim/fixer';
import { WithCallMapping } from '@taqwim/decorators';
import { findAhead, findAheadRegex, skipRegex } from '@taqwim/utils';

class OperatorSpacing {
	/**
	 * The context of the rule
	 */
	context = {} as RuleContext;

	/**
	 * Current proccessed node
	 */
	node = {} as AllAstTypes;

	/**
	 * Map of callbacks to be called for each operator type
	 */
	callbacksMap = {
		binCallback: ['bin'],
		retifCallback: ['retif'],
		unaryCallback: ['unary'],
		postPreCallback: ['post', 'pre'],
		parameterCallback: ['parameter'],
		arrowfuncCallback: ['arrowfunc'],
		functionCallback: ['function'],
	};

	/**
	 * Handle function return type operator spacing `:`
	 *
	 * @param  {AstIdentifier} type Function return type
	 * @return {boolean}            false if the function was stopped
	 */
	handleTypeOperator(type: AstIdentifier): boolean {
		const { sourceLines, node } = this.context;
		const { loc } = node;

		const { loc: typeLoc } = type;
		const searchRange = {
			start: loc.start,
			end: typeLoc.start,
		};

		const position = findAheadRegex(
			sourceLines,
			searchRange,
			/(?<spaceBefore>\s*)(?<operator>:)(?<spaceAfter>\s*)/u
		);

		if (position === false || position.groups === undefined) {
			return false;
		}

		const { operator, spaceBefore, spaceAfter } = position.groups;

		/* operator can not be undefined because it is
		* matched by the regex. However, we need to add 
		* this check since `groups` properties can be undefined 
		*/
		/* c8 ignore next 3 */
		if (!operator) {
			return false;
		}

		// Handle space to the right of operator
		const rightSpace = spaceAfter ? spaceAfter.value.length : 0;
		this.reportAndFixRightSpace(typeLoc, operator, ':', rightSpace);

		// Handle space to the left of operator
		const closingParen = findAhead(sourceLines, loc, ')');
		if (closingParen === false) {
			return false;
		}
		const leftLoc = {
			start: loc.start,
			end: closingParen,
		};

		const leftSpace = spaceBefore ? spaceBefore.value.length : 0;
		this.reportAndFixLeftSpace(leftLoc, operator, ':', leftSpace);

		return true;
	}

	/**
	 * Handle function operator spacing.
	 */
	functionCallback() {
		const { type } = this.node as AstFunction;
		if (!type) {
			return;
		}

		this.handleTypeOperator(type as AstIdentifier);
	}

	/**
	 * Handle arrow function reference operator spacing.
	 * e.g. `fn&($a)`
	 *
	 * @return {boolean} false if the function was stopped
	 */
	handleArrowFunctionRef(): boolean {
		const { loc } = this.node as AstArrowFunction;

		const { sourceLines } = this.context;

		const position = findAheadRegex(
			sourceLines,
			loc,
			/fn(?<spaceBefore>\s*)(?<operator>&)(?<spaceAfter>\s*)/u
		);

		if (position === false || position.groups === undefined) {
			return false;
		}

		const { operator, spaceBefore, spaceAfter } = position.groups;

		/* operator can not be undefined because it is
		* matched by the regex. However, we need to add 
		* this check since `groups` properties can be undefined 
		*/
		/* c8 ignore next 3 */
		if (!operator) {
			return false;
		}

		if (spaceAfter) {
			this.reportAndFixRightSpace(loc, operator, '&', spaceAfter.value.length);
		}

		if (spaceBefore) {
			this.reportAndFixLeftSpace(loc, operator, '&', spaceBefore.value.length);
		}

		return true;
	}

	/**
	 * Handle arrow function reference operator (fn&) spacing and
	 *
	 * @return {boolean} false if the function was stopped
	 */
	arrowfuncCallback(): boolean {
		const { byref, loc, body, type } = this.node as AstArrowFunction;
		if (byref !== false) {
			this.handleArrowFunctionRef();
		}

		if (type) {
			this.handleTypeOperator(type);
		}

		// Handle arrow function operator => spacing
		const { sourceLines } = this.context;
		const searchRange = {
			start: loc.start,
			end: body.loc.start,
		};

		const position = findAheadRegex(
			sourceLines,
			searchRange,
			/(?<spaceBefore>\s*)(?<operator>=>)(?<spaceAfter>\s*)$/u
		);

		if (position === false || position.groups === undefined) {
			return false;
		}

		const { operator, spaceBefore, spaceAfter } = position.groups;

		/* operator can not be undefined because it is
		* matched by the regex. However, we need to add 
		* this check since `groups` properties can be undefined 
		*/
		/* c8 ignore next 3 */
		if (!operator) {
			return false;
		}

		const leftDiff = spaceBefore ? spaceBefore.value.length : 0;
		const rightDiff = spaceAfter ? spaceAfter.value.length : 0;

		this.reportAndFixLeftSpace(loc, operator, '=>', leftDiff);
		this.reportAndFixRightSpace(body.loc, operator, '=>', rightDiff);

		return true;
	}

	/**
	 * Handle parameter operators spacing.
	 * e.g. `function test(&$a, ...$rest)`
	 *
	 * @return {boolean} false if the function was stopped
	 */
	parameterCallback(): boolean {
		const { sourceLines } = this.context;
		const { byref, variadic, name, loc } = this.node as AstParameter;
		if (typeof name === 'string') {
			return false;
		}

		let operand = '';
		if (byref) {
			operand = '&';
		} else if (variadic) {
			operand = '...';
		}

		if (operand === '') {
			return false;
		}

		const regex = new RegExp(`(?<operator>${skipRegex(operand)})(?<space>\\s*)`, 'u');
		const position = findAheadRegex(sourceLines, loc, regex);
		if (position === false || position.groups === undefined) {
			return false;
		}

		const { operator, space } = position.groups;
		if (!operator || !space) {
			return false;
		}

		const { loc: nameLoc } = name;

		this.reportAndFixRightSpace(nameLoc, operator, operand, space.value.length);

		return true;
	}

	/**
	 * Handle post and pre operator
	 * e.g. `$var++`, `++$var`, `$var--`,
	 *
	 * @return {boolean} true if the report was made
	 */
	postPreCallback(): boolean {
		const { sourceLines } = this.context;
		const { type, loc, kind } = this.node as AstPost;

		const postType = type.repeat(2);
		let regex = new RegExp(`(?<space>\\s*)(?<operator>${skipRegex(postType)})`, 'u');
		if (kind === 'pre') {
			regex = new RegExp(`(?<operator>${skipRegex(postType)})(?<space>\\s*)`, 'u');
		}

		const position = findAheadRegex(sourceLines, loc, regex);
		if (position === false || position.groups === undefined) {
			return false;
		}

		const { operator, space } = position.groups;
		const diff = space ? space.value.length : 0;

		if (!operator || diff === 0) {
			return false;
		}

		if (kind === 'post') {
			this.reportAndFixLeftSpace(loc, operator, postType, diff);
			return true;
		}

		this.reportAndFixRightSpace(loc, operator, postType, diff);

		return true;
	}

	/**
	 * Handle unary operator
	 * e.g. `!$var`, `-$var`, `~$var`
	 *
	 * @return {boolean} true if the report was made
	 */
	unaryCallback(): boolean {
		const { type, loc } = this.node as AstUnary;

		const regex = new RegExp(`(?<operator>${skipRegex(type)})(?<space>\\s*)`, 'u');
		const unaryPosition = findAheadRegex(this.context.sourceLines, loc, regex);

		if (unaryPosition === false || unaryPosition.groups === undefined) {
			return false;
		}

		const { operator, space } = unaryPosition.groups;
		const diff = space ? space.value.length : 0;

		if (!operator || diff === 0) {
			return false;
		}

		this.reportAndFixRightSpace(loc, operator, type, diff);

		return true;
	}

	/**
	 * Handle return if operator.
	 * e.g. `return $test ? $true : $false;`
	 * e.g `return $test ?: $false;`
	 */
	retifCallback() {
		const { test, trueExpr, falseExpr } = this.node as AstReturnIf;

		const { loc: testLoc } = test;
		const { loc: falseLoc } = falseExpr;

		if (!trueExpr) {
			this.reportAndFixAroundSpaces(testLoc, falseLoc, '?:');
			return;
		}

		const { loc: trueLoc } = trueExpr;
		this.reportAndFixAroundSpaces(testLoc, trueLoc, '?');
		this.reportAndFixAroundSpaces(trueLoc, falseLoc, ':');
	}

	/**
	 * Handle binary operator 
	 * e.g. `$var > 1`, `$var === 1`, `$var >= $var2`
	 */
	binCallback() {
		const { type, left, right } = this.node as AstBin;
		const { loc: leftLoc } = left;
		const { loc: rightLoc } = right;

		// Handle `<>` operator. It is presented as `!=` in the AST
		const searchRange = {
			start: leftLoc.end,
			end: rightLoc.start,
		};
		const findNotEqual = findAhead(this.context.sourceLines, searchRange, '<>');
		if (!findNotEqual) {
			this.reportAndFixAroundSpaces(leftLoc, rightLoc, type);
			return;
		}

		this.reportAndFixAroundSpaces(leftLoc, rightLoc, '<>');
	}

	/**
	 * Check if operator must have an adjacent space.
	 * This function checks against the provided operator and
	 * current node kind.
	 *
	 * @param  {string}  operand   Operator to check
	 * @param  {string}  direction Direction to check
	 * @return {boolean}           True if operator must have an adjacent space
	 */
	isZeroSpace(operand: string, direction = 'both'): boolean {
		const { kind } = this.node;
		const isReference = kind !== 'bin' && operand === '&';
		const check = [kind === 'unary', kind === 'pre', kind === 'post', operand === '...', isReference];

		if (direction === 'left') {
			// : operand should not have a space to the left if it is a return type declaration
			check.push((kind === 'function' || kind === 'arrowfunc') && operand === ':');
		}

		return check.includes(true);
	}

	/**
	 * Report and fix space to the right of operator
	 *
	 * @param  {Loc}     rightLoc    Locaition of node to the right of operator
	 * @param  {Loc}     operatorLoc Locaition of operator
	 * @param  {string}  operand     Operator
	 * @param  {number}  diff        Number of spaces
	 * @return {boolean}             false if there was no report
	 */
	reportAndFixRightSpace(
		rightLoc: Loc,
		operatorLoc: Loc,
		operand: string,
		diff: number
	): boolean {
		const { report } = this.context;

		const isZeroSpace = this.isZeroSpace(operand);
		const isCorrectSpacing = (!isZeroSpace && diff === 1) || (isZeroSpace && diff === 0);

		if (rightLoc.start.line !== operatorLoc.end.line || isCorrectSpacing === true) {
			return false;
		}

		const position = {
			start: operatorLoc.end,
			end: {
				line: operatorLoc.end.line,
				column: operatorLoc.end.column + diff,
				offset: operatorLoc.end.offset + diff,
			},
		};

		let message = `Operator \`${operand}\` must have a single trailing space. Found ${diff} spaces.`;
		if (isZeroSpace === true) {
			message = `Operator \`${operand}\` must not have a trailing space. Found ${diff} spaces.`;
		}

		report({
			message,
			position,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(position, isZeroSpace === true ? '' : ' ');
			},
		});

		return true;
	}

	/**
	 * Report and fix space to the left of operator
	 *
	 * @param  {Loc}     leftLoc     Locaition of node to the left of operator
	 * @param  {Loc}     operatorLoc Locaition of operator
	 * @param  {string}  operand     Operator
	 * @param  {number}  diff        Number of spaces
	 * @return {boolean}             false if there was no report
	 */
	reportAndFixLeftSpace(leftLoc: Loc, operatorLoc: Loc, operand: string, diff: number): boolean {
		const { report } = this.context;

		const isZeroSpace = this.isZeroSpace(operand, 'left');
		const isCorrectSpacing = (!isZeroSpace && diff === 1) || (isZeroSpace && diff === 0);

		if (leftLoc.end.line !== operatorLoc.start.line || isCorrectSpacing === true) {
			return false;
		}

		const position = {
			start: {
				line: operatorLoc.start.line,
				column: operatorLoc.start.column - diff,
				offset: operatorLoc.start.offset - diff,
			},
			end: operatorLoc.start,
		};

		let message = `Operator \`${operand}\` must have a single leading space. Found ${diff} spaces.`;
		if (isZeroSpace === true) {
			message = `Operator \`${operand}\` must not have a leading space. Found ${diff} spaces.`;
		}

		report({
			message,
			position,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(position, isZeroSpace ? '' : ' ');
			},
		});

		return true;
	}

	/**
	 * Report and fix space around operator
	 *
	 * @param  {Loc}     leftLoc  Locaition of node to the left of operator
	 * @param  {Loc}     rightLoc Locaition of node to the right of operator
	 * @param  {string}  operand  Operator
	 * @return {boolean}          false if there was no re
	 */
	reportAndFixAroundSpaces(leftLoc: Loc, rightLoc: Loc, operand: string): boolean {
		const { sourceLines } = this.context;
		const searchRange = {
			start: leftLoc.end,
			end: rightLoc.start,
		};

		const skippedOperand = skipRegex(operand);
		const regex = new RegExp(`(?<spaceBefore>\\s*)(?<operator>${skippedOperand})(?<spaceAfter>\\s*)`, 'u');

		const operatorPosition = findAheadRegex(sourceLines, searchRange, regex);
		if (operatorPosition === false || operatorPosition.groups === undefined) {
			return false;
		}

		const { spaceBefore, operator, spaceAfter } = operatorPosition.groups;
		const leftDiff = spaceBefore ? spaceBefore.value.length : 0;
		const rightDiff = spaceAfter ? spaceAfter.value.length : 0;

		/* operator can not be undefined because it is
		* matched by the regex. However, we need to add 
		* this check since `groups` properties can be undefined 
		*/
		/* c8 ignore next 3 */
		if (!operator) {
			return false;
		}

		// Handle space before operator
		this.reportAndFixLeftSpace(leftLoc, operator, operand, leftDiff);

		// Handle space after operator
		this.reportAndFixRightSpace(rightLoc, operator, operand, rightDiff);

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
			description: 'Ensure consistent operators spacing',
			fixable: true,
			preset: 'psr',
		},
		severity: 'warning',
		name: 'spacing.operators',
		register: [
			'bin',
			'retif',
			'unary',
			'post',
			'pre',
			'parameter',
			'arrowfunc',
			'function',
		],
		bindClass: OperatorSpacing,

	};
};
