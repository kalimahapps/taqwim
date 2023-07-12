/**
 * Ban certain function calls
 */
import type { AstCall, RuleContext, RuleDataOptional } from '@taqwim/types';

type IncludeItem = {
	name: string;
	message: string;
};

const DEBUGGING_FUNCTIONS = [
	'error_log',
	'var_dump',
	'var_export',
	'print_r',
	'trigger_error',
	'set_error_handler',
	'debug_backtrace',
	'debug_print_backtrace',
];

const SENSITIVE_FUNCTIONS = [
	'error_reporting',
	'phpinfo',
];

const ALL_FUNCTIONS = [
	...DEBUGGING_FUNCTIONS,
	...SENSITIVE_FUNCTIONS,
];

class BanMethods {
	/**
	 * The rule context
	 */
	context = {} as RuleContext;

	/**
	 * The node that is being processed
	 */
	node = {} as AstCall;

	/**
	 * Aggregate all the function names that should be checked
	 *
	 * @param  {RuleContext} context The rule context
	 * @return {string[]}            The list of function names
	 */
	getAllFunctionNames(context: RuleContext): string[] {
		const { include } = context.options;
		if (include.length === 0) {
			return ALL_FUNCTIONS;
		}

		const includeNames = include.map((item: IncludeItem) => {
			return item.name;
		});

		return [...ALL_FUNCTIONS, ...includeNames];
	}

	/**
	 * Handle debugging functions
	 */
	handleDebuggingFunctions() {
		const { report } = this.context;
		const { loc, what } = this.node;
		const { name } = what;

		if (typeof name !== 'string' || !DEBUGGING_FUNCTIONS.includes(name)) {
			return;
		}

		report({
			message: `Debugging functions should not be used in production. Found: \`${name}\``,
			position: loc,
		});
	}

	/**
	 * Handle sensitive functions
	 */
	handleSensitiveFunctions() {
		const { report } = this.context;
		const { loc, what } = this.node;
		const { name } = what;

		if (typeof name !== 'string' || !SENSITIVE_FUNCTIONS.includes(name)) {
			return;
		}

		report({
			message: `\`${name}\` can reveal sensitive information about the server. It should not be used in production.`,
			position: loc,
		});
	}

	/**
	 * Handle user defined functions
	 */
	handleCustomFunctions() {
		const { options, report } = this.context;

		const { include } = options;
		const {
			loc,
			what: { name },
		} = this.node;

		if (include.length === 0) {
			return;
		}

		include.forEach((item: IncludeItem) => {
			if (item.name === name) {
				report({
					message: item.message,
					position: loc,
				});
			}
		});
	}

	process(context: RuleContext) {
		this.context = context;
		const { node, options } = this.context;
		this.node = node as unknown as AstCall;
		const { what: { name } } = this.node;

		const allFunctions = this.getAllFunctionNames(context);

		// Check if the function name is excluded
		const isExcluded = options.exclude.includes(name);

		// Check that the function name is a string and is in the list of functions to check
		if (isExcluded || typeof name !== 'string' || !allFunctions.includes(name)) {
			return;
		}

		this.handleDebuggingFunctions();
		this.handleSensitiveFunctions();
		this.handleCustomFunctions();
	}
}

export default (): RuleDataOptional => {
	// Prepare items for  `oneOf` property
	const excludeItems = ALL_FUNCTIONS.map((name) => {
		return {
			type: 'string',
			const: name,
			description: `Exclude ${name}`,
		};
	});

	return {
		meta: {
			description: 'Ensure that certain function are not called in the code',
			fixable: false,
			preset: 'taqwim',
		},
		defaultOptions: {
			exclude: {
				description: 'Exclude certain function names from being checked',
				type: 'array',
				items: {
					uniqueItems: true,
					type: 'string',
					oneOf: excludeItems,
				},
				default: [],
			},
			include: {
				description: 'Include extra function names to be checked',
				type: 'array',
				items: {
					uniqueItems: true,
					type: 'object',
					properties: {
						name: {
							type: 'string',
							description: 'Function name',
						},
						message: {
							type: 'string',
							description: 'Message to display when the function is called',
						},
					},
				},
				default: [],
			},
		},
		name: 'method.ban',
		register: ['call'],
		bindClass: BanMethods,
	};
};
