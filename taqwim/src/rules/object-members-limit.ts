import type { RuleContext, RuleDataOptional } from '@taqwim/types';
import { capitalCase } from 'change-case';

class MaxObjectMembers {
	context = {} as RuleContext;

	/**
	 * Process the rule
	 *
	 * @param {RuleContext} context Rule context
	 */
	process(context: RuleContext) {
		this.context = context;
		const { report, node, options } = this.context;
		const { kind, loc, name, isAnonymous, body } = node;
		const { max } = options;

		const membersLength = body.length;
		if (membersLength <= max) {
			return;
		}

		const objectName = isAnonymous ? 'Anonymous' : `\`${name.name}\``;
		report({
			message: `${objectName} ${capitalCase(kind)} has ${membersLength} members. Maximum allowed is ${max}`,
			position: loc,
		});
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that objects in PHP have a maximum number of members',
			fixable: false,
			preset: 'taqwim',
		},
		name: 'object-members-limit',
		severity: 'warning',
		register: ['class', 'trait', 'interface', 'enum'],
		defaultOptions: {
			max: {
				type: 'number',
				minimum: 1,
				default: 50,
				description: 'Maximum number of members. Default is `50`',
			},
		},
		bindClass: MaxObjectMembers,
	};
};
