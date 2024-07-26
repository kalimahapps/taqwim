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

	// group is used to reconstruct the use group
	groupKey: string;
	alias?: string;
	children?: GroupList[];
	loc?: Loc;
};

class UsegroupSort {
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
	 * This flag is used to check if the children of the use group
	 * is reporting a fix. If so, the entire use group should not
	 * be reported as a fix until the children is fixed. This prevents
	 * both running at the same time and causing a conflict in the AST
	 * since it is not updated yet
	 */
	hasScopeFix = false;

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
	 * Report and replace use group
	 *
	 * @param {string} treeString The tree string
	 * @param {Loc}    position   The position of the use group
	 */
	reportAndFix(treeString: string, position: Loc) {
		const { report } = this.context;

		report({
			message: 'Use group is not sorted',
			position,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(position, treeString);
			},
		});
	}

	pre() {
		this.hasScopeFix = false;

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

		// Group name indicates that it is a top level group
		// if it is not present, it means there is one use group
		// e.g. use Illuminate\Support\Facades\DB;
		if (!groupName) {
			const [firstItem] = items;
			const group: GroupList = {
				namespace: firstItem.name,
				groupKey,
				alias: firstItem.alias?.name,
				children: [],
			};

			this.groups[groupKey].push(group);
			return;
		}

		// Handle use group with children
		const group: GroupList = {
			namespace: groupName,
			groupKey,
			children: [],
			loc: position,
		};

		const children: GroupList[] = items.map((item) => {
			const { name, alias } = item;

			return {
				namespace: name,
				groupKey,
				alias: alias?.name,
			};
		});

		group.children = children;
		this.groups[groupKey].push(group);
	}

	/**
	 * Check if two arrays are equal
	 *
	 * @param  {GroupList[]} a The first array
	 * @param  {GroupList[]} b The second array
	 * @return {boolean}       True if the arrays are equal
	 */
	isEqualArray(a: GroupList[], b: GroupList[]): boolean {
		return JSON.stringify(a) === JSON.stringify(b);
	}

	/**
	 * Reconstruct the use group to a string
	 *
	 * @param  {GroupList} group The use group
	 * @return {string}          The string of the use group
	 */
	buildGroupString(group: GroupList): string {
		const { namespace, alias, children, groupKey } = group;

		const groupString = groupKey === 'use' ? '' : `${groupKey} `;

		// No children, return the use group
		if (!children || children.length === 0) {
			return `use ${groupString}${namespace}${alias ? ` as ${alias}` : ''};`;
		}

		// Reconstruct the children string
		const childrenString = children.map((child) => {
			const { namespace, alias } = child;
			return `${namespace}${alias ? ` as ${alias}` : ''}`;
		}).join(',\n');

		const returnString = `use ${groupString}${namespace}\\{`;
		return `${returnString}\n${childrenString}\n};`;
	}

	/**
	 * Check if the use group children is sorted and process the fix
	 *
	 * @param {GroupList} group The use group
	 */
	reportAndFixChildren = (group: GroupList) => {
		const { children, loc } = group;

		if (!children || children.length === 0) {
			return;
		}

		const childrenClone: GroupList[] = JSON.parse(JSON.stringify(children));

		const sortedChildren = childrenClone.sort((a, b) => {
			const aParts = a.namespace;
			const bParts = b.namespace;

			return aParts.localeCompare(bParts, undefined, {
				sensitivity: 'base',
			});
		});

		const isEqual = this.isEqualArray(children, sortedChildren);
		if (isEqual === true) {
			return;
		}

		group.children = sortedChildren;
		const groupString = this.buildGroupString(group);

		if (!loc) {
			return;
		}

		this.hasScopeFix = true;
		this.reportAndFix(groupString, loc);
	};

	/**
	 * Check if the use group is sorted and process the fix
	 *
	 * @param {RulePostContext} context The context of the rule
	 */
	post(context: RulePostContext) {
		this.context = context;

		const sortedGroups: GroupList[] = [];
		Object.values(this.groups).forEach((groupList) => {
			// Clone the group list so it won't be mutated
			const cloneGroupList: GroupList[] = JSON.parse(JSON.stringify(groupList));

			// Check if top level group is sorted
			const sortedList = cloneGroupList.sort((a, b) => {
				const aParts = a.namespace;
				const bParts = b.namespace;

				return aParts.localeCompare(bParts, undefined, {
					sensitivity: 'base',
				});
			});

			// Check the children of each group if it is sorted
			groupList.forEach(this.reportAndFixChildren);

			sortedGroups.push(...sortedList);
		});

		if (sortedGroups.length === 0 || this.hasScopeFix === true) {
			return;
		}

		const { use: useGroup, const: constGroup, function: functionGroup } = this.groups;

		// If the sorted groups is equal to the original groups, then it is sorted
		// and no need to report a fix
		const isEqual = this.isEqualArray(
			sortedGroups,
			[...useGroup, ...constGroup, ...functionGroup]
		);

		if (isEqual === true) {
			return;
		}

		const groupString = sortedGroups.map(this.buildGroupString);

		this.reportAndFix(groupString.join('\n'), this.position);
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure usegroups are sorted',
			fixable: true,
			preset: 'taqwim',
		},

		// Add order to make run after other usergroup rules
		order: 20,
		name: 'usegroup.sort',
		register: ['usegroup'],
		bindClass: UsegroupSort,
	};
};
