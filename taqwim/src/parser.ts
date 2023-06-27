
import * as fs from 'node:fs';
import phpParser from '@taqwim/phpparser';
import { throwErrorWithDetails } from './utils';

const parser = new phpParser({
	// some options :
	parser: {
		// extracting comments blocks from the AST
		extractDoc: true,
		php7: true,

		// attach location nodes to AST
		locations: true,

		// graceful parsing mode, when an error is raised it's ignored
		suppressErrors: false,

		// enables debug output, useful for handling parsing errors when extending the library.
		debug: false,
	},
	ast: {
		withPositions: true,
		withSource: true,
	},
	lexer: {
		// extract all tokens (same output as token_get_all function in PHP)
		all_tokens: true,

		// extract also comments tokens (used when all_tokens is false)
		comment_tokens: true,

		// ignoring open or close tags, the input is directly a PHP script
		mode_eval: false,

		// handles ASP like tags <% and %>
		asp_tags: false,

		// handle short opening tag <?
		short_tags: false,
	},
});

const parseString = (content: string) => {
	try {
		return parser.parseCode(content, '');
	} catch (error) {
		throwErrorWithDetails(content, error as Error);
	}
};

const parseFile = (filePath: string) => {
	// Load a static file (Note: this file should exist on your computer)
	const phpFile = fs.readFileSync(filePath);
	const ast = parseString(phpFile.toString());

	return {
		ast,
		content: phpFile.toString(),
	};
};

const parseFileContent = (content: string) => {
	return {
		ast: parseString(content),
		content,
	};
};

export {
	parseFile,
	parseString,
	parseFileContent
};