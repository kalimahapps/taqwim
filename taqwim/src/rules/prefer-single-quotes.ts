/**
 * Ensure that double quotes are converted to single quotes where possible
 */
import type { RuleDataOptional, RuleContext, AstString } from '@taqwim/types';
import type Fixer from '@taqwim/fixer';

class PreferSingleQuotes {
	process(context: RuleContext) {
		const { node, report, sourceCode } = context;
		const { value, isDoubleQuote, loc } = node as unknown as AstString;

		// Ignore if not a double quote or if the string contains a single quote
		if (!isDoubleQuote || value.includes("'")) {
			return;
		}

		report({
			message: 'Prefer single quotes for strings',
			position: loc,
			fix: (fixer: Fixer) => {
				const start = loc.start.offset;
				const end = loc.end.offset;
				const text = sourceCode.slice(start, end);
				const fixed = text.replace(/^"(?<content>.*)"$/usm, "'$<content>'");
				return fixer.replaceRange(loc, fixed);
			},
		});
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that double quotes are converted to single quotes where possible',
			fixable: true,
			preset: 'taqwim',
		},
		name: 'prefer-single-quotes',
		register: ['string'],
		bindClass: PreferSingleQuotes,
	};
};
