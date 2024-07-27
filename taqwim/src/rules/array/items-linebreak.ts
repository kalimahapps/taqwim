/**
 * Break array items into multiple lines or group them into a single line
 * based on the position of the first item
 */
import type { AstArray, RuleContext, RuleDataOptional } from '@taqwim/types';
class ArrayItemsLineBreak {
	/**
	 * Rule context
	 */
	context = {} as RuleContext;

	/**
	 * Break array items into multiple lines
	 *
	 * @param {AstArray['items']} items Array items to process
	 */
	reportAndFixBreaking(items: AstArray['items']) {
		const { report, node } = this.context;
		const { loc: arrayLoc } = node as AstArray;

		for (const [index, item] of items.entries()) {
			const { loc } = item;
			const nextItem = items[index + 1];
			let endLoc = nextItem?.loc.start;
			if (endLoc === undefined) {
				// -1 to remove location of ) or ] from the end of the array
				endLoc = {
					line: arrayLoc.end.line,
					column: arrayLoc.end.column - 1,
					offset: arrayLoc.end.offset - 1,
				};
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
				message: 'There should be a line break after this item.',
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
	 * Group array items into a single line
	 *
	 * @param {AstArray['items']} items Array items to process
	 */
	reportAndFixGrouping(items: AstArray['items']) {
		const { report, sourceLines, node, sourceCode } = this.context;
		const { loc: arrayLoc } = node as AstArray;
		for (const [index, item] of items.entries()) {
			const { loc } = item;
			const nextItem = items[index + 1];
			let endLoc = nextItem?.loc.start;
			if (endLoc === undefined) {
				// -1 to remove location of ) or ] from the end of the array
				endLoc = {
					line: arrayLoc.end.line,
					column: arrayLoc.end.column - 1,
					offset: arrayLoc.end.offset - 1,
				};
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
				message: 'There should not be a line break after this item.',

				// Show the message at the end of the item
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
		const { items, loc: arrayLoc } = node as AstArray;

		if (items.length === 0) {
			return;
		}

		const firstItem = items[0];
		const isSameLine = arrayLoc.start.line === firstItem.loc.start.line;

		if (isSameLine !== true) {
			this.reportAndFixBreaking(items);
			return;
		}

		// If array start and end lines are on the same line
		// then there is no need to group them into a single line
		// as it will be a single line array
		if (arrayLoc.start.line === arrayLoc.end.line) {
			return;
		}
		this.reportAndFixGrouping(items);
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Break array items into multiple lines or group them into a single line based on the position of the first item',
			fixable: true,
			preset: 'taqwim',
		},
		name: 'array.items-linebreak',
		register: ['array'],
		bindClass: ArrayItemsLineBreak,
	};
};
