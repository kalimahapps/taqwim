/**
 * This is not provided as a class for:
 * 1. Simplicity. Because it included in various part of
 * the codebase so it would be a pain to pass the instance around
 * 2. Using `this`. `walk` function will be bound to the context of the 
 * caller. So no reference can be made to the instance of this class
 */
import type { AstComment, AstNode } from '@taqwim/types';

type PotentialArray = AstNode[] | AstComment[] | undefined;

const potentialObjects = [
	'expression',
	'left',
	'right',
	'test',
	'offset',
	'target',
	'what',
	'foreach',
	'source',
	'expr',
	'return',
	'trueExpr',
	'falseExpr',
	'key',
	'value',
	'alternate',
	'name',
	'cond',
	'matcharm',
	'body',
	'always',
	'entry',
	'expressionstatement',
	'traituse',
	'traitprecedence',
	'traitalias',
	'type',
];

/**
 * Helper function for walk to get the path to the current node
 *
 * @param  {string[]}                   currentPath The current path
 * @param  {string | number | string[]} payload     The payload to add to the path
 * @return {string[]}                               The updated path
 */
const getNodePath = (currentPath: string[], payload: string | number | string[]): string[] => {
	const payloadPath = Array.isArray(payload) ? payload : [`${payload}`];
	return currentPath.length === 0 ? payloadPath : [...currentPath, ...payloadPath];
};

/**
 * Walk the AST and add traversal methods on each node
 *
 * @param  {AstNode}  node     Node to walk
 * @param  {Function} callback Callback to run on each node
 * @param  {string}   nodeName Name of the node
 * @param  {string[]} path     Array of the path to the current node
 * @param  {number}   level    The level of walk run
 * @return {AstNode}           Either the same node or the result of the callback
 */
/* eslint max-lines-per-function: ["warn", 150] */
const walk = (
	node: AstNode,
	callback: (node: AstNode, nodeName: string, path: string[], level: number) => AstNode | void,
	nodeName = 'program',
	path: string[] = [],
	level = 0
): AstNode => {
	let updatedNode = node;

	const {
		children,
		body,
		properties,
		constants,
		arguments: nodeArguments,
		variables,
		items,
		catches,
		leadingComments,
		arms,
		conds,
		value,
		expressions,
		uses,
		init,
		test,
		increment,
		traits,
		adaptations,
		attrGroups,
		attrs,
		args,
	} = updatedNode;

	if (callback) {
		const callbackResult = callback(updatedNode, nodeName, path, level);
		if (callbackResult) {
			updatedNode = callbackResult;
		}
	}

	/**
	 * Callback for potential objects
	 *
	 * @param {string} child The name of the child
	 */
	const potentialObjectsCallback = (child: string) => {
		const childKey = child as keyof AstNode;
		const childValue = updatedNode[childKey];

		if (childValue && typeof childValue === 'object') {
			// Call walk on the child
			updatedNode[childKey] = walk(
				childValue,
				callback,
				childKey as string,
				getNodePath(path, `${childKey}|${childValue.kind}`),
				level + 1
			);
		}
	};

	/**
	 * Callback to process body leading and trailing comments
	 *
	 * @param {AstComment[]} comments The comments to process
	 * @param {number}       index    The index of the comment
	 */
	const bodyCommentCallback = (comments: AstComment[], index: number) => {
		if (!comments) {
			return;
		}

		const commentKey = index === 0 ? 'leadingComments' : 'trailingComments';
		comments.forEach((comment: AstComment, commentIndex: number) => {
			// eslint-disable-next-line unicorn/consistent-destructuring
			updatedNode.body[commentKey][commentIndex] = walk(
				comment as unknown as AstNode,
				callback,
				commentKey,
				getNodePath(path, [`body|${body.kind}`, `${commentKey}-${commentIndex}|${comment.kind}`]),
				level + 1
			);
		});
	};

	/**
	 * Callback to process arrays
	 *
	 * @param {PotentialArray} entry The entry to process
	 */
	const potentialArraysCallback = (entry: [string, PotentialArray]) => {
		const [key, collection] = entry;
		if (!Array.isArray(collection)) {
			return;
		}

		collection.forEach((childNode, index) => {
			const childNodeTyped = childNode as AstNode;
			updatedNode[key as keyof AstNode][index] = walk(
				childNodeTyped,
				callback,
				key,
				getNodePath(path, `${key}-${index}|${childNodeTyped.kind}`),
				level + 1
			);
		});
	};

	potentialObjects.forEach(potentialObjectsCallback);

	// Handle body leading and trailing comments because they are not in the children array
	// and therefore not handled by the previous loop
	const bodyComments = [body?.leadingComments, body?.trailingComments];
	bodyComments.forEach(bodyCommentCallback);

	// walk arrays if the current node has them
	const potentialArrays: Record<string, PotentialArray> = {
		properties,
		constants,
		children,
		arguments: nodeArguments,
		variables,
		body,
		items,
		catches,
		arms,
		conds,
		value,
		expressions,
		uses,
		init,
		test,
		increment,
		traits,
		adaptations,
		attrGroups,
		attrs,
		args,
		leadingComments: leadingComments as AstComment[],
	};

	Object.entries(potentialArrays).forEach(potentialArraysCallback);
	return updatedNode;
};

export { walk };