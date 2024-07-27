import eslintConfig from '@kalimahapps/eslint-config';
export default [
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
		},
	},
	...eslintConfig,
];