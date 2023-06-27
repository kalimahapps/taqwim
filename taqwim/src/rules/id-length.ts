/**
 * Ensure that identifiers are at within the length limit.
 */
import { RuleOptionError } from '@taqwim/throws';
import { capitalCase } from 'change-case';
import type { RuleContext, RuleDataOptional } from '@taqwim/types';

/**
 * Validate options
 *
 * @param {RuleContext} context Rule context.
 */
const validateOptions = (context: RuleContext) => {
	const { options, ruleName } = context;
	const { min, max, exceptions } = options;

	if (!Array.isArray(exceptions)) {
		throw new RuleOptionError('Exceptions must be an array.', ruleName, 'exceptions', exceptions);
	}

	if (typeof min !== 'number') {
		throw new RuleOptionError('Minimum length must be a number.', ruleName, 'min', min);
	}

	if (typeof max !== 'number') {
		throw new RuleOptionError('Maximum length must be a number.', ruleName, 'max', max);
	}

	if (min < 1) {
		throw new RuleOptionError('Minimum length must be greater than 0.', ruleName, 'min', min);
	}

	if (max < 1) {
		throw new RuleOptionError('Maximum length must be greater than 0.', ruleName, 'max', max);
	}

	if (max < min) {
		throw new RuleOptionError('Maximum length must be greater than minimum length.', ruleName, 'max', max);
	}
};

/**
 * Process the rule
 *
 * @param {RuleContext} context Rule context.
 */
/* eslint complexity: ["warn", 7] */
const process = (context: RuleContext) => {
	const { report, node, options } = context;
	const { name, loc, kind, isAnonymous } = node;

	validateOptions(context);

	const { min, max, exceptions } = options;

	const id = name?.name === undefined ? name : name.name;

	// Ignore if anonymous (like anonymous class) or in exceptions
	if (isAnonymous || exceptions.includes(id)) {
		return;
	}

	let position = name.loc;
	if (kind === 'variable') {
		const { start, end } = loc;
		position = {
			start: {
				...start,
				column: start.column,
				offset: start.offset,
			},
			end,
		};
	}

	if (id.length < min) {
		report({
			message: `${capitalCase(kind)} name '${id}' length is ${id.length}. Minimum length allowed is ${min}.`,
			position,
		});
	}

	if (id.length > max) {
		report({
			message: `${capitalCase(kind)} name '${id}' length is ${id.length}. Maximum length allowed is ${max}.`,
			position,
		});
	}
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that identifiers are at within the length limit.',
			fixable: false,
			preset: 'taqwim',
		},
		name: 'id-length',
		severity: 'warning',
		defaultOptions: {
			min: {
				type: 'number',
				default: 3,
				description: 'Minimum length of identifiers.',
			},
			max: {
				type: 'number',
				default: 30,
				description: 'Maximum length of identifiers.',
			},
			exceptions: {
				type: 'array',
				default: [''],
				description: 'List of identifiers to ignore.',
			},
		},
		register: [
			'class',
			'interface',
			'trait',
			'enum',
			'function',
			'method',
			'property',
			'variable',
			'constant',
		],
		process,
	};
};
