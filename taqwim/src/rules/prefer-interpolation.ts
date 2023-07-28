/**
 * Ensure interpolation is used instead of concatenation
 */
/* eslint complexity: ["warn", 12] */
import type Fixer from '@taqwim/fixer';
import type {
	AstBin,
	AstExpression,
	AstString,
	AstVariable,
	Loc,
	RuleContext,
	RuleDataOptional
} from '@taqwim/types';

type NodesWithValues = AstExpression | AstString;
class PreferInterpolation {
	/**
	 * Get the value of a node based on its kind
	 *
	 * @param  {NodesWithValues} node The node to get the value of
	 * @return {string|false}         The value of the node if found,
	 *                                otherwise false
	 */
	getNodeValue(node: NodesWithValues): string | false {
		const { kind } = node;

		let result: string | false = false;
		switch (kind) {
			case 'string': {
				const { value } = node as AstString;
				result = value;
				break;
			}

			case 'variable': {
				const { name } = node as AstVariable;
				result = `{$${name}}`;
				break;
			}

			default: {
				// If there is unknown node type, then we can't get the value
				// This will stop fixing the rule which could potentially
				// break the code
				result = false;
				break;
			}
		}

		if (result === false) {
			return false;
		}

		// Check if the result contains a double quote, because
		// that will break the final string
		if (result.includes('"')) {
			return false;
		}

		return result;
	}

	/**
	 * Check if the start and end of a location are on the same line
	 *
	 * @param  {Loc}     loc The location to check
	 * @return {boolean}     True if the start and end are on the same line
	 */
	isSameLine(loc: Loc): boolean {
		return loc.start.line === loc.end.line;
	}

	/**
	 * Process the rule
	 *
	 * @param {RuleContext} context The context of the rule
	 */
	process(context: RuleContext) {
		const { report, node } = context;
		const { left, right, type } = node as AstBin;

		// Only check for concatenation
		if (type !== '.') {
			return;
		}

		// Ignore if the child left is also a concatenation. Doing this
		// Will get to the deepest concatenation and then it will work
		// its way back up
		if (left.kind === 'bin') {
			return;
		}

		let text = '';
		const leftString = this.getNodeValue(left);
		const rightString = this.getNodeValue(right);

		if (leftString === false || rightString === false) {
			return;
		}

		text += leftString;
		text += rightString;

		let parent = node.traverse.parent();

		// Handle cases where there is only one node in the concatenation
		// e.g. "Hello" . "World"
		if (parent === false || parent.kind !== 'bin') {
			const position = node.loc;

			// Don't fix if the concatenation is on multiple lines
			if (!this.isSameLine(position)) {
				return;
			}

			report({
				message: 'Prefer interpolation over concatenation',
				position,
				fix: (fixer: Fixer) => {
					return fixer.replaceRange(position, `"${text}"`);
				},
			});
			return;
		}

		let firstNode = node as AstBin;

		// Keep going up the tree until there are not more bin nodes
		while (parent.kind === 'bin') {
			firstNode = parent as AstBin;

			const nodeString = this.getNodeValue(parent.right as NodesWithValues);
			if (nodeString === false) {
				return;
			}

			// concatenate the string
			text += nodeString;

			parent = parent.traverse.parent();
			if (parent === false) {
				break;
			}
		}

		/**
		 * Get the position of the whole concatenation
		 * firstNode.right represents the last node in the concatenation
		 * and left is the first chunk in the concatenation
		 */
		const position = {
			start: left.loc.start,
			end: firstNode.right.loc.end,
		};

		// Don't fix if the concatenation is on multiple lines
		if (!this.isSameLine(position)) {
			return;
		}

		report({
			message: 'Prefer interpolation over concatenation',
			position,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(position, `"${text}"`);
			},
		});
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure interpolation is used instead of concatenation',
			fixable: true,
			preset: 'taqwim',
		},
		name: 'prefer-interpolation',
		register: ['bin'],
		bindClass: PreferInterpolation,
	};
};
