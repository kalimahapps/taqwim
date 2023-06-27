import type { RuleContext, RuleDataOptional } from '@taqwim/types';
import * as levn from 'levn';

const process = (context: RuleContext) => {
	const { report, node } = context;
	const { kind, value, loc } = node;

	// Warn user if the comment is not a block
	// i.e not starting with `/*`
	if (kind === 'commentline') {
		const commentString = value.replace(/^\/\//u, '').trim();

		// Check if the comment is a taqwim comment
		const isRule = commentString.startsWith('taqwim');
		if (!isRule) {
			return;
		}

		report({
			message: 'Taqwim inline config should only be a block comment. Use /* */ instead of //',
			position: loc,
		});

		return;
	}

	// Remove leading and trailing comment characters
	const commentString = value
		.replace(/^\/\*/u, '')
		.replace(/\*\/$/u, '')
		.trim();

	const isRule = commentString.startsWith('taqwim ');

	if (!isRule) {
		return;
	}

	// Check that the json is valid
	const config = commentString
		.replace(/^taqwim\s/u, '')
		.trim();

	try {
		levn.parse('Object', `{${config}}`);
	} catch {
		report({
			message: 'Invalid JSON for Taqwim inline config',
			position: loc,
		});
	}
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Check that inline config is only used in block comments. Also check that the inline config is valid JSON.',
			fixable: false,
			preset: 'taqwim',
		},
		name: 'inline-config',
		severity: 'warning',
		register: ['commentblock', 'commentline'],
		process,
	};
};
