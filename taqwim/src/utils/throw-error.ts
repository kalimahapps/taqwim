import type { ParserSyntaxError } from '@taqwim/types';

const throwErrorWithDetails = (content: string, error: Error) => {
	if (error instanceof SyntaxError === false) {
		throw error;
	}

	// Add parser syntax type error
	const errorData = error as ParserSyntaxError;
	const contentLines = content.split(/\r?\n/u);

	// Slice the text and add it to the error object
	const { lineNumber, columnNumber } = errorData;

	const errorExcerpt: string[] = [];

	const startLine = Math.max(0, lineNumber - 5);
	const endLine = Math.min(contentLines.length, lineNumber + 5);

	// Get two lines before and two lines after the error
	for (let index = startLine; index <= endLine; index++) {
		if (contentLines[index] === undefined) {
			break;
		}

		const oneBasedLineNumber = index + 1;
		const formattedIndex = lineNumber === oneBasedLineNumber ? `> ${oneBasedLineNumber}` : `  ${oneBasedLineNumber}`;
		errorExcerpt.push(`${formattedIndex} ${contentLines[index]}`);
	}

	errorData.excerpt = errorExcerpt.join('\n');
	throw errorData;
};

export {
	throwErrorWithDetails
};