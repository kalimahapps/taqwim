/**
 * Ensure that docblock tags tokens are spaced correctly
 */
/* eslint complexity: ["warn", 14] */

import type Fixer from '@taqwim/fixer';
import type { RuleContext, RuleDataOptional } from '@taqwim/types';

import Parser from '@kalimahapps/docblock-parser';
import type {
	Docblock,
	DocblockParserOptions,
	DocblockPosition,
	DocblockTag
} from '@kalimahapps/docblock-parser/dist/types';
import { findAheadRegex } from '@taqwim/utils';

class TagSpacing {
	/**
	 * The parsed docblock
	 */
	parsedDocblock: Docblock = {} as Docblock;

	/**
	 * Context
	 */
	context = {} as RuleContext;

	/**
	 * Group tags that are separated by a blank line
	 *
	 * @return {DocblockTag[][]} An array of tag groups
	 */
	getTagGroups(): DocblockTag[][] {
		const groupTags = [];
		let lastTag: DocblockTag;
		let group: DocblockTag[] = [];

		this.parsedDocblock.tags.forEach((tag) => {
			// If there is no last tag, add the current tag to the group
			if (!lastTag) {
				group.push(tag);
				lastTag = tag;
				return;
			}

			const { position: lastTagPosition } = lastTag;
			const { position: tagPosition } = tag;

			// Check if the next tag is on a new line
			if (lastTagPosition.end.line + 1 === tagPosition.start.line) {
				group.push(tag);
			} else {
				groupTags.push(group);

				// Reset the group with the current tag
				group = [tag];
			}

			lastTag = tag;
		});

		groupTags.push(group);

		return groupTags;
	}

	/**
	 * Check if the tag is aligned with the longest tag
	 *
	 * @param {DocblockTag} tag        The tag to check
	 * @param {number}      maxColumns The maximum number of columns
	 */
	reportAndFixDescriptionAlign(tag: DocblockTag, maxColumns: number) {
		const { report, sourceLines } = this.context;
		const { name: tagName, description, descriptor, type } = tag;

		description.forEach((line, index) => {
			const { position, value } = line;
			const { start, end } = position;

			// Check which part of the docblock line is available to extract end position,
			// Try to name, type and descriptor
			const hasType = type.value.trim() !== '';
			const hasDescriptor = descriptor.value.trim() !== '';

			let element = tagName;

			if (hasType) {
				element = type;
			}

			if (hasDescriptor) {
				element = descriptor;
			}

			let startColumn = element.position.end.column;
			let startOffset = element.position.end.offset;

			// For multiline descriptions, find the asterisk position
			// to account for leading spaces since the description position
			// does not include the leading spaces
			if (index > 0) {
				const findDescriptionStart = findAheadRegex(
					sourceLines,
					{
						start: {
							line: start.line,
							column: 0,
						},
						end,
					},
					/^\s*\*/u
				);

				if (!findDescriptionStart) {
					return;
				}

				startColumn = findDescriptionStart.end.column;
				startOffset = findDescriptionStart.end.offset;
			}

			// eslint-disable-next-line jsdoc/no-bad-blocks
			/*
			 * + 1 is added to the maxColumns to account for the space between the tag
			 * and the description. Also, for multiline descriptions, it accounts for
			 * the space between the asterisk and the tag.
			 *
			 * Example:
			 *
			 * @param {string} name{+1}The name of the parameter that
			 *{+1}                     is being passed
			 */
			const requiredSpaces = maxColumns - startColumn + 1;

			// Is the tag spaced correctly?
			// We check for `start.column` and not `startColumn` because the
			// `start.column` is the actual column number without the leading spaces
			const isSpaced = maxColumns + 1 === start.column;
			if (requiredSpaces === 0 || isSpaced) {
				return;
			}

			const replacePosition = {
				start: {
					line: start.line,
					column: startColumn,
					offset: startOffset,
				},
				end,
			};

			report({
				message: `Docblock tag "${tagName.value}" is not aligned`,
				position: replacePosition,
				fix: (fixer: Fixer) => {
					const padLength = requiredSpaces + value.trim().length;
					const descriptionLine = value.trim().padStart(padLength);

					return fixer.replaceRange(replacePosition, descriptionLine);
				},
			});
		});
	}

	/**
	 * Find the maximum column of the description of all tags.
	 *
	 * We don't check the start of description, since whitespace is not
	 * accounted for in the position. Instead the function checks for the end
	 * column of the tag descriptor (or type if no descriptor is present),
	 *
	 * @param  {number[]}    accumulator An array of column numbers
	 * @param  {DocblockTag} tag         The current tag
	 * @return {number[]}                An array of column numbers
	 */
	getDescriptionStarts(accumulator: number[], tag: DocblockTag): number[] {
		const { descriptor, type, name } = tag;
		const hasDescriptor = descriptor.value.trim() !== '';
		const hasType = type.value.trim() !== '';

		let element = name;

		if (hasType) {
			element = type;
		}
		if (hasDescriptor) {
			element = descriptor;
		}

		const startColumn = element.position.end.column;

		return [...accumulator, startColumn];
	}

	/**
	 * Callback to find the maximum column of the variable of all tags.
	 *
	 * @param  {number[]}    accumulator An array of column numbers
	 * @param  {DocblockTag} tag         The current tag
	 * @return {number[]}                An array of column numbers
	 */
	getVariableStarts(accumulator: number[], tag: DocblockTag): number[] {
		const { descriptor } = tag;
		if (descriptor.value.trim() === '') {
			return accumulator;
		}
		const startColumn = descriptor.position.start.column;

		return [...accumulator, startColumn];
	}

	/**
	 * Report and fix the spacing between different parts of the tag
	 *
	 * @param {DocblockPosition} left  The position of the left side
	 * @param {DocblockPosition} right The position of the right side
	 * @param {string}           token The tag token
	 */
	reportAndFixSpace(left: DocblockPosition, right: DocblockPosition, token: string) {
		const { report } = this.context;
		const foundSpace = right.start.offset - left.end.offset;

		if (foundSpace !== 1) {
			const position = {
				start: left.end,
				end: right.start,
			};

			report({
				message: `There must be a single space after tag ${token}. Found ${foundSpace} spaces`,
				position,
				fix: (fixer: Fixer) => {
					return fixer.replaceRange(position, ' ');
				},
			});
		}
	}

	/**
	 * Ensure that there is a single space between
	 * different parts of the tag
	 *
	 * @param {DocblockTag} tag     The tag to check
	 * @param {boolean}     isAlign If true, then only check of tag name spacing,
	 *                              because other parts are handled by align function
	 */
	processMultiSpaces(tag: DocblockTag, isAlign = false) {
		const { name: tagName, description, descriptor, type } = tag;

		// Check if the tag is spaced correctly
		const { position: namePosition } = tagName;
		const { position: typePosition, value: typeValue } = type;
		const { position: descriptorPosition, value: descriptorValue } = descriptor;

		const firstLine = description[0] ?? {
			value: '',
			position: {
				start: {
					line: 0,
					column: 0,
					offset: 0,
				},
				end: {
					line: 0,
					column: 0,
					offset: 0,
				},
			},
		};

		const { position: descriptionPosition, value: descriptionValue } = firstLine;

		const hasType = typeValue.trim() !== '';
		const hasDescriptor = descriptorValue.trim() !== '';
		const hasDescription = descriptionValue.trim() !== '';

		// Check space between name and type/descriptor/description
		let rightPosition;

		// Only check for description if align is not enabled
		// Because it is handled by align function
		if (hasDescription && isAlign === false) {
			rightPosition = descriptionPosition;
		}

		if (hasDescriptor) {
			rightPosition = descriptorPosition;
		}

		if (hasType) {
			rightPosition = typePosition;
		}

		if (rightPosition) {
			this.reportAndFixSpace(namePosition, rightPosition, 'name');
		}

		if (isAlign) {
			return;
		}

		// Check space between type and descriptor
		if (hasDescriptor && hasDescription) {
			this.reportAndFixSpace(descriptorPosition, descriptionPosition, 'descriptor');
		}

		// Check space between type and descriptor/description
		if (hasType && (hasDescriptor || hasDescription)) {
			const rightPosition = hasDescriptor ? descriptorPosition : descriptionPosition;
			this.reportAndFixSpace(typePosition, rightPosition, 'type');
		}
	}

	/**
	 * Report and fix the alignment of the variable
	 *
	 * @param {DocblockTag} tag        The tag to check
	 * @param {number}      maxColumns The maximum number of columns
	 */
	reportAndFixVariableAlign(tag: DocblockTag, maxColumns: number) {
		const { report } = this.context;
		const { name: tagName, descriptor } = tag;

		if (tagName.value !== '@param') {
			return;
		}

		const variableStartColumn = descriptor.position.start.column;
		if (variableStartColumn === maxColumns) {
			return;
		}

		const requiredSpaces = maxColumns - variableStartColumn;
		const { position, value } = descriptor;

		report({
			message: `Docblock tag "${tagName.value}" is not aligned`,
			position,
			fix: (fixer: Fixer) => {
				const padLength = requiredSpaces + value.trim().length;
				const descriptionLine = value.trim().padStart(padLength);

				return fixer.replaceRange(position, descriptionLine);
			},
		});
	}

	/**
	 * Process the groups of tags
	 *
	 * @param {DocblockTag[]} group The group of tags
	 */
	processTagGroups(group: DocblockTag[]) {
		const descColumns = group.reduce(this.getDescriptionStarts, [] as number[]);

		// Find the maximum start column of the description of all tags
		const descMaxColumns = Math.max(...descColumns);

		const variableColumns = group.reduce(this.getVariableStarts, [] as number[]);

		// Loop through all tags and check if they are aligned
		// to the maximum column
		group.forEach((tag) => {
			if (variableColumns.length > 0) {
				const variableMaxColumns = Math.max(...variableColumns);
				this.reportAndFixVariableAlign(tag, variableMaxColumns);
			}
			this.processMultiSpaces(tag, true);
			this.reportAndFixDescriptionAlign(tag, descMaxColumns);
		});
	}

	/**
	 * Process the rule
	 *
	 * @param {RuleContext} context The rule context
	 */
	process(context: RuleContext) {
		this.context = context;
		const { node, options } = context;
		const { leadingComments } = node;

		leadingComments.forEach((docblock) => {
			const { loc: commentLoc, value: docblockString } = docblock;

			// Make sure the comment is a docblock
			if (!docblockString.trim().startsWith('/**')) {
				return;
			}

			/**
			 * Offset the position of the docblock to the start of the comment
			 */
			const parserOptions: DocblockParserOptions = {
				line: commentLoc.start.line,
				count: commentLoc.start.offset,
			};

			this.parsedDocblock = new Parser().parse(docblockString, parserOptions);

			if (this.parsedDocblock.tags.length === 0) {
				return;
			}

			if (options.align === false) {
				this.parsedDocblock.tags.forEach((tag) => {
					return this.processMultiSpaces(tag);
				});
				return;
			}

			const tagGroups = this.getTagGroups();

			tagGroups.forEach(this.processTagGroups.bind(this));
		});
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure consistent spacing for docblock tags tokens',
			preset: 'docblock',
			fixable: true,
		},
		name: 'spacing',
		defaultOptions: {
			align: {
				type: 'boolean',
				description: 'Align variables and descriptions',
				default: false,
			},
		},
		register: ['function', 'method', 'class', 'interface', 'trait'],
		bindClass: TagSpacing,
	};
};
