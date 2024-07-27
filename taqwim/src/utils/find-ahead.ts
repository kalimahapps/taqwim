import type {
	End,
	Loc,
	MatchGroupType,
	MatchType,
	RangeMatchType,
	Start
} from '@taqwim/types';
import { getOffsetFromLineAndColumn } from '.';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

// This will be the same as Loc but with the offset
// property optional for the start and end
type LocNoOffset = {
	start: Optional<Start, 'offset'>;
	end: Optional<End, 'offset'>;
};

/* eslint complexity: ["warn", 9] */

/**
 * Search for a string ahead of a given line and column
 *
 * @param  {string[]}             lines  Lines to search
 * @param  {LocNoOffset}          loc    Start and end of the search
 * @param  {string}               needle String to search for
 * @return {RangeMatchType|false}        Match object or false if not found
 */
const findAhead = (
	lines: string[],
	loc: LocNoOffset,
	needle: string
): MatchType | false => {
	const {
		start: {
			line: startLine,
			column: startColumn,
		},
		end: {
			line: endLine,
			column: endColumn,
		},
	} = loc;

	for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
		let extraColumn = 0;
		let line = lines[lineNumber];

		// If this was one line
		if (lineNumber === endLine && lineNumber === startLine) {
			line = line.slice(startColumn, endColumn);
			extraColumn = startColumn;
		} else {
			// If we are on the first line, start searching from the given column (if provided)
			if (lineNumber === startLine) {
				line = lines[lineNumber].slice(startColumn);
				extraColumn = startColumn;
			}

			// If last line don't search beyond the last column
			if (lineNumber === endLine) {
				line = line.slice(0, endColumn);
			}
		}

		const column = line.indexOf(needle);
		if (column === -1) {
			continue;
		}

		return {
			line: lineNumber,
			column: column + extraColumn,
			offset: getOffsetFromLineAndColumn(lines, lineNumber, column + extraColumn),
		};
	}
	return false;
};

/**
 * Get the groups from a match and add the location to each group
 *
 * @param  {RegExpMatchArray} match        The match to get the groups from
 * @param  {Loc}              position     The position of the entire match
 * @param  {number}           columnAdjust How much to adjust the column with based on
 *                                         the start of the match.
 * @return {MatchGroupType}                The groups with location
 */
const groupsWithLoc = (
	match: RegExpMatchArray,
	position: Loc,
	columnAdjust: number
)
	: MatchGroupType => {
	const { groups, input, index } = match;

	const groupsWithLoc = {} as MatchGroupType;

	if (!groups || !input || index === null) {
		return groupsWithLoc;
	}

	const { start } = position;

	// Hold the previous start of the match
	// This will prevent false positives when multiple groups have the same value
	let startfrom = index;

	for (const [key, value] of Object.entries(groups)) {
		// If  value is empty, don't add it to the groups
		if (!value) {
			continue;
		}

		const valueColumn = input.indexOf(value, startfrom);
		const startPosition = {
			line: start.line,
			column: valueColumn + columnAdjust,
			offset: start.offset - start.column + valueColumn + columnAdjust,
		};

		groupsWithLoc[key] = {
			start: startPosition,
			end: {
				line: start.line,
				column: startPosition.column + value.length,
				offset: startPosition.offset + value.length,
			},
			value,
		};
		startfrom = input.indexOf(value, startfrom) + value.length;
	}

	return groupsWithLoc;
};

/**
 * Same as findAheadRegex but searches backwards (lastline to firstline)
 *
 * @param  {string[]}            lines Lines to search
 * @param  {LocNoOffset}         loc   Line to start searching from
 * @param  {RegExp}              regex String to search for
 * @return {MatchType|undefined}       Match object or undefined if not found
 */
const findAheadRegexReverse = (
	lines: string[],
	loc: LocNoOffset,
	regex: RegExp
): RangeMatchType | false => {
	const {
		start: {
			line: startLine,
			column: startColumn,
		},
		end: {

			line: endLine,
			column: endColumn,
		},
	} = loc;

	for (let lineNumber = endLine; lineNumber >= startLine; lineNumber--) {
		let line = lines[lineNumber];
		let extraColumn = 0;

		// If this was one line
		if (lineNumber === endLine && lineNumber === startLine) {
			line = line.slice(startColumn, endColumn);
			extraColumn = startColumn;
		} else {
			// If we are on the first line, start searching from the given column (if provided)
			if (lineNumber === startLine) {
				line = lines[lineNumber].slice(startColumn);
				extraColumn = startColumn;
			}

			// If last line don't search beyond the last column
			if (lineNumber === endLine) {
				line = line.slice(0, endColumn);
			}
		}

		const match = line.match(regex);
		if (!match || match?.index === undefined) {
			continue;
		}

		const column = match.index + extraColumn;

		const position = {
			start: {
				line: lineNumber,
				column,
				offset: getOffsetFromLineAndColumn(lines, lineNumber, column),
			},
			end: {
				line: lineNumber,
				column: column + match[0].length,
				offset: getOffsetFromLineAndColumn(lines, lineNumber, column + match[0].length),
			},
		};

		return {
			...position,
			value: match[0],
			groups: groupsWithLoc(match, position, extraColumn),
		};
	}

	return false;
};

/**
 * Same as findAhead, but uses a regex instead of a string
 *
 * @param  {string[]}            lines Lines to search
 * @param  {LocNoOffset}         loc   Line to start searching from
 * @param  {RegExp}              regex String to search for
 * @return {MatchType|undefined}       Match object or undefined if not found
 */
const findAheadRegex = (
	lines: string[],
	loc: LocNoOffset,
	regex: RegExp
): RangeMatchType | false => {
	const {
		start: {
			line: startLine,
			column: startColumn,
		},
		end: {
			line: endLine,
			column: endColumn,
		},
	} = loc;

	for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
		let line = lines[lineNumber];
		if (line === undefined) {
			return false;
		}

		let extraColumn = 0;

		// If this was one line
		if (lineNumber === endLine && lineNumber === startLine) {
			line = line.slice(startColumn, endColumn);
			extraColumn = startColumn;
		} else {
			// If we are on the first line, start searching from the given column (if provided)
			if (lineNumber === startLine) {
				line = lines[lineNumber].slice(startColumn);
				extraColumn = startColumn;
			}

			// If last line don't search beyond the last column
			if (lineNumber === endLine) {
				line = line.slice(0, endColumn);
			}
		}

		const match = line.match(regex);
		if (!match || match?.index === undefined) {
			continue;
		}

		const column = match.index + extraColumn;

		const position = {
			start: {
				line: lineNumber,
				column,
				offset: getOffsetFromLineAndColumn(lines, lineNumber, column),
			},
			end: {
				line: lineNumber,
				column: column + match[0].length,
				offset: getOffsetFromLineAndColumn(lines, lineNumber, column + match[0].length),
			},
		};

		return {
			...position,
			value: match[0],
			groups: groupsWithLoc(match, position, extraColumn),
		};
	}

	return false;
};
export {
	findAhead,
	findAheadRegex,
	findAheadRegexReverse
};