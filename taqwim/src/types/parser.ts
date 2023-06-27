interface ParserSyntaxError extends Error {
	excerpt: string;
	columnNumber: number;
	lineNumber: number;
}

export type {
	ParserSyntaxError
};