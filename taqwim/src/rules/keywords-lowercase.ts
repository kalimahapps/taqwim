/**
 * Check that PHP keywords are lowercase
 *
 * @see https://www.php-fig.org/psr/psr-12/#25-keywords-and-types
 */

import type {
	RuleContext,
	RuleDataOptional,
	Start,
	CallbacksMap,
	AllAstTypes,
	AstMethod,
	AstProperty,
	AstExpressionStatement,
	AstInclude,
	AstIf
} from '@taqwim/types';
import type Fixer from '@taqwim/fixer';
import { getOffsetFromLineAndColumn } from '@taqwim/utils';
import { WithCallMapping } from '@taqwim/decorators';

class Keywords {
	/**
	 * Rule context
	 */
	context = {} as RuleContext;

	/**
	 * Current node
	 */
	node = {} as AllAstTypes;

	/**
	 * Map of callbacks to call for each node kind
	 */
	callbacksMap: CallbacksMap = {
		expressionCallback: ['expressionstatement'],
		visibilityCallback: ['propertystatement', 'method'],
		kindCallback: [
			'foreach',
			'for',
			'echo',
			'function',
			'global',
			'switch',
			'case',
			'break',
			'return',
			'while',
			'do',
			'continue',
			'try',
			'catch',
			'throw',
			'new',
		],
		ifCallback: ['if'],
	};

	/**
	 * Handle if keywords (if, elseif, else)
	 */
	ifCallback() {
		const { node, sourceLines } = this.context;
		const { loc, shortForm, alternate, ifType } = node as AstIf;

		const hasElse = alternate?.ifType === 'else';

		// Check if keywords
		this.checkAndReportKeyword(ifType, sourceLines[loc.start.line], loc.start);

		if (hasElse) {
			this.checkAndReportKeyword('else', sourceLines[alternate.loc.start.line], alternate.loc.start);
		}

		if (shortForm) {
			this.checkAndReportKeyword(`end${ifType}`, sourceLines[loc.end.line], loc.end);
		}
	}

	/**
	 * Handle keywords that are the same as the node kind (like foreach, for, etc.)
	 */
	kindCallback() {
		const { node, sourceLines } = this.context;
		const { kind, loc, shortForm, test } = node;

		let keyword = kind;

		// method and function are the same keyword
		if (kind === 'method') {
			keyword = 'function';
		}

		// Handle `default` keyword for switch case
		if (kind === 'case' && test === null) {
			keyword = 'default';
		}

		this.checkAndReportKeyword(keyword, sourceLines[loc.start.line], loc.start);

		if (shortForm) {
			this.checkAndReportKeyword(`end${keyword}`, sourceLines[loc.end.line], loc.end);
		}
	}

	/**
	 * Handle property and method keywords (like public, private, etc.)
	 */
	visibilityCallback() {
		const { sourceLines } = this.context;
		const { visibility, loc, kind } = this.node as AstMethod & AstProperty;

		if (kind === 'method') {
			this.kindCallback();
		}

		if (!visibility) {
			return;
		}

		this.checkAndReportKeyword(visibility, sourceLines[loc.start.line], loc.start);
	}

	/**
	 * Handle expression keywords (like include, require, etc.)
	 *
	 * @return {boolean} true if the callback was processed, false otherwise
	 */
	expressionCallback(): boolean {
		const { expression, loc } = this.node as AstExpressionStatement;

		if (!expression) {
			return false;
		}

		const { kind, require, once } = expression as AstInclude;

		if (kind !== 'include') {
			return false;
		}

		let lookFor = 'include';
		if (require) {
			lookFor = 'require';
		}

		if (once) {
			lookFor += '_once';
		}

		this.checkAndReportKeyword(lookFor, loc.source ?? '', loc.start);

		return true;
	}

	/**
	 * Check that the keyword is lowercase amd report if it is not
	 *
	 * @param  {string}  keyword Keyword to check
	 * @param  {string}  source  Source code to check keyword in
	 * @param  {Start}   start   Start position of the keyword
	 * @return {boolean}         true if the report was created, false otherwise
	 */
	checkAndReportKeyword(keyword: string, source: string, start: Start): boolean {
		const { report, sourceLines } = this.context;
		const { loc } = this.node;
		const { source: locSource } = loc;

		const sourceToUse = source || locSource;
		if (sourceToUse === undefined) {
			return false;
		}

		// Check if the keyword is lowercase
		const keywordLength = keyword.length;
		const buildRegex = new RegExp(`${keyword}`, 'iu');
		const sourceKeywordMatch = sourceToUse.match(buildRegex);

		if (!sourceKeywordMatch) {
			return false;
		}

		const [sourceKeyword] = sourceKeywordMatch;
		if (keyword.toLowerCase() === sourceKeyword) {
			return false;
		}

		/**
		 * Typescript report that index is possibly undefined even though
		 * `g` flag is not used in the regex. 
		 *
		 * @see https://github.com/microsoft/TypeScript/issues/35157
		 */
		/* c8 ignore next 4 */
		const { index } = sourceKeywordMatch;
		if (index === undefined) {
			return false;
		}

		const { line: startLine } = start;
		const startOffset = getOffsetFromLineAndColumn(sourceLines, startLine, index);

		const range = {
			start: {
				line: startLine,
				column: index,
				offset: startOffset,
			},
			end: {
				line: startLine,
				column: index + keywordLength,
				offset: startOffset + keywordLength,
			},
		};

		// Keyword is not lowercase, report it
		report({
			message: `Keyword "${sourceKeyword}" must be lowercase`,
			position: range,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(range, sourceKeyword.toLowerCase());
			},
		});

		return true;
	}

	@WithCallMapping
	process(context: RuleContext): boolean {
		this.context = context;
		this.node = context.node;

		return true;
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that PHP keywords are lowercase',
			fixable: true,
			preset: 'psr',
		},
		severity: 'warning',
		name: 'keywords-lowercase',
		register: [
			'expressionstatement',
			'propertystatement',
			'method',
			'if',
			'foreach',
			'echo',
			'for',
			'function',
			'global',
			'switch',
			'case',
			'break',
			'return',
			'while',
			'do',
			'continue',
			'try',
			'catch',
			'throw',
			'new',
		],
		bindClass: Keywords,
	};
};
