import eslintConfig from '@kalimahapps/eslint-config';
export default [
	{
		ignores: [
			'**/.vitepress/cache/**',
			'**/.vitepress/dist/**',
			'**/phpparser/**',
			'**/package-lock.json',
			'**/coverage/**',
		],
	},
	...eslintConfig,
	{
		rules: {
			'n/shebang': 'off',
			'curly': 'warn',
			'eqeqeq': 'warn',
			'no-throw-literal': 'warn',
			'semi': 'off',

			// Renamed from `unicorn/prevent-abbreviations` in eslint-plugin-unicorn v73
			'unicorn/name-replacements': [
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