/**
 * Ensure that last trailing comma is consistent in arrays
 */
/* eslint complexity: ["warn", 7] */
import type {
	RuleDataOptional,
	RuleContext,
	AstArray,
	Loc,
	RangeMatchType
} from '@taqwim/types';
import { findAheadRegex } from '@taqwim/utils';

class CommaDangle {
	/**
	 * Rule context
	 */
	context = {} as RuleContext;

	/**
	 * Report and fix comma dangle if needed
	 *
	 * @param {RangeMatchType} commaPosition Comma details from findAheadRegex
	 * @param {Loc}            itemLoc       Last item location
	 * @param {string}         option        Option to compare with
	 */
	reportAndFixComma(commaPosition: RangeMatchType, itemLoc: Loc, option: string) {
		const { report } = this.context;

		const isComma = commaPosition.value === ',';

		// Check if comma dangle needs to be reported based
		// on provided options and current state
		const shouldReportMissing = option === 'always' && isComma === false;
		const shouldReportUnexpected = option === 'never' && isComma === true;

		if (!shouldReportMissing && !shouldReportUnexpected) {
			return;
		}

		const message = shouldReportUnexpected ? 'Unexpected trailing comma' : 'Expecting a trailing comma';

		let position: Loc = commaPosition;
		if (shouldReportMissing) {
			position = {
				start: itemLoc.end,
				end: itemLoc.end,
			};
		}
		report({
			message,
			position,
			fix(fixer) {
				if (shouldReportUnexpected) {
					return fixer.removeRange(position);
				}

				return fixer.after(position, ',');
			},
		});
	}

	/**
	 * Process the rule
	 *
	 * @param  {RuleContext} context Rule context
	 * @return {boolean}             True if the rule was applied
	 */
	process(context: RuleContext): boolean {
		this.context = context;
		const { node, options, sourceLines } = context;
		const { loc, items } = node as AstArray;

		if (items.length === 0) {
			return false;
		}

		const { singleLine, multiLine } = options;
		const isSingleLine = loc.start.line === loc.end.line;

		const lastItem = items.at(-1);
		if (!lastItem) {
			return false;
		}

		const commaPosition = findAheadRegex(
			sourceLines,
			{
				start: lastItem.loc.end,
				end: loc.end,
			},
			/\S/u
		);

		if (commaPosition === false) {
			return false;
		}

		this.reportAndFixComma(commaPosition, lastItem.loc, isSingleLine ? singleLine : multiLine);

		return true;
	}
}

export default (): RuleDataOptional => {
	const oneOf = [
		{
			type: 'string',
			const: 'always',
			description: 'Ensure that comma dangle are present',
		},
		{
			type: 'string',
			const: 'never',
			description: 'Ensure that comma dangle are not present',
		},
	];

	return {
		meta: {
			description: 'Ensure that trailing commas are consistent in arrays',
			fixable: true,
			preset: 'taqwim',
		},
		severity: 'warning',
		name: 'array.comma-dangle',
		defaultOptions: {
			singleLine: {
				type: 'string',
				default: 'never',
				description: 'Set the type of comma dangle in single-line arrays',
				oneOf,
			},
			multiLine: {
				type: 'string',
				default: 'always',
				description: 'Set the type of comma dangle in multi-line arrays',
				oneOf,
			},
		},
		register: ['array'],
		bindClass: CommaDangle,
	};
};
