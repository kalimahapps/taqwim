/**
 * Ensure that pair operator `=>` have consistent spacing.
 */

import type Fixer from '@taqwim/fixer';
import type {
	RuleDataOptional,
	RuleContext,
	AllAstTypes,
	AstArray,
	AstList,
	AstEntry,
	Loc,
	AstMatch,
	AstMatchArm
} from '@taqwim/types';
import { findAheadRegex } from '@taqwim/utils';

class AssignmentAlign {
	/**
	 * Rule context
	 */
	context = {} as RuleContext;

	/**
	 * Current node
	 */
	node = {} as AllAstTypes;

	/**
	 * Get operator position
	 *
	 * @param  {Loc}       searchRange Search range
	 * @return {Loc|false}             Operator position or false if not found
	 */
	getOperatorPosition(searchRange: Loc): Loc | false {
		const { sourceLines } = this.context;

		const operatorPosition = findAheadRegex(
			sourceLines,
			searchRange,
			/(?<operator>=>)/u
		);

		if (operatorPosition === false || operatorPosition?.groups?.operator === undefined) {
			return false;
		}

		return operatorPosition.groups.operator;
	}

	/**
	 * Report and fix space to the right of operator
	 *
	 * @param  {AstEntry} node Node to report
	 * @return {boolean}       false if there was no report
	 */
	reportTraillingSpace(node: AstEntry | AstMatchArm): boolean {
		const { report } = this.context;

		const { loc } = node;
		const { loc: entryLoc } = (node as AstEntry).value ?? (node as AstMatchArm).body;
		const operatorPosition = this.getOperatorPosition(loc);
		if (operatorPosition === false) {
			return false;
		}

		const foundSpace = entryLoc.start.column - operatorPosition.end.column;
		const isCorrectSpacing = foundSpace === 1;

		if (entryLoc.start.line !== operatorPosition.end.line || isCorrectSpacing === true) {
			return false;
		}

		const position = {
			start: operatorPosition.end,
			end: {
				line: operatorPosition.end.line,
				column: operatorPosition.end.column + foundSpace,
				offset: operatorPosition.end.offset + foundSpace,
			},
		};

		report({
			message: `Operator \`=>\` must have a single trailing space. Found ${foundSpace} spaces.`,
			position,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(position, ' ');
			},
		});

		return true;
	}

	/**
	 * Get list of entries and filter out the null keys
	 *
	 * @return {AstEntry[]} List of entries
	 */
	getEntries(): AstEntry[] {
		const { items } = this.node as AstArray | AstList;
		if (items.length === 0) {
			return [];
		}

		const entries: AstEntry[] = [];
		items.forEach((item) => {
			const { key } = item as AstEntry;
			if (!key) {
				return;
			}
			entries.push(item as AstEntry);
		});

		return entries;
	}

	/**
	 * Report and fix space to the left of operator
	 *
	 * @param {AstEntry} node Node to report
	 */
	reportLeadingSpace(node: AstEntry) {
		const { report } = this.context;

		const { key, loc } = node;
		const operatorPosition = this.getOperatorPosition(loc);
		if (operatorPosition === false || !key) {
			return;
		}

		const { end: keyEnd } = key.loc;
		const { start } = operatorPosition;

		// Make sure key and operator are on the same line
		if (keyEnd.line !== start.line) {
			return;
		}

		const foundSpaces = start.column - keyEnd.column;
		if (foundSpaces === 1) {
			return;
		}

		const position = {
			start: keyEnd,
			end: start,
		};

		report({
			message: `Operator \`=>\` must have a single leading space. Found ${foundSpaces} spaces.`,
			position,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(position, ' ');
			},
		});
	}

	/**
	 * Loop through all conds and return the loc 
	 * of the last conds. In other words, if the conds
	 * are on multiple lines, then return the loc of the
	 * last conds.
	 *
	 * @param  {AstMatchArm} matchArm Node to check
	 * @return {Loc|false}            Loc of the last conds or false if not found
	 */
	getCondLoc(matchArm: AstMatchArm): Loc | false {
		const { conds, loc } = matchArm;

		// If null, it means its default
		if (!conds) {
			return {
				start: loc.start,
				end: {
					line: loc.start.line,
					column: loc.start.column + 7,
					offset: loc.start.offset + 7,
				},
			};
		}

		const lastCond = conds.at(-1);

		if (!lastCond) {
			return false;
		}

		const position = {
			start: lastCond.loc.start,
			end: lastCond.loc.end,
		};

		for (const cond of conds) {
			const { loc } = cond;
			if (loc.start.line === lastCond.loc.start.line) {
				position.start = loc.start;
				break;
			}
		}

		return position;
	}

	/**
	 * Report and fix space to the left of operator for multi-line arrays and lists
	 *
	 * @param {AstMatchArm} matchArm       Node to report
	 * @param {number}      expectedLength Expected length of the left side
	 */
	reportMultiLeadingSpaceMatch(matchArm: AstMatchArm, expectedLength: number) {
		const { report, sourceLines, sourceCode } = this.context;
		const { loc } = matchArm;
		const operatorPosition = this.getOperatorPosition(loc);

		const condsLoc = this.getCondLoc(matchArm);
		if (operatorPosition === false || condsLoc === false) {
			return;
		}

		const { end: condsEnd, start: condsStart } = condsLoc;
		const keyLength = condsEnd.column - condsStart.column;

		if (keyLength === expectedLength) {
			return;
		}

		const { start } = operatorPosition;

		const requiredSpaces = expectedLength - keyLength;
		const foundSpaces = start.column - condsEnd.column;

		if (foundSpaces === requiredSpaces) {
			return;
		}

		report({
			message: `Operator \`=>\` must have ${requiredSpaces} leading spaces. Found ${foundSpaces} spaces.`,
			position: {
				start: condsEnd,
				end: start,
			},

			fix: (fixer: Fixer) => {
				const condsLine = sourceLines.at(condsStart.line);
				if (!condsLine) {
					return sourceCode;
				}

				const condsString = condsLine.slice(condsStart.column, condsEnd.column);
				const name = condsString.padEnd(expectedLength, ' ');

				const replaceRange = {
					start: condsStart,
					end: start,
				};

				return fixer.replaceRange(replaceRange, name);
			},
		});
	}

	/**
	 * Report and fix space to the left of operator for multi-line arrays and lists
	 *
	 * @param {AstEntry} node           Node to report
	 * @param {number}   expectedLength Expected length of the left side
	 */
	reportMultiLeadingSpace(node: AstEntry, expectedLength: number) {
		const { report } = this.context;
		const operatorPosition = this.getOperatorPosition(node.loc);

		const { key } = node;
		if (!key) {
			return;
		}

		const { end: keyEnd, start: keyStart } = key.loc;
		const keyLength = keyEnd.column - keyStart.column;

		if (operatorPosition === false || keyLength === expectedLength) {
			return;
		}

		const { start } = operatorPosition;

		const requiredSpaces = expectedLength - keyLength;
		const foundSpaces = start.column - keyEnd.column;

		if (foundSpaces === requiredSpaces) {
			return;
		}

		report({
			message: `Operator \`=>\` must have ${requiredSpaces} leading spaces. Found ${foundSpaces} spaces.`,
			position: {
				start: keyEnd,
				end: start,
			},
			fix: (fixer: Fixer) => {
				const keyString = key?.raw ?? key.value;
				const name = keyString.padEnd(expectedLength, ' ');

				const replaceRange = {
					start: keyStart,
					end: start,
				};

				return fixer.replaceRange(replaceRange, name);
			},
		});
	}

	/**
	 * Handle array and list items
	 *
	 * @return {boolean} True if the process was completed
	 */
	handleItems(): boolean {
		const { options } = this.context;
		const { items, loc } = this.node as AstArray | AstList;
		const { align } = options;

		if (items.length === 0) {
			return false;
		}

		const entries = this.getEntries();

		// if on the same line or align is false, then
		// report and fix the leading and trailing spaces
		if (align !== true || loc.start.line === loc.end.line) {
			entries.forEach((entry) => {
				this.reportLeadingSpace(entry);
				this.reportTraillingSpace(entry);
			});
			return false;
		}

		let expectedLength = 1;

		// Loop through the nodes and find the longest left length
		entries.forEach((entry) => {
			const { key, loc: entryLoc } = entry;

			const operatorPosition = this.getOperatorPosition(entryLoc);
			if (operatorPosition === false || !key) {
				return;
			}

			const { start } = operatorPosition;

			// Key is not null because the entries array already filtered out the null keys
			const { start: startLeft, end: endLeft } = key.loc;

			/*
				* Make sure to count one space between the left and the operator.
				* This accounts for cases where the longest left has multiple spaces.
				* e.g.
				* array(
				* "foobar" => 1,
				* "bar"      => 2 // This should not be considered as the longest left
				* );
				*/
			const diff = start.column - endLeft.column;

			// Calculate the length of the left side (+ 1 is to make sure a single space is counted)
			let leftLength = (start.column - diff) + 1;

			// Make sure indent is not counted
			leftLength = leftLength - startLeft.column;

			if (leftLength > expectedLength) {
				expectedLength = leftLength;
			}
		});

		entries.forEach((entry) => {
			this.reportMultiLeadingSpace(entry, expectedLength);
			this.reportTraillingSpace(entry);
		});

		return true;
	}

	/**
	 * Handle match arms
	 *
	 * @return {boolean} True if the process was completed
	 */
	handleMatch(): boolean {
		const { arms, loc } = this.node as AstMatch;
		const { options } = this.context;
		const { align } = options;

		if (arms.length === 0) {
			return false;
		}

		// if on the same line or align is false, then
		// report and fix the leading and trailing spaces
		if (align !== true || loc.start.line === loc.end.line) {
			arms.forEach((matchArm) => {
				const condsLoc = this.getCondLoc(matchArm);
				if (condsLoc === false) {
					return;
				}

				// Create an object to match AstEntry interface
				const matchArmAsEntry = {
					loc: matchArm.loc,
					key: {
						loc: condsLoc,
					},
				};

				this.reportLeadingSpace(matchArmAsEntry as AstEntry);
				this.reportTraillingSpace(matchArm);
			});
			return false;
		}

		let expectedLength = 1;

		// Loop through the nodes and find the longest left length
		arms.forEach((matchArm) => {
			const { loc: entryLoc } = matchArm;

			const operatorPosition = this.getOperatorPosition(entryLoc);
			if (operatorPosition === false) {
				return;
			}

			const { start } = operatorPosition;

			const condsLoc = this.getCondLoc(matchArm);
			if (condsLoc === false) {
				return;
			}

			const { start: startLeft, end: endLeft } = condsLoc;

			/*
			* Make sure to count one space between the left and the operator.
			* This accounts for cases where the longest left has multiple spaces.
			* e.g.
			* match($value) {
			* "foobar" => 1,
			* "bar"      => 2 // This should not be considered as the longest left
			* }
			*/
			const diff = start.column - endLeft.column;

			// Calculate the length of the left side (+ 1 is to make sure a single space is counted)
			let leftLength = (start.column - diff) + 1;

			// Make sure indent is not counted
			leftLength = leftLength - startLeft.column;

			if (leftLength > expectedLength) {
				expectedLength = leftLength;
			}
		});

		arms.forEach((matchArm) => {
			this.reportMultiLeadingSpaceMatch(matchArm, expectedLength);
			this.reportTraillingSpace(matchArm);
		});

		return false;
	}

	/**
	 * Process the rule
	 *
	 * @param  {RuleContext} context Rule context
	 * @return {boolean}             True if the rule was applied
	 */
	process(context: RuleContext): boolean {
		this.context = context;
		this.node = context.node;
		const { node } = context;
		const { kind } = node as AstArray | AstList;

		if (kind === 'match') {
			return this.handleMatch();
		}

		return this.handleItems();
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that pair operator `=>` have consistent spacing',
			fixable: true,
			preset: 'psr',
		},
		severity: 'warning',
		name: 'spacing.pair',
		defaultOptions: {
			align: {
				type: 'boolean',
				description: 'Align siblings items',
				default: false,
			},
		},
		register: ['array', 'list', 'match'],
		bindClass: AssignmentAlign,
	};
};
