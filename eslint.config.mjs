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

			// This rule is causing an error:
			// `Cannot read properties of undefined (reading 'decoration')` error
			// Disable it until it's fixed
			'unicorn/expiring-todo-comments': 'off',

			'unicorn/prevent-abbreviations': [
				'warn',
				{
					checkFilenames: false,
				},
			],
		},
	},
];