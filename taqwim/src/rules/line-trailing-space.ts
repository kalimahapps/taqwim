/**
 * Ensure that there is no trailing whitespace at the end of each line
 *
 * @see https://www.php-fig.org/psr/psr-12/#23-lines
 */
import { getOffsetFromLineAndColumn } from '@taqwim/utils/index';
import type { RuleContext, RuleDataOptional } from '@taqwim/types';
import type Fixer from '@taqwim/fixer';

const process = (context: RuleContext) => {
	const { report, sourceLines } = context;

	sourceLines.forEach((line, lineIndex) => {
		const findWhitespace = line.match(/\s+$/u);

		const lineLength = line.length;
		if (findWhitespace === null) {
			return;
		}

		/**
		 * Typescript report that index is possibly undefined even though
		 * `g` flag is not used in the regex. 
		 *
		 * @see https://github.com/microsoft/TypeScript/issues/35157
		 */
		/* c8 ignore next 4 */
		const { index: whitespaceStart } = findWhitespace;
		if (whitespaceStart === undefined) {
			return;
		}

		const position = {
			start: {
				line: lineIndex,
				column: whitespaceStart,
				offset: getOffsetFromLineAndColumn(sourceLines, lineIndex, whitespaceStart),
			},
			end: {
				line: lineIndex,
				column: lineLength,
				offset: getOffsetFromLineAndColumn(sourceLines, lineIndex, lineLength),
			},
		};

		report({
			message: 'Whitespace should be removed from the end of the line',
			position,
			fix(fixer: Fixer) {
				return fixer.replaceRange(position, '');
			},
		});
	});
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that there is no trailing whitespace at the end of each line',
			fixable: true,
			preset: 'psr',
		},
		severity: 'warning',
		name: 'trailing-space',
		register: ['program'],
		process,
	};
};
