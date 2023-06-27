/**
 * Handle type spacing.
 * e.g. `function foo(): void {}`
 * e.g. `function foo(string $bar, int $baz): void {}`
 */

import { findAheadRegex } from '@taqwim/utils/index';
import type {
	AllAstTypes,
	AstMethod,
	AstParameter,
	CallbacksMap,
	Loc,
	RuleContext,
	RuleDataOptional
} from '@taqwim/types';
import type Fixer from '@taqwim/fixer';
import { WithCallMapping } from '@taqwim/decorators';
class TypesSpacing {
	/**
	 * The context of the rule
	 */
	context = {} as RuleContext;

	node = {} as AllAstTypes;

	callbacksMap: CallbacksMap = {
		parameterCallback: ['parameter'],
		methodCallback: ['method', 'function'],
	};

	/**
	 * Handle function and method type spacing
	 */
	/* eslint complexity: ["warn", 13] */
	methodCallback() {
		const { sourceLines } = this.context;
		const { type, name } = this.node as AstMethod;
		if (!type || !name || typeof name === 'string') {
			return;
		}

		const searchRange = {
			start: name.loc.start,
			end: type.loc.end,
		};

		const typePosition = findAheadRegex(
			sourceLines,
			searchRange,
			/(?<colonSpace>\s*)(?<colon>:)\s*(?<nullableMark>\?*)(?<nullableSpace>\s*)(?<type>.+)$/u
		);

		if (typePosition === false || typePosition?.groups === undefined) {
			return;
		}

		const {
			colonSpace,
			colon,
			nullableMark,
			nullableSpace,
			type: typeString,
		} = typePosition.groups;

		if (nullableSpace && nullableMark && typeString) {
			this.reportAndFixLeadingSpace(nullableMark, typeString, true);
		}

		if (!colon) {
			return;
		}

		if (colonSpace) {
			// Adjust colonspace position. Both start and end point 
			// to the same position (the start position). This is
			// because the report function counts from the end of the
			// range, but it should count from the start of the range.
			const colonSpacePosition = {
				start: colonSpace.start,
				end: colonSpace.start,
			};
			this.reportAndFixLeadingSpace(colonSpacePosition, colon, true);
		}

		if (nullableMark) {
			this.reportAndFixLeadingSpace(colon, nullableMark);
			return;
		}

		if (typeString) {
			this.reportAndFixLeadingSpace(colon, typeString);
		}
	}

	/**
	 * Handle parameter type spacing
	 *
	 * @return {boolean} false if the method was stopped
	 */
	parameterCallback(): boolean {
		const { sourceLines } = this.context;
		const { type, name, nullable, loc } = this.node as AstParameter;

		if (!type || !name || typeof name === 'string') {
			return false;
		}

		// Fix the space between the type and the name
		this.reportAndFixTrailingSpace(type.loc, name.loc);

		// If the type is nullable, fix the space between the question mark and the type
		if (nullable !== true) {
			return false;
		}

		const questionMarkPosition = findAheadRegex(sourceLines, loc, /\?/u);
		if (questionMarkPosition === false) {
			return false;
		}

		this.reportAndFixTrailingSpace(questionMarkPosition, type.loc, true);

		return true;
	}

	/**
	 * Remove any leading space before a semicolon or colon
	 *
	 * @param {Loc}     leftLoc     The position of the left node
	 * @param {Loc}     rightLoc    The position of the right node
	 * @param {boolean} forNullable Whether the space is for the nullable mark
	 */
	reportAndFixTrailingSpace(leftLoc: Loc, rightLoc: Loc, forNullable = false) {
		const { report } = this.context;

		const diff = rightLoc.start.offset - leftLoc.end.offset;
		const requiredSpace = forNullable ? 0 : 1;
		if (diff === requiredSpace) {
			return;
		}

		const position = {
			start: leftLoc.end,
			end: rightLoc.start,
		};

		let message = `Type must have a single trailing space. Found ${diff} spaces`;
		if (forNullable) {
			message = `Nullable type must not have a space between the question mark and the type. Found ${diff} spaces`;
		}

		report({
			message,
			position,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(position, forNullable ? '' : ' ');
			},
		});
	}

	/**
	 * Report leading space.
	 * Type and colon must have a single leading space.
	 * Colon must not have a leading space.
	 *
	 * @param {Loc}     leftLoc  The position of the left node
	 * @param {Loc}     rightLoc The position of the right node
	 * @param {boolean} forColon Whether checking for colon
	 */
	reportAndFixLeadingSpace(leftLoc: Loc, rightLoc: Loc, forColon = false) {
		const { report } = this.context;

		const diff = rightLoc.start.offset - leftLoc.end.offset;
		const requiredSpace = forColon ? 0 : 1;

		if (diff === requiredSpace) {
			return;
		}

		const position = {
			start: leftLoc.end,
			end: rightLoc.start,
		};

		let message = `Type must have a single leading space. Found ${diff} spaces`;
		if (forColon) {
			message = `Colon must not have leading space. Found ${diff} spaces`;
		}

		report({
			message,
			position,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(position, forColon ? '' : ' ');
			},
		});
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
			description: 'Ensure consistent types spacing.',
			fixable: true,
			preset: 'psr',
		},
		severity: 'warning',
		name: 'spacing.types',
		register: ['parameter', 'function', 'method'],
		bindClass: TypesSpacing,
	};
};
