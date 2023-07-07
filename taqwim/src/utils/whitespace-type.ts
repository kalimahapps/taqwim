type WhitespaceMap = {
	[key: string]: boolean;
};

/**
 * Get the type of whitespace in the provided string
 *
 * @param  {RegExpMatchArray} whitespaceMatch The current indent
 * @return {string}                           The type of whitespace
 */
const getWhitespaceType = (whitespaceMatch: RegExpMatchArray): string => {
	const findTabs = whitespaceMatch[0].match(/\t+/u);
	const findSpaces = whitespaceMatch[0].match(/ +/u);

	const hasTabs = (findTabs?.length ?? -1) > 0;
	const hasSpaces = (findSpaces?.length ?? -1) > 0;

	const map: WhitespaceMap = {
		'mixed whitespace': hasTabs && hasSpaces,
		'tabs': hasTabs,
		'spaces': hasSpaces,
	};

	const foundType = Object.keys(map).find((key) => {
		return map[key] === true;
	});

	return foundType ?? 'whitespace';
};

export {
	getWhitespaceType
};