/**
 * Handle accessor `->` and `::` spacing
 */
import { findAheadRegex } from '@taqwim/utils/index';
import type {
	AllAstTypes,
	AstLookup,
	End,
	Loc,
	RuleContext,
	RuleDataOptional,
	Start
} from '@taqwim/types';
import type Fixer from '@taqwim/fixer';

class AccessorSpacing {
	/**
	 * The context of the rule
	 */
	context = {} as RuleContext;

	/**
	 * The node of the rule
	 */
	node = {} as AllAstTypes;

	/**
	 * Report space.
	 *
	 * @param {Loc}    leftLoc   The position of the left node
	 * @param {Loc}    rightLoc  The position of the right node
	 * @param {string} spaceType The type of space to report
	 */
	reportAndFixSpace(leftLoc: Loc, rightLoc: Loc, spaceType = 'leading') {
		const { report } = this.context;
		const { kind } = this.node as AstLookup;

		// Process only if on the same line
		if (leftLoc.end.line !== rightLoc.start.line) {
			return;
		}
		const diff = rightLoc.start.offset - leftLoc.end.offset;
		const requiredSpace = 0;

		if (diff === requiredSpace) {
			return;
		}

		const position = {
			start: leftLoc.end,
			end: rightLoc.start,
		};

		const operator = kind === 'propertylookup' ? '->' : '::';
		const message = `Accessor operator \`${operator}\` must not have a ${spaceType} space. Found ${diff} spaces`;

		report({
			message,
			position,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(position, '');
			},
		});
	}

	/**
	 * Get the position of the accessor operator
	 *
	 * @param  {Start}       start The start position
	 * @param  {End}         end   The end position
	 *
	 * @return {false | Loc}       The position of the accessor operator
	 *                             or false if not found
	 */
	getAccessorLoc(start: Start, end: End): false | Loc {
		const { sourceLines } = this.context;
		const accessorPosition = findAheadRegex(
			sourceLines,
			{
				start,
				end,
			},
			/(?:->|::)/u
		);

		if (!accessorPosition) {
			return false;
		}

		return accessorPosition;
	}

	/**
	 * Entry point of the rule processing
	 *
	 * @param {RuleContext} context The context of the rule
	 */
	process(context: RuleContext) {
		this.context = context;
		this.node = context.node;

		const { what, offset } = this.node as AstLookup;

		const { loc: whatLoc } = what;
		const { loc: offsetLoc } = offset;

		// Check for  spaces if on the same line
		// if (whatLoc.end.line === offsetLoc.start.line) {
		const accessorLoc = this.getAccessorLoc(whatLoc.end, offsetLoc.start);
		if (accessorLoc) {
			this.reportAndFixSpace(whatLoc, accessorLoc);
			this.reportAndFixSpace(accessorLoc, offsetLoc);
		}

		// }
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure consistent accessor `->` spacing.',
			fixable: true,
			preset: 'psr',
		},
		severity: 'warning',
		name: 'spacing.accessor',
		register: ['propertylookup', 'staticlookup'],
		bindClass: AccessorSpacing,
	};
};
