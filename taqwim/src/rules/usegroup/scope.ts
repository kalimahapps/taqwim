/**
 * Ensure consistent state of use group
 */
import type {
	AllAstTypes,
	Loc,
	AstUseGroup,
	RuleContext,
	RuleDataOptional,
	RulePostContext
} from '@taqwim/types';

import type Fixer from '@taqwim/fixer';
import { findAhead } from '@taqwim/utils';

type GroupList = {
	namespace: string;
	groupName?: string;
	loc: Loc;
	alias?: string;
	parts: string[];
};

type Tree = {
	[key: string]: Tree;
};

type PathTree = {
	path: string[];
	value: Tree;
};

class UsegroupScope {
	/**
	 * The context of the rule
	 */
	context = {} as RulePostContext;

	/**
	 * The node of the rule
	 */
	node = {} as AllAstTypes;

	/**
	 * The position of the entire use groups
	 */
	position = {} as Loc;

	/**
	 * The current group name being processed
	 */
	currentGroup = '';

	/**
	 * The list of all use groups.
	 * It will be aggregated inside the process function and
	 * used inside the post function
	 */
	groups: Record<string, GroupList[]> = {
		use: [],
		const: [],
		function: [],
	};

	/**
	 * Update the position of the entire use groups,
	 * so it can be used to replace the entire use groups
	 *
	 * @param {Loc} position The position of the use group
	 */
	updatePosition(position: Loc) {
		if (!this.position.start || position.start.line < this.position.start.line) {
			this.position.start = position.start;
		}

		if (!this.position.end || position.end.line > this.position.end.line) {
			this.position.end = position.end;
		}
	}

	/**
	 * Create a tree from the list of use groups
	 *
	 * @example
	 * The tree will look something like this:
	 * {
	 * 	'App': {
	 * 		'Http': {
	 * 			'Controllers': {
	 * 				'Controller': {},
	 * 				'Middleware': {},
	 * 				'Kernel': {},
	 * 				},
	 * 			},
	 * 		}
	 * }
	 *
	 * @param  {GroupList[]} groupList The list of use groups
	 * @return {Tree}                  The tree
	 */
	createTree(groupList: GroupList[]): Tree {
		const tree: Tree = {};

		groupList.forEach((group) => {
			const { parts, alias = {} } = group;

			let current: Tree = tree;
			parts.forEach((part: string, partIndex: number) => {
				if (!current[part]) {
					// const alias = alias ?? {};
					const value = partIndex === parts.length - 1 ? alias : {};
					current[part] = value;
				}

				current = current[part];
			});
		});

		return tree;
	}

	/**
	 * Check that all children have two or less levels
	 *
	 * @param  {Tree}    tree  The tree to check
	 * @param  {number}  level The current level of the tree
	 *
	 * @return {boolean}       True if all children have two or less levels
	 */
	canBuild(tree: Tree, level = 0): boolean {
		const keys = Object.keys(tree);

		if (keys.length === 0) {
			return true;
		}

		const isThreeLevel = level < 2;
		const checkNested = keys.every((key) => {
			// ignore alias
			if (typeof tree[key] === 'string') {
				return true;
			}
			return this.canBuild(tree[key], level + 1);
		});

		return isThreeLevel && checkNested;
	}

	/**
	 * Build children for a specific tree node
	 *
	 * @param  {Tree}     tree The tree node
	 * @return {string[]}      The children
	 */
	buildChildren(tree: Tree): string[] {
		let children: string[] = [];

		Object.entries(tree).forEach(([key, value]) => {
			const path: string[] = [];

			// String means it is an alias
			if (typeof value === 'string') {
				children.push(`${key} as ${value}`);
				return;
			}

			const nested = Object.keys(value);
			path.push(key);
			if (nested.length === 0) {
				children.push([...path].join('\\'));
				return;
			}

			// Keep looping inside tree if there are more children
			nested.forEach((nestedKey) => {
				const nestedPath = [...path];

				const nestedValue = value[nestedKey];

				nestedPath.push(nestedKey);

				// String means it is an alias
				if (typeof nestedValue === 'string') {
					children.push(`${nestedPath.join('\\')} as ${nestedValue}`);
					return;
				}

				if (Object.keys(nestedValue).length === 0) {
					children.push([...nestedPath].join('\\'));
					return;
				}

				const nestedChildren = this.buildChildren(nestedValue)
					.map((nestedChild: string) => {
						return [...nestedPath, nestedChild].join('\\');
					});

				children = [...children, ...nestedChildren];
			});
		});

		return children;
	}

	/**
	 * Dive into the tree until it is not nested anymore.
	 *
	 * @example
	 * {
	 * 'App': {
	 * 		'Http': {
	 * 			'Controllers': {
	 * 				'Controller': {},
	 * 				'Middleware': {},
	 * 				'Kernel': {},
	 * 				},
	 * 			},
	 * 		}
	 * }
	 *
	 * The function will return App\Http\Controllers as the path,
	 * and the value will be the tree of Controller, Middleware, and Kernel
	 *
	 * @param  {Tree}     tree The tree to dive
	 * @param  {string}   key  The key of the tree
	 * @param  {string[]} path The current path
	 * @return {PathTree}      The new tree and the path
	 */
	diveUntilNotNested(tree: Tree, key: string, path: string[]): PathTree {
		let children = Object.keys(tree);
		let childrenCount = children.length;

		path = [...path, key];
		if (childrenCount !== 1) {
			return {
				value: tree,
				path,
			};
		}

		while (childrenCount === 1) {
			const [child] = children;
			tree = tree[child];
			path = [...path, child];

			children = Object.keys(tree);
			childrenCount = Object.keys(tree).length;
		}

		return {
			value: tree,
			path,
		};
	}

	/**
	 * Convert the tree to key value pair. The key
	 * will be the namespace and the value will an array
	 * of children. If the value is an empty array, it means
	 * that the key is the namespace itself.
	 *
	 * @example
	 * The tree will look something like this:
	 * {
	 * 	'App\\Http': [
	 * 		'Controllers\\Controller',
	 * 		'Middleware\\Auth',
	 * 		'Middleware\\VerifyCsrfToken',
	 * 	],
	 * }
	 *
	 * @param  {Tree}                     tree The tree to convert
	 * @param  {string}                   path The current path
	 *
	 * @return {Record<string, string[]>}      The converted tree
	 */
	buildTree(tree: Tree, path: string[] = []): Record<string, string[]> {
		let newTree: Record<string, string[]> = {};

		Object.entries(tree).forEach(([key, value]) => {
			const element = {
				[key]: value,
			};

			if (this.canBuild(element)) {
				const elementChildren = this.buildChildren(element);

				// If not path exists, then make the elementChildren as the key
				// since it does not have any children
				if (path.length === 0) {
					newTree[elementChildren.join('\\')] = [];
					return;
				}

				if (elementChildren.length === 0) {
					const pathString = [...path].join('\\');
					newTree[pathString] = [];
					return;
				}

				const pathString = [...path].join('\\');
				newTree[pathString] = newTree[pathString] ?? [];
				newTree[pathString].push(...elementChildren);
				return;
			}
			let builtTree = {};

			// Keep looping inside tree if there is only one child
			const findNested = this.diveUntilNotNested(value, key, path);
			const childrenCount = Object.keys(findNested.value).length;

			// If value is an empty object, we can assume that the key is the
			// path includes the whole namespace
			if (childrenCount === 0) {
				newTree[findNested.path.join('\\')] = [];
				return;
			}

			builtTree = this.buildTree(findNested.value, findNested.path);

			newTree = {
				...newTree,
				...builtTree,
			};
		});
		return newTree;
	}

	/**
	 * Build a string from the tree
	 *
	 * @param  {Record<string, string[]>} tree The tree to convert
	 * @return {string}                        The string
	 */
	buildTreeString(tree: Record<string, string[]>): string {
		let treeString = '';

		const groupKey = this.currentGroup === 'use' ? '' : `${this.currentGroup} `;

		Object.entries(tree).forEach(([key, children]) => {
			if (children.length > 1) {
				treeString += `use ${groupKey}${key}\\{\n`;
				treeString += children.join(',\n');
				treeString += '\n};\n';
				return;
			}

			// For one child or less, make it a single use statement
			const keyArray = [key, ...children];

			treeString += `use ${groupKey}${keyArray.join('\\')};\n`;
		});

		return treeString;
	}

	/**
	 * Report and replace use group
	 *
	 * @param {string} treeString The tree string
	 * @param {string} type       The type of report
	 */
	reportAndFix(treeString: string, type: string) {
		const { report } = this.context;
		const message = type === 'collapse' ? 'Use statements should be grouped' : 'Use statements should be expanded';

		report({
			message,
			position: this.position,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(this.position, treeString);
			},
		});
	}

	/**
	 * Convert the group list to a string for expand state
	 *
	 * @param  {GroupList[]} groupList The group list
	 * @return {string}                The string
	 */
	buildExpandString(groupList: GroupList[]): string {
		const groupKey = this.currentGroup === 'use' ? '' : `${this.currentGroup} `;
		return groupList.map((group) => {
			const { namespace, alias } = group;
			return `use ${groupKey}${namespace}${alias ? ` as ${alias}` : ''};`;
		}).join('\n');
	}

	/**
	 * This function will remove line breaks and leading spaces
	 * from the string so it can be compared with another string
	 *
	 * @param  {string} string The string to remove whitespace
	 * @return {string}        The string without whitespace
	 */
	removeWhitespace(string: string): string {
		return string.replaceAll(/\s/gmu, '');
	}

	pre() {
		// Clear position before processing
		this.position = {} as Loc;

		// Clear groups before processing
		this.groups = {
			use: [],
			const: [],
			function: [],
		};
	}

	/**
	 * Entry point of the rule processing
	 *
	 * @param {RuleContext} context The context of the rule
	 */
	process(context: RuleContext) {
		const { sourceLines, node } = context;
		this.node = node;

		const { name: groupName, items, loc, type } = this.node as unknown as AstUseGroup;
		const groupKey = type ?? 'use';

		items.forEach((item) => {
			const { name, alias } = item;
			if (!name) {
				return;
			}

			const namespace = groupName ? `${groupName}\\${name}` : name;

			const lastLine = sourceLines.at(-1);
			if (lastLine === undefined) {
				return;
			}

			// Update use group end location to include ;
			const findGroupEnd = findAhead(sourceLines, {
				start: loc.end,
				end: {
					line: sourceLines.length - 1,
					column: lastLine.length,
				},
			}, ';');

			if (!findGroupEnd) {
				return;
			}

			const position = {
				start: loc.start,
				end: {
					line: findGroupEnd.line,
					column: findGroupEnd.column + 1,
					offset: findGroupEnd.offset + 1,
				},
			};

			this.updatePosition(position);

			this.groups[groupKey].push({
				namespace,
				loc: position,
				alias: alias?.name,
				parts: namespace.split('\\'),
			});
		});
	}

	post(context: RulePostContext) {
		this.context = context;

		const { sourceCode, options } = context;
		const { state } = options;
		const finalStringArray: string[] = [];
		Object.entries(this.groups).forEach(([group, groupList]) => {
			this.currentGroup = group;
			const tree = this.createTree(groupList);

			if (state === 'expand') {
				const expandString = this.buildExpandString(groupList);

				// If file does not contain any use group, then expandString will be empty
				if (expandString !== '') {
					finalStringArray.push(expandString);
				}

				return;
			}

			const newTree = this.buildTree(tree);
			const treeString = this.buildTreeString(newTree);

			// If file does not contain any use group, then treeString will be empty
			if (treeString !== '') {
				finalStringArray.push(treeString);
			}
		});

		// If finalStringArray is empty, it means that the file does not contain any use group
		if (finalStringArray.length === 0) {
			return;
		}

		// Get the string of the current usegroup from sourcecode,
		// so it can be compared with the new tree string
		const { start, end } = this.position;

		const currentTreeString = sourceCode.slice(start.offset, end.offset);

		// currentTreeString = currentTreeString.replaceAll(/\n\s*/gmu, '');
		const finalString = finalStringArray.join('\n');

		// Compare current tree string with new tree string with whitespace removed.
		// If they are the same, it means that the tree is already fixed or it
		// does not need to be fixed
		if (this.removeWhitespace(finalString) === this.removeWhitespace(currentTreeString)) {
			return;
		}

		this.reportAndFix(finalString, state);
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure consistent state of use group',
			fixable: true,
			preset: 'taqwim',
		},
		defaultOptions: {
			state: {
				type: 'string',
				oneOf: [
					{
						const: 'expand',
						type: 'string',
						description: 'Expand use group to individual use statements',
					},
					{
						const: 'collapse',
						type: 'string',
						description: 'Merge use statements with the same namespace into the same scope',
					},
				],
				default: 'collapse',
				description: 'The state of the use group',
			},
		},

		// Add order to make run after usergroup rules
		order: 10,
		name: 'usegroup.scope',
		register: ['usegroup'],
		bindClass: UsegroupScope,
	};
};
