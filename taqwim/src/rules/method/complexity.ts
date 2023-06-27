/**
 * Ensures that the cyclomatic complexity of functions/methods is withing limit.
 */
import type { RuleDataOptional, RuleContext } from '@taqwim/types';

const process = (context: RuleContext) => {
	const { node, report, options } = context;
	const { traverse, name, loc, kind: nodeKind } = node;
	const { max } = options;

	const findChildren = traverse.find([
		'if',
		'while',
		'for',
		'foreach',
		'switch',
		'case',
		'assign',
		'bin',
		'do',
		'nullsafepropertylookup',
		'retif',
		'match',
		'matcharm',
	]);

	if (findChildren.length === 0) {
		return;
	}

	// filter out some nodes that don't match conditions
	const filtered = findChildren.filter((child) => {
		const { kind, operator, type } = child;

		if (!['assign', 'bin'].includes(kind)) {
			return true;
		}

		if (kind === 'assign' && operator === '??=') {
			return true;
		}

		if (kind === 'bin' && type === '??') {
			return true;
		}

		return false;
	});

	if (filtered.length <= max) {
		return;
	}

	report({
		message: `Cyclomatic complexity of "${name.name}" ${nodeKind} is ${filtered.length}. Maximum allowed is ${max}.`,
		position: loc,
	});
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensures that the cyclomatic complexity of functions/methods is withing limit.',
			fixable: false,
			preset: 'taqwim',
		},
		severity: 'warning',
		name: 'method.complexity',
		defaultOptions: {
			max: {
				type: 'number',
				default: 6,
				minimum: 2,
				description: 'Maximum allowed cyclomatic complexity.',
			},
		},
		register: ['method', 'function'],
		process,
	};
};
