/* eslint complexity: ["warn", 14] */
import { findLastIndex } from '@taqwim/utils/index';
import { walk } from '@taqwim/walker';
import type { AstComment, AstNode, Loc } from './types';

class Traverse {
	ast: AstNode = {} as AstNode;
	nodesList: AstNode[] = [];
	matchAgainst: string | string[] = [''];
	matchType = 'kind';

	/**
	 * A flag to indicate if the current if statement is the root if
	 * (i.e. not an elseif or else)
	 */
	rootIf = false;

	constructor() {

		// this.ast = ast;

		// this.updateAst(ast);
	}

	/**
	 * Change start and end line number to zero based
	 * It is one-based in the AST
	 *
	 * @param  {Loc} location The location object
	 * @return {Loc}          The updated location object
	 */
	changeLineToZeroBased(location: Loc): Loc {
		const { start, end } = location;
		if (!start || !end) {
			return location;
		}

		return {
			...location,
			start: {
				...start,
				line: start.line - 1,
			},
			end: {
				...end,
				line: end.line - 1,
			},
		};
	}

	/**
	 * Add if type (if, elseif, else, onlyif) to the node
	 *
	 * @param {AstNode} node The node to add the type to, it is passed by reference
	 *                       so there is no need to return it
	 */
	addIfStatementTypes(node: AstNode) {
		const { alternate } = node;

		// Check if node has an if parent
		const hasIfParent = this.parent(node, 'if');

		// Nested alternate means elseif
		const isElsif = alternate !== undefined && hasIfParent !== false;

		// Else is the last alternate
		const isElse = alternate !== undefined && alternate?.alternate === undefined;

		// Check if this is an if statement (with elseif or else)
		const isIf = hasIfParent === false && (isElsif === false || isElse === false);

		// Set node type based on the above checks
		// This will check if isIf is true and set 'if' as the node type
		// If isElsif is true, it will set 'elseif' as the node type .. etc
		node.ifType = (isIf && 'if') || (isElsif && 'elseif') || (isElse && 'else') || 'onlyif';

		if (isElse !== undefined && alternate !== null && alternate !== undefined) {
			alternate.ifType = 'else';
		}
	}

	/**
	 * Callback to update node by adding traverse methods,
	 * updating line numbers and moving source code
	 *
	 * @param  {AstNode}  node     Node to Update
	 * @param  {string}   nodeName Name of the node
	 * @param  {string[]} path     Path to node
	 * @return {AstNode}           Updated node
	 */
	updateNodes(node: AstNode, nodeName: string, path: string[] = []): AstNode {
		const clone = JSON.parse(JSON.stringify(node));

		const { loc, traverse, kind, leadingComments, trailingComments } = clone;

		clone.traverse = {
			...traverse,
			siblings: this.siblings.bind(this, clone),
			find: this.find.bind(this, clone),
			findByNodeName: this.findByNodeName.bind(this, clone),
			closest: this.closest.bind(this, clone),
			parent: this.parent.bind(this, clone),
			nextSibling: this.nextSibling.bind(this, clone),
			prevSibling: this.prevSibling.bind(this, clone),
		};

		if (loc) {
			const updatedLoc = this.changeLineToZeroBased(loc);
			clone.loc = updatedLoc;

			// Make sure that source is undefined if it is empty
			if ('source' in loc) {
				clone.loc.source = loc.source === '' ? undefined : loc.source;
			}
		}

		// Make sure that leadingComments and trailingComments are always an array
		clone.leadingComments = leadingComments ?? [];
		clone.trailingComments = trailingComments ?? [];

		clone.path = path;

		// Update if node type
		if (kind === 'if') {
			this.addIfStatementTypes(clone);
		}

		// Noop start and end are wrong. They should be swapped
		if (kind === 'noop') {
			clone.loc.start = clone.loc.end;
			clone.loc.end = clone.loc.start;
		}

		clone.nodeName = nodeName;
		return clone;
	}

	/**
	 * Provide a fresh copy of the node with
	 * traverse methods and updated line numbers
	 *
	 * @param {AstNode} ast Main node to walk
	 */
	updateAst(ast: AstNode) {
		// Clear node list found in previous find
		this.nodesList = [];

		// Update ast
		this.ast = walk(ast, this.updateNodes.bind(this));

		// Update comments to have zero based line numbers
		const { comments } = ast;
		if (!comments) {
			return;
		}

		this.ast.comments = comments.map((comment: AstComment) => {
			const clonedComment = JSON.parse(JSON.stringify(comment));
			const { loc } = clonedComment;
			if (!loc) {
				return clonedComment;
			}

			clonedComment.loc = this.changeLineToZeroBased(loc);

			return clonedComment;
		});
	}

	/**
	 * Set the AST
	 *
	 * @param {AstNode} ast The AST
	 */
	setAst(ast: AstNode) {
		this.ast = ast;
	}

	/**
	 * Get the AST
	 *
	 * @return {AstNode} The AST
	 */
	getAst(): AstNode {
		return this.ast;
	}

	/**
	 * Get siblings of the given node, optionally filtered by kind
	 *
	 * @param  {AstNode}         node     The node to start from
	 * @param  {string|string[]} nodeName The kind of node to find
	 * @return {AstNode[]}                Array of nodes
	 */
	siblings(node: AstNode, nodeName: string | string[] = ''): AstNode[] {
		const { path } = node;
		const parentPath = path.slice(0, -1);
		const parent = this.getNodeFromPath(parentPath);

		const children = Object.values(parent);
		return children.filter((child: AstNode) => {
			if (nodeName === '') {
				return true;
			}
			return child.nodeName === nodeName;
		});
	}

	/**
	 * Get sibling of the given node in the given direction
	 *
	 * @param  {AstNode}         node      The node to start from
	 * @param  {string}          direction The direction to get the sibling from
	 * @return {AstNode|boolean}           The sibling node or false
	 */
	private getSibling(
		node: AstNode, direction: 'next' | 'previous'
	): AstNode | false {
		const { path } = node;
		const currentPath = path.at(-1);

		if (currentPath === undefined) {
			return false;
		}

		const isChildrenPath = currentPath.startsWith('children');
		if (isChildrenPath === false) {
			const parentPath = path.slice(0, -1);
			const parent = this.getNodeFromPath(parentPath);

			// Get list of parent keys and extra current node name and index
			const parentKeys = Object.keys(parent);
			const [currentNodeName] = currentPath.split('|');
			const currentNodeIndex = parentKeys.indexOf(currentNodeName);
			if (currentNodeIndex === -1) {
				return false;
			}

			// Exclude custom nodes
			const customNodes = ['traverse', 'path', 'nodeName'];

			if (direction === 'previous') {
				// Find the first previous node that has loc property
				// and is not a custom node
				const previousNodeIndex = parentKeys.slice(0, currentNodeIndex).reverse()
					.find((key) => {
						if (customNodes.includes(key)) {
							return false;
						}

						return parent[key].loc !== undefined;
					});

				if (previousNodeIndex === undefined) {
					return false;
				}

				return parent[previousNodeIndex];
			}

			// Find the first next node that has loc property
			// and is not a custom node
			const nextNodeIndex = parentKeys.slice(currentNodeIndex)
				.find((key) => {
					if (customNodes.includes(key)) {
						return false;
					}

					return parent[key].loc !== undefined;
				});

			if (nextNodeIndex === undefined) {
				return false;
			}

			return parent[nextNodeIndex];

			// const nextNodeKey = parentKeys[currentNodeIndex + 1];
			// if (customNodes.includes(nextNodeKey)) {
			// 	return false;
			// }

			// return parent[nextNodeKey];
		}

		// If is a child of a children array (e.g. children-0)
		// then get the sibling by parsing the index from the path
		// and getting the next index
		const [key] = currentPath.split('|');
		const isKeyArray = key.match(/-(?<childIndex>\d+)$/u);
		if (!isKeyArray || isKeyArray?.groups?.childIndex === undefined) {
			return false;
		}

		const { childIndex } = isKeyArray.groups;
		let siblingIndex = Number.parseInt(childIndex, 10) + 1;

		if (direction === 'previous') {
			siblingIndex = Number.parseInt(childIndex, 10) - 1;
		}

		const newPath = path.slice(0, -1);
		newPath.push(`${key.replace(`-${childIndex}`, `-${siblingIndex}`)}`);

		const siblingNode = this.getNodeFromPath(newPath);
		if (siblingNode === undefined) {
			return false;
		}

		return siblingNode;
	}

	/**
	 * Get the immediate next sibling of the given node
	 *
	 * @param  {AstNode}           node The node to start from
	 * @return {AstNode|undefined}      The next sibling node or false if not found
	 */
	nextSibling(node: AstNode): AstNode | false {
		return this.getSibling(node, 'next');
	}

	/**
	 * Get the immediate prev sibling of the given node
	 *
	 * @param  {AstNode}           node The node to start from
	 * @return {AstNode|undefined}      The prev sibling node or false if not found
	 */
	prevSibling(node: AstNode): AstNode | false {
		return this.getSibling(node, 'previous');
	}

	/**
	 * Find nodes of the given kind
	 *
	 * @param  {AstNode}         node The node to start from
	 * @param  {string|string[]} kind The kind of node to find
	 * @return {AstNode[]}            Array of nodes
	 */
	find(node: AstNode, kind: string | string[]): AstNode[] {
		this.nodesList = [];
		this.matchAgainst = typeof kind === 'string' ? [kind] : kind;
		this.matchType = 'kind';

		walk(
			node,
			this.addToList.bind(this),
			node.kind
		);

		return this.nodesList;
	}

	/**
	 * Same as `find` method but by looks for node by name
	 *
	 * @param  {AstNode}         node      The node to start from
	 * @param  {string|string[]} nodeNames The name of the node to find
	 * @return {AstNode[]}                 Array of nodes
	 */
	findByNodeName(node: AstNode, nodeNames: string | string[]): AstNode[] {
		this.nodesList = [];

		this.matchAgainst = typeof nodeNames === 'string' ? [nodeNames] : nodeNames;
		this.matchType = 'nodeName';
		walk(
			node,
			this.addToList.bind(this),
			node.nodeName
		);

		return this.nodesList;
	}

	/**
	 * Get the last node specified by path
	 *
	 * @param  {string[]} path Path to node
	 * @return {AstNode}       The node
	 */
	getNodeFromPath(path: string[]): AstNode {
		let currentNode = this.getAst();

		for (const pathStep of path) {
			const [key] = pathStep.split('|');

			const isKeyArray = key.match(/-\d+$/u);
			if (!isKeyArray) {
				currentNode = currentNode[key as keyof AstNode];
				continue;
			}

			// If key has an index (e.g. children-0), get the array and the index
			const [keyname, index] = key.split('-');
			const keyArray = currentNode[keyname as keyof AstNode] as AstNode[];
			currentNode = keyArray[Number.parseInt(index, 10)];
		}

		return currentNode;
	}

	/**
	 *
	 * @param  {AstNode}         node       The node to start from
	 * @param  {string}          parentKind The kind of node to find
	 * @return {AstNode|boolean}            The parent node or undefined
	 */
	parent(node: AstNode, parentKind = ''): AstNode | boolean {
		const { path } = node;

		const parentKey = path.at(-2);

		// If parent is not specified, return the parent of the current node
		if (parentKind === '') {
			return this.getNodeFromPath(path.slice(0, -1));
		}

		// Do initial check on path
		const checkKind = parentKey?.endsWith(parentKind);

		// If no match, return false
		if (checkKind !== true) {
			return false;
		}

		// parentKind is defined and it exists in the path
		const newPath = path.slice(0, -1);

		return this.getNodeFromPath(newPath);
	}

	/**
	 * Find the closest node of the given kind.
	 * It will return the first node found traversing up the tree.
	 *
	 * @param  {AstNode}         node        The node to start from
	 * @param  {string}          closestKind The kind of node to find
	 * @return {AstNode|boolean}             The closest node or undefined
	 */
	closest(node: AstNode, closestKind: string): AstNode | boolean {
		const { path } = node;

		// Do initial check on path
		const checkKind = findLastIndex(path, (pathStep: string) => {
			return pathStep.endsWith(closestKind);
		});

		// If no match, return undefined
		if (checkKind === -1) {
			return false;
		}

		const newPath = path.slice(0, checkKind + 1);
		return this.getNodeFromPath(newPath);
	}

	/**
	 * Helper method to add node to list when
	 * using find or findByNodeName
	 *
	 * @param {AstNode}  node     The node to add to the list if it matches
	 * @param {string}   nodeName The name of the node
	 * @param {string[]} path     The path to the node
	 * @param {number}   level    The level of walk run
	 */
	addToList(node: AstNode, nodeName: string, path: string[], level: number) {
		const match = node[this.matchType];

		// Ignore false positives, e.g. matching the root node
		if (level === 0) {
			return;
		}

		if (this.matchAgainst.includes(match)) {
			this.nodesList.push(node);
		}
	}
}

export default Traverse;