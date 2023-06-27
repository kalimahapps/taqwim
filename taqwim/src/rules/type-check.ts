import type Fixer from '@taqwim/fixer';
import type { AstBin, RuleContext, RuleDataOptional } from '@taqwim/types';

const process = (context: RuleContext) => {
	const { report, node } = context;
	if (node.type !== '==' && node.type !== '!=') {
		return;
	}

	const replacement = node.type === '!=' ? '!==' : '===';
	const { left, right, loc } = node as unknown as AstBin;

	const { end: leftEnd } = left.loc;
	const { start: rightStart } = right.loc;

	const range = {
		start: leftEnd,
		end: rightStart,
	};

	report({
		message: `Use strict comparison (${replacement}). Found (${node.type}).`,
		position: loc,
		fix(fixer: Fixer) {
			if (node.type === '!=') {
				return fixer.replaceRange(range, ' !== ');
			}
			return fixer.replaceRange(range, ' === ');
		},
	});
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Check that type checks use three equal signs',
			fixable: true,
			preset: 'taqwim',
		},
		severity: 'warning',
		name: 'type-check',
		register: ['bin'],

		/*
		* Order is not required for this rule.
		* This is for demonstration and testing purposes.
		*/
		order: 0,
		process,
	};
};
