import type { RuleDataOptional, RuleContext } from '@taqwim/types';
import type Fixer from '@taqwim/fixer';

/**
 * This rule will split the source into lines and check for line breaks
 * It does not use sourceLines because it split all lines
 * into an array and it does not differentiate between linux
 * and windows line breaks
 *
 * @param {RuleContext} context Rule context.
 */
/* eslint complexity: ["warn", 7] */
const process = (context: RuleContext): boolean => {
	const { report, node, options } = context;
	const { source } = node.loc;

	if (source === undefined) {
		return false;
	}

	// Find windows line breaks
	const findCRLF = source.matchAll(/\r\n/ug);

	// Find unix line breaks
	const findLF = source.matchAll(/(?<!\r)\n/ug);

	// Get the line breaks
	const CRLF = [...findCRLF];
	const LF = [...findLF];

	const { style: eolStyle } = options;

	if ((eolStyle === 'unix' && CRLF.length === 0) || (eolStyle === 'windows' && LF.length === 0)) {
		return true;
	}

	const errorMessageCRLF = "Expected linebreaks to be 'LF' but found 'CRLF'.";
	const errorMessageLF = "Expected linebreaks to be 'CRLF' but found 'LF'.";

	// Get the source lines to find the column and line number
	const sourceLines = source.split(/\r\n|[\r\n\u2028\u2029]/ug);

	const lineBreaks = eolStyle === 'unix' ? CRLF : LF;

	// Loop through each line break to report
	lineBreaks.forEach((lineBreak, index) => {
		/**
		 * Typescript report that index is possibly undefined even though
		 * `g` flag is used in the regex with matchall
		 *
		 * @see https://github.com/microsoft/TypeScript/issues/36788
		 */
		/* c8 ignore next 4 */
		const offset = lineBreak.index;
		if (offset === undefined) {
			return;
		}

		const column = sourceLines[index].length;
		const offsetExtra = eolStyle === 'unix' ? 2 : 1;

		const range = {
			start: {
				line: index,
				column,
				offset,
			},
			end: {
				line: index,
				column,
				offset: offset + offsetExtra,
			},
		};

		report({
			message: eolStyle === 'unix' ? errorMessageCRLF : errorMessageLF,
			position: range,

			// Fix the line break
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(range, eolStyle === 'unix' ? '\n' : '\r\n');
			},
		});
	});

	return true;
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Enforce consistent linebreak style',
			fixable: true,
			preset: 'psr',
		},
		name: 'linebreak-style',
		register: () => {
			// This rule does not need to be registered using a function
			// This is merely to show that it is possible to register a rule using a function
			// and for the purpose of testing
			return ['program'];
		},
		defaultOptions: {
			style: {
				type: 'string',
				default: 'unix',
				oneOf: [
					{
						type: 'string',
						const: 'unix',
						description: 'Enforce Unix linebreaks (LF)',
					},
					{
						type: 'string',
						const: 'windows',
						description: 'Enforce Windows linebreaks (CRLF)',
					},
				],
				description: 'The linebreak style to enforce',
			},
		},
		severity: 'warning',
		process,
	};
};
