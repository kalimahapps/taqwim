export default {
	'path': {
		alias: 'p',
		type: 'string',
		description: [
			'A comma separated paths to the files or directories to be processed.',
			'Paths are relative to the current working directory.',
			'If no path is provided, the current working directory will be used.',
			'Directories will be processed recursively',
		].join(' '),
		default: '.',
	},
	'fix': {
		alias: 'f',
		type: 'boolean',
		description: 'Automatically fix errors.',
	},
	'report-style': {
		alias: 'rs',
		type: 'string',
		description: 'The style of the report to be displayed.',
		choices: ['default', 'json', 'none'],
		default: 'default',
	},
	'report-file': {
		alias: 'o',
		type: 'string',
		description: [
			'File path to write the report to.',
			'Path can be relative to working directory or absolute.',
			'If not provided, the report will be displayed in the console.',
		].join(' '),
	},
	'cwd': {
		type: 'string',
		description: [
			'Path to the directory to be used as the current working directory.',
			'If not provided, the current working directory will be used.',
		].join(' '),
	},
	'config-file-name': {
		alias: 'cf',
		type: 'string',
		description: [
			'Config file name. If supplied, it will be used instead of the default config file name.',
			'It should be relative to `cwd` arg if supplied, otherwise relative to CWD.',
		].join(' '),
	},
	'summary': {
		alias: 's',
		type: 'boolean',
		default: false,
		description: 'Display a summary of the report if reportStyle is "default".',
	},
	'version': {
		alias: 'v',
		type: 'boolean',
		description: 'Display the version.',
		default: false,
	},
	'verbose': {
		alias: 'vv',
		type: 'boolean',
		default: false,
		description: 'Display the column number in the report if reportStyle is "default".',
	},
	'vvv': {
		type: 'boolean',
		default: false,
		description: 'Display the rule name in the report if reportStyle is "default".',
	},
	'hide-logo': {
		alias: 'hl',
		type: 'boolean',
		default: false,
		description: 'Hide the logo in the report if reportStyle is "default".',
	},
	'rule': {
		alias: 'r',
		type: 'string',
		description: [
			'A comma separated list of rules to be used.',
			'If not provided, all rules will be used.',
		].join(' '),
	},
	'line': {
		alias: 'l',
		type: 'string',
		description: [
			'A comma separated list of line numbers to be processed.',
			'If not provided, all lines will be processed.',
		].join(' '),
	},
	'column': {
		alias: 'c',
		type: 'string',
		description: [
			'A comma separated list of column numbers to be processed.',
			'If not provided, all columns will be processed.',
		].join(' '),
	},
	'group-rules': {
		alias: 'gr',
		type: 'boolean',
		default: false,
		description: 'Show output grouped by rule. Only applicable if reportStyle is "default".',
	},
	'help': {
		alias: 'h',
		type: 'boolean',
		description: 'Show help.',
	},
} as const;