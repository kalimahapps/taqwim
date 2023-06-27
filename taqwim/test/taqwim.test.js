export default {
	rules: {
		'psr/indent': 'off',
		'psr/brace-style': 'error',
		'taqwim/max-depth': {
			max: 5,
		},
		'psr/name-case': {
			function: 'camel',
		},
		'taqwim/cyclomatic-complexity': {
			max: 10,
		},
	},
};