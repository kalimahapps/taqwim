/**
 * Get offset based on the provided line and column
 *
 * @param  {string[]} lines  The lines of the file
 * @param  {number}   line   The line number
 * @param  {number}   column The column number
 * @return {number}          The offset number
 */
const getOffsetFromLineAndColumn = (lines: string[], line: number, column: number): number => {
	let offset = 0;
	for (let index = 0; index < line; index++) {
		offset += lines[index].length + 1;
	}
	offset += column;
	return offset;
};

export {
	getOffsetFromLineAndColumn
};