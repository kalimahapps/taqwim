/**
 * Discurage including more than one object declaration per file
 */
import type { RuleDataOptional, RuleContext, AstNode } from '@taqwim/types';

const process = (context: RuleContext): boolean => {
	const { node } = context;
	const { children } = node;

	if (!children || children.length === 0) {
		return false;
	}

	const objects = ['class', 'interface', 'trait', 'enum', 'namespace'];

	let metObject = false;
	children.forEach((child: AstNode) => {
		const { kind, loc, name, traverse } = child;

		if (metObject && objects.includes(kind)) {
			context.report({
				message: `Move \`${name.name}\` ${kind} to a separate file`,
				position: loc,
			});
		}

		// unbracketed namespaces are not nested.
		if (kind === 'namespace') {
			traverse.find('namespace').forEach((namespace: AstNode) => {
				context.report({
					message: `Move ${namespace.name} namespace to a separate file`,
					position: loc,
				});
			});
		}

		if (objects.includes(kind)) {
			metObject = true;
		}
	});

	return true;
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Discurage including more than one declaration per file',
			fixable: false,
			preset: 'psr',
		},
		severity: 'warning',
		name: 'one-declaration-per-file',
		register: ['program'],
		process,
	};
};
