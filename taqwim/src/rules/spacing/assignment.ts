/**
 * Ensure that assignment operator has consistent spacing.
 * This rule also provides the ability to align assignment with adjacent statements.
 * Alignment only works with single line statements.
 */
/* eslint complexity: ["warn", 7] */
import type Fixer from '@taqwim/fixer';
import type {
	RuleDataOptional,
	RuleContext,
	AstExpressionStatement,
	AstAssign,
	Loc,
	AstNode,
	AstFor,
	AllAstTypes
} from '@taqwim/types';
import { findAheadRegex, skipRegex } from '@taqwim/utils';

class AssignmentAlign {
	/**
	 * Rule context
	 */
	context = {} as RuleContext;

	/**
	 * Current node
	 */
	node = {} as AllAstTypes;

	/**
	 * Get assignment operator position
	 *
	 * @param  {Loc}       searchRange Search range
	 * @param  {string}    operator    Operator to search for
	 * @return {Loc|false}             Operator position or false if not found
	 */
	getOperatorPosition(searchRange: Loc, operator = '='): Loc | false {
		const { sourceLines } = this.context;

		const skippedOperator = skipRegex(operator);
		const regex = new RegExp(`(?<operator>${skippedOperator})(?!>)`, 'u');
		const operatorPosition = findAheadRegex(
			sourceLines,
			searchRange,
			regex
		);

		if (operatorPosition === false || operatorPosition?.groups?.operator === undefined) {
			return false;
		}

		return operatorPosition.groups.operator;
	}

	/**
	 * Check if the current node has been processed by
	 * a previous iteration of the rule. Since each iteration
	 * the rule checks for all next element, we need to check if
	 * there is a previous node that is adjacent to the current node
	 *
	 * @return {boolean} True if the node has been processed
	 */
	hasBeenProcessed(): boolean {
		const { node } = this.context;
		const { traverse } = node;
		const previousSibling = traverse.prevSibling();
		if (previousSibling === false) {
			return false;
		}

		const { expression } = previousSibling;

		if (!expression || expression.kind !== 'assign') {
			return false;
		}

		const { loc: previousLoc } = expression as AstAssign;
		const { loc } = node;

		return loc.start.line - previousLoc.start.line === 1
			&& loc.start.column === previousLoc.start.column;
	}

	/**
	 * Get adjacent assignment nodes
	 *
	 * @return {AstNode[]} Array of assignment nodes
	 */
	getAssignmentNodes(): AstNode[] {
		const { node } = this.context;
		const { traverse, expression } = node;
		const { loc } = expression as AstAssign;
		const assignmentNodes = [node];

		// Keep looping through the next siblings until we find a non-assignment
		// or the next sibling is not on the same line
		let nextSibling: AstNode | false = traverse.nextSibling();
		let currentLoc = loc;

		do {
			if (nextSibling === false) {
				break;
			}

			const { expression: nextExpression } = nextSibling;
			if (nextExpression?.kind !== 'assign') {
				break;
			}

			const { loc: nextLoc } = nextExpression as AstAssign;

			// Make sure that the next sibling and the current one are:
			// on adjacent lines
			// start on the same column
			if (
				nextLoc.start.line - currentLoc.start.line !== 1
				|| nextLoc.start.column !== currentLoc.start.column
			) {
				break;
			}

			assignmentNodes.push(nextSibling);

			currentLoc = nextSibling.loc;
			nextSibling = nextSibling.traverse.nextSibling();
		} while (nextSibling !== false);

		return assignmentNodes;
	}

	/**
	 * Report and fix space to the right of operator
	 *
	 * @param  {AstNode} node Node to report
	 * @return {boolean}      false if there was no report
	 */
	reportAndFixTraillingSpace(node: AstNode): boolean {
		const { report, sourceLines } = this.context;

		const assingNode = node.expression as AstAssign ?? node;
		const { right, loc } = assingNode as AstAssign;
		const operatorPosition = this.getOperatorPosition(loc);

		if (operatorPosition === false) {
			return false;
		}

		/**
		 * we can not use right.loc because it provides the wrong start
		 * position (column and offset) when using nullsafe operator
		 * e.g. $foo = $bar?->baz;
		 *
		 * @see https://github.com/glayzzle/php-parser/issues/1128
		 */
		const rightPosition = findAheadRegex(
			sourceLines,
			{
				start: operatorPosition.end,
				end: right.loc.end,
			},
			/(?<rightLoc>\S+)/u
		);

		if (rightPosition === false || rightPosition?.groups?.rightLoc === undefined) {
			return false;
		}

		const { rightLoc } = rightPosition.groups;
		const foundSpace = rightLoc.start.column - operatorPosition.end.column;
		const isCorrectSpacing = foundSpace === 1;

		if (rightLoc.start.line !== operatorPosition.end.line || isCorrectSpacing === true) {
			return false;
		}

		const position = {
			start: operatorPosition.end,
			end: {
				line: operatorPosition.end.line,
				column: operatorPosition.end.column + foundSpace,
				offset: operatorPosition.end.offset + foundSpace,
			},
		};

		report({
			message: `Operator \`=\` must have a single trailing space. Found ${foundSpace} spaces.`,
			position,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(position, ' ');
			},
		});

		return true;
	}

	/**
	 * Report and fix space to the left of operator
	 *
	 * @param  {AstNode} node Node to report
	 * @return {boolean}      false if there was no report
	 */
	reportAndFixLeadingSpace(node: AstNode): boolean {
		const { report } = this.context;

		const assignNode = node.expression as AstAssign ?? node;
		const { left, operator, loc } = assignNode as AstAssign;
		const operatorPosition = this.getOperatorPosition(loc, operator);

		if (operatorPosition === false || left.loc.end.line !== operatorPosition.start.line) {
			return false;
		}

		const { start: operatorStart } = operatorPosition;
		const foundSpaces = operatorStart.column - left.loc.end.column;
		if (foundSpaces === 1) {
			return false;
		}

		// Operator length accounts for any preceding marks (e.g. +,-,., etc)
		const position = {
			start: left.loc.end,
			end: operatorStart,
		};

		report({
			message: `Operator \`=\` must have a single leading space. Found ${foundSpaces} spaces.`,
			position,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(position, ' ');
			},
		});

		return true;
	}

	/**
	 * Report and fix space to the left of operator for multi-line statements
	 *
	 * @param  {AstNode} node           Node to report
	 * @param  {number}  expectedLength Expected length of the left side
	 * @return {boolean}                True if the report was made
	 */
	reportAndFixMultiLeadingSpace(node: AstNode, expectedLength: number): boolean {
		const { report, sourceLines } = this.context;
		const { left, operator } = node.expression as AstAssign;
		const operatorPosition = this.getOperatorPosition(node.loc, operator);

		const { end: leftEnd, start: leftStart } = left.loc;
		const leftLength = leftEnd.column - leftStart.column;

		if (operatorPosition === false || leftLength === expectedLength) {
			return false;
		}

		// Operator length accounts for any preceding marks (e.g. +,-,., etc)
		// If the operator is only `=` then no changes will occur and everyone
		// will be happy
		const operatorLength = operator.replace('=', '').length;

		const { start } = operatorPosition;

		const requiredSpaces = expectedLength - operatorLength - leftLength;
		const foundSpaces = start.column - leftEnd.column;

		if (foundSpaces === requiredSpaces) {
			return false;
		}

		report({
			message: `Operator \`=\` must have ${requiredSpaces} leading spaces. Found ${foundSpaces} spaces.`,
			position: {
				start: leftEnd,
				end: start,
			},
			fix: (fixer: Fixer) => {
				// Because the left could be a variable, a property access,
				// or other expressions, we need to get the actual content by
				// slicing the source code
				const leftContent = sourceLines[start.line].slice(leftStart.column, leftEnd.column);

				const padingLength = expectedLength - operatorLength;

				// apply spaces to the left of the left content
				const name = leftContent.padEnd(padingLength, ' ');

				const replaceRange = {
					start: leftStart,
					end: start,
				};

				return fixer.replaceRange(replaceRange, name);
			},
		});

		return true;
	}

	/**
	 * Report and fix space for for loop init
	 *
	 * @return {boolean} True if the rule was applied
	 */
	reportAndFixForLoop(): boolean {
		const { init } = this.node as AstFor;
		init.forEach((initExpression) => {
			if (initExpression.kind !== 'assign') {
				return;
			}

			this.reportAndFixLeadingSpace(initExpression as AstNode);
			this.reportAndFixTraillingSpace(initExpression as AstNode);
		});

		return true;
	}

	/**
	 * Process the rule
	 *
	 * @param  {RuleContext} context Rule context
	 * @return {boolean}             True if the rule was applied
	 */
	process(context: RuleContext): boolean {
		this.context = context;
		this.node = context.node;
		const { node, options } = context;
		const { expression } = node as AstExpressionStatement;

		// if for loop then handle init assign
		if (node.kind === 'for') {
			return this.reportAndFixForLoop();
		}

		if (expression.kind !== 'assign') {
			return false;
		}

		if (options.align === false) {
			this.reportAndFixLeadingSpace(node);
			this.reportAndFixTraillingSpace(node);
			return true;
		}

		const isProcessed = this.hasBeenProcessed();
		if (isProcessed) {
			return false;
		}

		// Get adjacent assignment nodes
		const assignmentNodes: AstNode[] = this.getAssignmentNodes();

		// If there is only one assignment node then there is nothing to align
		if (assignmentNodes.length === 1) {
			this.reportAndFixLeadingSpace(assignmentNodes[0]);
			this.reportAndFixTraillingSpace(assignmentNodes[0]);
			return false;
		}

		let expectedLength = 1;

		// Loop through the assignment nodes and find the longest left length
		assignmentNodes.forEach((assignmentNode) => {
			const { expression } = assignmentNode;
			const { left, loc: assignmentLoc, operator } = expression as AstAssign;

			const operatorPosition = this.getOperatorPosition(assignmentLoc);

			if (operatorPosition === false) {
				return;
			}

			const { start } = operatorPosition;

			const { start: startLeft, end: endLeft } = left.loc;

			// Add length for assignment operators with preceding marks (e.g. **, +,-,., etc)
			const operatorLength = operator.replace('=', '').length;

			/*
			* Make sure to count one space between the left and the operator.
			* This accounts for cases where the longest left has multiple spaces.
			* e.g.
			* $foobar = 1;
			* $bar      = 2; // This should not be considered as the longest left
			*/
			const diff = start.column - endLeft.column;

			// Calculate the length of the left side (+ 1 is to make sure a single space is counted)
			let leftLength = (start.column - diff) + 1 + operatorLength;

			// Make sure indent is not counted
			leftLength = leftLength - startLeft.column;

			if (leftLength > expectedLength) {
				expectedLength = leftLength;
			}
		});

		assignmentNodes.forEach((assignmentNode) => {
			this.reportAndFixMultiLeadingSpace(assignmentNode, expectedLength);
			this.reportAndFixTraillingSpace(assignmentNode);
		});

		return true;
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that assignment operator has consistent spacing',
			fixable: true,
			preset: 'psr',
		},
		severity: 'warning',
		name: 'spacing.assignment',
		defaultOptions: {
			align: {
				type: 'boolean',
				description: 'Align assignment with adjacent statements',
				default: false,
			},
		},
		register: ['expressionstatement', 'for'],
		bindClass: AssignmentAlign,
	};
};
