/**
 * Break method, function, method call and constructor call parameters into
 * multiple lines or group them into a single line based on the position
 * of the first item
 */
import type {
	AstCall,
	AstMethod,
	AstParameter,
	MatchType,
	RuleContext,
	RuleDataOptional
} from '@taqwim/types';
import { findAheadRegex } from '@taqwim/utils';

class MethodParametersLineBreak {
	/**
	 * Rule context
	 */
	context = {} as RuleContext;

	/**
	 * Get the end location of the item based on either
	 * next item or (if not provided) the end of the node
	 *
	 * @param  {AstParameter}    item     Current item
	 * @param  {AstParameter}    nextItem Next item
	 * @return {MatchType|false}          End location of the item
	 */
	getItemEndLocation(item: AstParameter, nextItem?: AstParameter) : MatchType | false {
		if (nextItem) {
			return nextItem.loc.start;
		}

		const { node, sourceLines } = this.context;
		const { body, kind, loc } = node as AstMethod;

		let findEndLoc = loc.end;

		if (kind === 'function' || kind === 'method') {
			const {	loc: bodyLoc } = body;
			findEndLoc = bodyLoc.start;
		}

		const findParenPosition = findAheadRegex(sourceLines, {
			start: item.loc.end,
			end: findEndLoc,
		}, /\s*\)/u);

		if (findParenPosition === false) {
			return false;
		}
		return findParenPosition.start;
	}

	/**
	 * Break parameters into multiple lines
	 *
	 * @param {AstParameter} items Parameters to process
	 */
	reportAndFixBreaking(items: AstParameter[]) {
		const { report } = this.context;

		for (const [index, item] of items.entries()) {
			const { loc } = item;
			const nextItem = items[index + 1];
			const endLoc = this.getItemEndLocation(item, nextItem);

			if (endLoc === false) {
				continue;
			}

			// If current item and the next item are not on the same line
			// then there is no need to add a line break
			if (loc.end.line !== endLoc.line) {
				continue;
			}

			const fixPoisition = {
				start: loc.end,
				end: endLoc,
			};

			report({
				message: 'There should be a line break after this parameter.',
				position: {
					start: {
						line: loc.end.line,
						column: loc.end.column - 2,
						offset: loc.end.offset - 2,
					},
					end: {
						line: loc.end.line,
						column: loc.end.column,
						offset: loc.end.offset,
					},
				},
				fix(fixer) {
					return fixer.after(fixPoisition, '\n');
				},
			});
		}
	}

	/**
	 * Group parameters into a single line
	 *
	 * @param {AstParameter[]} items Parameters to process
	 */
	/* eslint complexity: ["error", 7] */
	reportAndFixGrouping(items: AstParameter[]) {
		const { report, sourceLines, sourceCode } = this.context;

		for (const [index, item] of items.entries()) {
			const { loc } = item;
			const nextItem = items[index + 1];
			const endLoc = this.getItemEndLocation(item, nextItem);
			if (endLoc === false) {
				continue;
			}

			if (loc.end.line === endLoc.line) {
				continue;
			}

			const lastLine = sourceLines[loc.end.line];
			const postItemContent = lastLine.slice(loc.end.column);

			// Check for comma after the item, because last item might not
			// have a dangling comma
			const hasComma = postItemContent.match(/\s*,/u);
			const commaIndex = hasComma?.index === undefined ? 0 : hasComma.index + 1;

			const fixerPosition = {
				start: {
					line: loc.end.line,
					column: loc.end.column + commaIndex,
					offset: loc.end.offset + commaIndex,
				},
				end: endLoc,
			};

			// Make sure that the content removed in fixer is only whitespace
			const contentToReplace = sourceCode.slice(
				fixerPosition.start.offset,
				fixerPosition.end.offset
			);

			const isOnlyWhitespace = contentToReplace.trim() === '';
			if (!isOnlyWhitespace) {
				continue;
			}

			report({
				message: 'There should not be a line break after this parameter.',

				// Show the message at the end of the parameter
				position: {
					start: {
						line: loc.end.line,
						column: loc.end.column - 2,
						offset: loc.end.offset - 2,
					},
					end: {
						line: loc.end.line,
						column: loc.end.column + commaIndex,
						offset: loc.end.offset + commaIndex,
					},
				},
				fix(fixer) {
					return fixer.replaceRange(fixerPosition, ' ');
				},
			});
		}
	}

	/**
	 * Process the rule
	 *
	 * @param {RuleContext} context Rule context
	 */
	process (context: RuleContext) {
		this.context = context;
		const { node } = context;
		const { arguments: parameters, loc, kind } = node as AstMethod;

		if (parameters.length === 0) {
			return;
		}

		const firstItem = parameters[0];
		let startLoc = loc.start;
		if (kind === 'call') {
			const { what } = node as unknown as AstCall;
			startLoc = what.loc.end;
		}

		const isSameLine = startLoc.line === firstItem.loc.start.line;
		if (isSameLine !== true) {
			this.reportAndFixBreaking(parameters);
			return;
		}

		// If the declaration is on the same line then no need to process
		if ((kind === 'call' || kind === 'new') &&
			loc.start.line === loc.end.line) {
			return;
		}
		this.reportAndFixGrouping(parameters);
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Break parameters into multiple lines or group them into a single line based on the position of the first parameter.',
			fixable: true,
			preset: 'taqwim',
		},
		name: 'method.parameters-linebreak',
		register: ['method', 'function', 'call', 'new'],
		bindClass: MethodParametersLineBreak,
	};
};
