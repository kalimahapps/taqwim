/**
 * Ensure that nesting level of a method or function does not exceed a specified limit.
 * This rule will report the first nesting level that exceeds the limit.
 */

import type { RuleDataOptional, AstNode, RuleContext } from '@taqwim/types';

const nestingNodes = [
	'foreach',
	'try',
	'catch',
	'while',
	'switch',
	'case',
	'closure',
	'if',
	'while',
	'for',
];

/**
 * Loop through the path and count the number of nesting nodes
 *
 * @param  {string[]} path Path to search
 * @return {number}        Number of nesting nodes found
 */
const findNestedItems = (path: string[]) => {
	// Check how many lookfor items occur in the path
	return path.reduce((accumulator, item) => {
		const [key, kind] = item.split('|');
		if (nestingNodes.includes(kind)) {
			return accumulator + 1;
		}
		return accumulator;
	}, 0);
};

const process = (context: RuleContext) => {
	const { report, node, walk, options } = context;
	const { path: methodPath } = node;

	// Set some variables to use inside the walk function
	const { max } = options;
	let childNodeWithMaxNesting: AstNode | undefined;
	let maxLevelFound = 0;

	// Walk through the children of the node
	// and find the first child that exceeds
	// the max nesting level allowed
	walk(node, (childNode) => {
		const { path: childPath } = childNode;

		// Remove method path from childpath
		const newChildPath = childPath.slice(methodPath.length);

		const nestingLevel = findNestedItems(newChildPath);
		if (nestingLevel > max && childNodeWithMaxNesting === undefined) {
			childNodeWithMaxNesting = childNode;
			maxLevelFound = nestingLevel;
		}
	});

	if (childNodeWithMaxNesting === undefined) {
		return;
	}

	const {
		loc: childNodeLoc,
	} = childNodeWithMaxNesting;

	report({
		message: `Nesting level of ${maxLevelFound} exceeds the maximum allowed of ${max}`,
		position: {
			start: {
				line: childNodeLoc.start.line,
				column: childNodeLoc.start.column,
				offset: -1,
			},
			end: {
				line: childNodeLoc.end.line,
				column: childNodeLoc.end.column,
				offset: -1,
			},
		},
	});
};

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that nesting level of a method or function does not exceed a specified limit',
			fixable: false,
			preset: 'taqwim',
		},
		severity: 'warning',
		name: 'method.max-depth',
		register: ['method', 'function'],
		defaultOptions: {
			max: {
				type: 'number',
				description: 'The maximum nesting level allowed',
				default: 3,
			},
		},
		process,
	};
};
