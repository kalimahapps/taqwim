import { RuleOptionError } from '@taqwim/throws';
import type { RuleContext, RuleDataOptional } from '@taqwim/types';
import { capitalCase } from 'change-case';

type Flags = {
	ignoreComments: boolean;
	ignoreEmptyLines: boolean;
};

type Options = {
	[key: string]: number;
	file: number;
	class: number;
	interface: number;
	trait: number;
	enum: number;
	function: number;
	method: number;
};

class MaxLines {
	context = {} as RuleContext;

	/**
	 * Fill undefined options with default values
	 *
	 * @return {object} Options with default values
	 */
	updateOptionWithDefaults() {
		const { options } = this.context;

		const { ignoreComments, ignoreEmptyLines, ...restOptions } = options as Flags;

		const defaultOptions = {
			interface: options.class,
			trait: options.class,
			enum: options.class,
			method: options.function,
		};

		const fullOptions = {
			...defaultOptions,
			...restOptions,
		};

		return {
			flags: {
				ignoreComments,
				ignoreEmptyLines,
			},
			options: fullOptions as Options,
		};
	}

	/**
	 * Get kind name for reporting
	 *
	 * @return {string} Kind name
	 */
	getKindName(): string {
		const { kind, name } = this.context.node;

		if (kind === 'program') {
			return 'File';
		}

		return `${capitalCase(kind)} \`${name.name}\``;
	}

	/**
	 * Process the rule
	 *
	 * @param {RuleContext} context Rule context
	 */
	process(context: RuleContext) {
		this.context = context;
		const { report, node, sourceLines, ruleName } = this.context;
		const { kind, loc } = node;

		const updatedOptions = this.updateOptionWithDefaults();

		const {
			start: {
				line: startLine,
			}, end: {
				line: endLine,
			},
		} = loc;

		const { ignoreComments, ignoreEmptyLines } = updatedOptions.flags;

		let isDocumentBlock = false;
		const total = sourceLines
			.slice(startLine, endLine + 1)
			/* eslint complexity: ["warn", 9] */
			.reduce((accumulator, line) => {
				const trimmedLine = line.trim();

				// Make sure we don't check inside a document block
				if (trimmedLine.startsWith('/**')) {
					isDocumentBlock = true;
					return accumulator;
				}

				if (trimmedLine.endsWith('*/') && isDocumentBlock) {
					isDocumentBlock = false;
					return accumulator;
				}

				if (ignoreComments && (trimmedLine.startsWith('//') || isDocumentBlock)) {
					return accumulator;
				}

				if (ignoreEmptyLines && trimmedLine === '') {
					return accumulator;
				}

				return accumulator + 1;
			}, 0);

		const kindName = kind === 'program' ? 'file' : kind;
		const kindLimit = updatedOptions.options[kindName];

		if (typeof kindLimit !== 'number') {
			throw new RuleOptionError('Limit must be a number.', ruleName, kindName, kindLimit);
		}

		const hasExceeded = total > kindLimit;
		if (!hasExceeded) {
			return;
		}

		report({
			message: `${this.getKindName()} has ${total} lines. Maximum allowed is ${kindLimit}`,
			position: loc,
		});
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that certain structure have line limit',
			fixable: false,
			preset: 'taqwim',
		},
		name: 'max-lines',
		severity: 'warning',
		register: ['program', 'class', 'trait', 'interface', 'enum', 'function', 'method'],
		defaultOptions: {
			file: {
				type: 'number',
				minimum: 1,
				default: 400,
				description: 'File max lines. Default is `400`',
			},
			class: {
				type: 'number',
				minimum: 1,
				default: 300,
				description: 'Class max lines. Default is `300`',
			},
			interface: {
				type: 'number',
				minimum: 1,
				description: 'Interface max lines. If not set, class max lines will be used',
			},
			trait: {
				type: 'number',
				minimum: 1,
				description: 'Trait max lines. If not set, class max lines will be used',
			},
			enum: {
				type: 'number',
				minimum: 1,
				description: 'Enum max lines. If not set, class max lines will be used',
			},
			function: {
				type: 'number',
				minimum: 1,
				default: 50,
				description: 'Function max lines. Default is `100`',
			},
			method: {
				type: 'number',
				minimum: 1,
				description: 'Method max lines. If not set, function max lines will be used',
			},
			ignoreComments: {
				type: 'boolean',
				default: true,
				description: 'Ignore comments. Default is `true`',
			},
			ignoreEmptyLines: {
				type: 'boolean',
				default: true,
				description: 'Ignore empty lines. Default is `true`',
			},

		},
		bindClass: MaxLines,
	};
};
