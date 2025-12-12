import eslintConfig from '@kalimahapps/eslint-config';
export default [
	...eslintConfig,
	{
		rules: {
			'n/shebang': 'off',
			'curly': 'warn',
			'eqeqeq': 'warn',
			'no-throw-literal': 'warn',
			'semi': 'off',
			'unicorn/prevent-abbreviations': [
				'warn',
				{
					checkFilenames: false,
				},
			],

			// This rule is causing an error:
			// `Cannot read properties of undefined (reading 'decoration')` error
			// Disable it until it's fixed
			'unicorn/expiring-todo-comments': 'off',
			'jsonc/no-useless-escape': 'off',
			'n/hashbang': 'off',
		},
	},
];