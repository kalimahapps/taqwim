/**
 * Ensure that the indentation is consistent
 */
/* eslint complexity: ["warn", 11] */
import { getOffsetFromLineAndColumn, getOptions } from '@taqwim/utils/index';
import type Fixer from '@taqwim/fixer';
import type {
	Loc,
	RuleContext,
	RuleDataOptional,
	RulePostContext,
	AstBin,
	AstBlock,
	AstIf,
	AstMethod,
	AstNodeBase,
	AstNoop,
	AstReturnIf,
	AstIdentifier,
	AstAssign,
	AstLookup,
	AstEncapsed,
	AstComment,
	AstObject,
	AstTry,
	AstCatch,
	AstFor,
	AstForeach,
	AstCall,
	AstArray,
	AstList,
	AstEcho,
	AllAstTypes,
	RulePreContext,
	AstMatch,
	AstParameter,
	CallbacksMap,
	AstEnum
} from '@taqwim/types';
import { WithCallMapping } from '@taqwim/decorators';

type WhitespaceMap = {
	[key: string]: boolean;
};

type BlockLines = {
	startLine: number;
	endLine: number;
};

class Indent {
	/**
	 * The context of the rule
	 */
	context = {} as RuleContext;

	/**
	 * The node to process
	 */
	node = {} as AllAstTypes;

	/**
	 * Map of callbacks to call for each node
	 */
	callbacksMap: CallbacksMap = {
		objectCallback: ['class', 'interface', 'trait'],
		retifCallback: ['retif'],
		ifCallback: ['if'],
		methodCallback: ['method', 'function'],
		bodyChildrenCallback: ['foreach', 'for', 'try', 'catch', 'do', 'while', 'switch', 'case', 'closure'],
		callChildrenCallback: ['call'],
		expressionStatementCallback: ['expressionstatement'],
		itemsCallback: ['array', 'list'],
		assignCallback: ['assign'],
		binCallback: ['bin'],
		commentCallback: ['commentblock'],
		echoCallback: ['echo'],
		matchCallback: ['match'],
		enumCallback: ['enum'],
	};

	/**
	 * Get leading and trailing comment start and end lines
	 *
	 * @param  {AstNodeBase|AstNodeBase[]} node The node or nodes to check
	 * @return {object}                         Object containing the start and end lines,
	 *                                          or -1 for each if not found
	 */
	getCommentLines = (node: AstNodeBase | AstNodeBase[]) => {
		const nodes: AstNodeBase[] = Array.isArray(node) ? node : [node];

		const leadingComment = nodes.at(0)?.leadingComments?.at(0);
		const trailingComment = nodes?.at(-1)?.trailingComments?.at(0);

		const commentLines = {
			commentStartLine: -1,
			commentEndLine: -1,
		};

		if (leadingComment) {
			const { start } = leadingComment.loc;
			if (start.line !== nodes[0].loc.start.line) {
				commentLines.commentStartLine = start.line;
			}
		}

		if (trailingComment !== undefined) {
			const { end } = trailingComment.loc;

			// A possible bug in parser. Trailing comment end might be on
			// the next line but on the first (0) column. So we need to
			// account for that.
			commentLines.commentEndLine = end.column === 0 ? end.line - 1 : end.line;
		}

		return commentLines;
	};

	/**
	 * Get the start and end lines of a noop node
	 *
	 * @param  {AstNoop} noopNode The noop node
	 * @return {object}           Object containing the start and end lines
	 */
	getNoopLines = (noopNode: AstNoop) => {
		const { end } = noopNode.loc;
		const { start: commentStart } = noopNode.leadingComments[0].loc;

		// if comment is on the same line as the node, return -1
		// end is used because the start location is swapped with
		// the end location (bug)
		// @see https://github.com/glayzzle/php-parser/issues/1063
		if (commentStart.line === end.line) {
			return {
				startLine: -1,
				endLine: -1,
			};
		}

		const commentEnd = noopNode.leadingComments.at(-1)?.loc?.end;
		const commentStartLine = commentStart.line;
		let commentEndLine = commentEnd?.line ?? -1;

		if (commentEnd?.column === 0) {
			commentEndLine = commentEndLine - 1;
		}

		return {
			startLine: commentStartLine,
			endLine: commentEndLine,
		};
	};

	/**
	 * Check start and end line against parent node
	 *
	 * @param  {number}     childStartLine The start line
	 * @param  {number}     childEndLine   The end line
	 * @param  {AstNode}    parent         The parent node
	 * @return {BlockLines}                Object containing the start and end lines
	 */
	checkAgainstParentLines = (
		childStartLine: number,
		childEndLine: number,
		parent?: AstNodeBase
	): BlockLines => {
		if (!parent) {
			return {
				startLine: childStartLine,
				endLine: childEndLine,
			};
		}

		const { start, end } = parent.loc;
		let newStartLine = childStartLine;
		let newEndLine = childEndLine;

		if (start.line === childStartLine) {
			newStartLine = newStartLine + 1;
		}

		if (end.line === childEndLine) {
			newEndLine = newEndLine - 1;
		}

		return {
			startLine: newStartLine,
			endLine: newEndLine,
		};
	};

	/**
	 * Get the start line of the first child node and the end line of the last child node
	 *
	 * @param  {any[]}       list   List of child nodes
	 * @param  {AstNodeBase} parent Parent node
	 * @return {BlockLines}         Object containing the start line and end line
	 */
	getBlockLines(list: AstNodeBase[], parent?: AstNodeBase): BlockLines {
		const { sourceLines } = this.context;
		if (list.length === 0) {
			const { line: startLine } = this.node.loc.start;
			const { line: endLine } = this.node.loc.end;

			if (startLine === endLine) {
				return {
					startLine,
					endLine: startLine,
				};
			}

			// Since list is empty check for braces
			const startBrace = sourceLines[startLine].trim() === '{';
			const endBrace = sourceLines[endLine].trim() === '}';

			if (startBrace || endBrace) {
				return {
					startLine: startBrace ? startLine : -1,
					endLine: endBrace ? endLine : -1,
				};
			}

			// No child nodes and no braces, return node lines
			return {
				startLine,
				endLine,
			};
		}

		// Noop child has a bug where start and end location are swapped
		if (list[0].kind === 'noop') {
			return this.getNoopLines(list[0]);
		}

		let startLine = list[0].loc.start.line;

		const { commentStartLine, commentEndLine } = this.getCommentLines(list);

		// Apply comment start line if it exists
		if (commentStartLine !== -1) {
			startLine = commentStartLine;
		}

		let endLine = list.at(-1)?.loc.end.line;

		// Apply comment end line if it exists
		if (commentEndLine !== -1) {
			endLine = commentEndLine;
		}

		if (endLine === undefined) {
			endLine = startLine;
		}

		return this.checkAgainstParentLines(startLine, endLine, parent);
	}

	/**
	 * Loop through each line and add the indent length to the payload
	 *
	 * @param {number} startLine The start line of the loop
	 * @param {number} endLine   The end line of the loop
	 * @param {string} extra     Extra string to add to the line
	 */
	addLineIndent(startLine: number, endLine: number, extra = '') {
		// If lines are not defined, don't proceed
		if (
			startLine === undefined ||
			endLine === undefined ||
			startLine === -1 ||
			endLine === -1
		) {
			return;
		}

		const { options, payload } = this.context;
		const { length: indentLength } = options;
		const { kind } = this.node;

		for (let index: number = startLine; index <= endLine; index++) {
			payload.lines[index] = payload.lines[index] === undefined ? {
				length: indentLength,
				kind: [kind],
			} : {
				length: payload.lines[index].length + indentLength,
				kind: [...payload.lines[index].kind, kind, extra],
			};
		}
	}

	/**
	 * Remove the indent length from the payload
	 *
	 * @param {number}  startLine The start line of the loop
	 * @param {number}  endLine   The end line of the loop
	 * @param {boolean} ignore    Reset the indent to 0
	 */
	removeLineIndent(startLine: number, endLine: number, ignore = false) {
		// If lines are not defined, don't proceed
		// if (startLine === undefined || endLine === undefined) {
		// 	return;
		// }

		const { options, node, payload } = this.context;
		const { length: indentLength } = options;
		const { kind } = node;
		for (let index: number = startLine; index <= endLine; index++) {
			// First check if the line is to be ignored
			if (ignore) {
				payload.lines[index] = {
					length: 0,
					kind: [kind],
					ignore,
				};
				continue;
			}

			// If the line was not already added, no need to remove indent
			if (payload.lines[index] === undefined) {
				continue;
			}

			// Set the indent length for this line
			const lineIndentLength = payload.lines[index].length - indentLength;

			payload.lines[index] = {
				length: Math.max(lineIndentLength, 0),
				kind: [...payload.lines[index].kind, kind],
				ignore,
			};
		}
	}

	/**
	 * Handle match statement
	 */
	enumCallback() {
		const { body } = this.node as AstEnum;

		const { startLine, endLine } = this.getBlockLines(body, this.node);
		this.addLineIndent(startLine, endLine);
	}

	/**
	 * Handle match statement
	 */
	matchCallback() {
		const { arms } = this.node as AstMatch;

		const { startLine, endLine } = this.getBlockLines(arms, this.node);
		this.addLineIndent(startLine, endLine);
	}

	/**
	 * Set comment to be ignored if it is a docblock.
	 * Only the first line of the docblock will be processed.
	 * The rest will be processed by another rule.
	 */
	commentCallback() {
		const { value, loc } = this.node as AstComment;

		if (!value.trim().startsWith('/**')) {
			return;
		}

		const { start, end } = loc;
		const startLine = start.line + 1;
		const endLine = end.line;

		this.removeLineIndent(startLine, endLine, true);
	}

	/**
	 * Object callback. eg. class, interface, trait
	 */
	objectCallback() {
		const { body } = this.node as AstObject;
		const { startLine, endLine } = this.getBlockLines(body, this.node);
		this.addLineIndent(startLine, endLine);
	}

	/**
	 * Ternary callback. eg. $a ? $b : $c
	 */
	retifCallback() {
		const { trueExpr, falseExpr, traverse } = this.node as AstReturnIf;

		// Check parent and only process if it is a retif
		const parent = traverse.parent();
		if (parent === false || parent.kind !== 'retif' || !trueExpr) {
			return;
		}

		const {
			startLine,
			endLine,
		} = this.getBlockLines([trueExpr, falseExpr], parent);

		this.addLineIndent(startLine, endLine);
	}

	/**
	 * If callback. Alternate refers to the else statement
	 */
	ifCallback() {
		const { body, alternate } = this.node as AstIf;

		// Single line if statement (without braces)
		if (body.children === undefined) {
			return;
		}

		const { startLine, endLine } = this.getBlockLines(body.children, body);
		this.addLineIndent(startLine, endLine);

		const alternateNode = alternate as AstIf;
		if (alternate?.kind === 'block') {
			const alternateNodeBlock = alternate as AstBlock;
			const { children } = alternateNodeBlock;
			const {
				startLine: alternateStartLine,
				endLine: alternateEndLine,
			} = this.getBlockLines(children, alternateNode);

			this.addLineIndent(alternateStartLine, alternateEndLine);
		}
	}

	/**
	 * Check if arguments of a methood, function, call
	 * are defined and if they are, add the indent
	 * if they are not on the same line
	 *
	 * @param  {AstArgument[]}    parameters The node to check
	 * @param  {AstIdentifier}    identifier The identifier of the node
	 * @return {false|BlockLines}            BlockLines with start and end lines if they are not on
	 *                                       the same line, false otherwise
	 */
	handleArguments(parameters: AstParameter[], identifier: AstIdentifier): BlockLines | false {
		// Get identifier lines and compare them to the parameters lines
		const { loc } = identifier;
		const { line: identifierStartLine } = loc.start;
		const { line: identifierEndLine } = loc.end;

		let {
			startLine: parameterStartLine,
			endLine: parameterEndLine,
		} = this.getBlockLines(parameters);

		// No need to process if paramters are on the same line as the identifier
		if (parameterStartLine === identifierStartLine && parameterEndLine === identifierEndLine) {
			return false;
		}

		if (parameterStartLine === identifierEndLine) {
			parameterStartLine = parameterStartLine + 1;
		}

		this.addLineIndent(parameterStartLine, parameterEndLine, 'paramters');
		return {
			startLine: parameterStartLine,
			endLine: parameterEndLine,
		};
	}

	/**
	 * Handle binary expressions (if, else if, else)
	 */
	binCallback() {
		const { left, right, traverse } = this.node as AstBin;
		const parent = traverse.parent();

		// .parent method returns false if there is no parent
		// and an object if there is a parent
		if (parent === false) {
			return;
		}

		const parentsAllowed = ['if', 'elseif', 'else'];
		if (!parentsAllowed.includes(parent.kind)) {
			return;
		}

		let { startLine, endLine } = this.getBlockLines([left, right]);
		const parentStartLine = parent.loc.start.line;
		if (startLine === endLine) {
			return;
		}

		if (startLine === parentStartLine) {
			startLine = startLine + 1;
		}

		this.addLineIndent(startLine, endLine);
	}

	/**
	 * Method and function callback
	 */
	methodCallback() {
		const { body, arguments: parameters, name } = this.node as AstMethod;
		const { startLine, endLine } = this.getBlockLines(body.children, body);
		this.addLineIndent(startLine, endLine);

		if (parameters.length === 0) {
			return;
		}

		this.handleArguments(parameters, name);
	}

	/**
	 * Handle node with body children. e.g. foreach, try, catch, .. etc
	 */
	bodyChildrenCallback() {
		const { body, kind } = this.node as AstTry & AstCatch & AstFor & AstForeach;

		let { startLine, endLine } = this.getBlockLines(body.children, this.node);

		const { commentStartLine, commentEndLine } = this.getCommentLines(body);

		// Apply comment start line if it exists
		if (commentStartLine !== -1) {
			startLine = commentStartLine;
		}

		// Apply comment end line if it exists
		if (commentEndLine !== -1) {
			endLine = commentEndLine;
		}

		this.addLineIndent(startLine, endLine);

		// Check for `finally` block if kind is `try`
		const { always } = this.node as AstTry;
		if (kind !== 'try' || !always || always.children === undefined) {
			return;
		}

		const { children } = always;
		const {
			startLine: alwaysStartLine,
			endLine: alwaysEndLine,
		} = this.getBlockLines(children, always);

		this.addLineIndent(alwaysStartLine, alwaysEndLine);
	}

	/**
	 * Handle property lookup, nullsafe property lookup, method call
	 * e.g. $this->property, $this?->property, $this->method()
	 */
	expressionStatementCallback() {
		const { traverse } = this.node;

		// Look for offset nodes that are part of a nullsafe property lookup
		// or a property lookup
		const offsetNodes = traverse.findByNodeName(['offset']);
		if (offsetNodes.length === 0) {
			return;
		}

		const firstOffsetNode = offsetNodes.at(-1);
		const lastOffsetNode = offsetNodes.at(0);

		if (firstOffsetNode === undefined || lastOffsetNode === undefined) {
			return;
		}

		const objectReference = firstOffsetNode.traverse.siblings('what');
		if (objectReference.length === 0) {
			return;
		}

		// Check if the object reference is on the same line as the first offset node
		let firstLine = firstOffsetNode.loc.start.line;
		if (objectReference[0].loc.start.line === firstOffsetNode.loc.start.line) {
			firstLine = firstLine + 1;
		}

		this.addLineIndent(firstLine, lastOffsetNode.loc.end.line);
	}

	/**
	 * Handle a function call e.g. callFunction($a, $b)
	 */
	callChildrenCallback() {
		const { arguments: parameters, traverse, what } = this.node as AstCall;
		if (what === undefined || parameters === undefined || parameters?.length === 0) {
			return;
		}

		const processArguments = this.handleArguments(parameters, what as AstIdentifier);
		if (processArguments === false) {
			return;
		}

		const {
			startLine: parameterStartLine,
			endLine: parameterEndLine,
		} = processArguments;

		// If the direct parent is an assign, remove the indent
		const hasAssignParent = traverse.parent('assign');
		if (hasAssignParent !== false) {
			this.removeLineIndent(parameterStartLine, parameterEndLine);
		}
	}

	/**
	 * Handle nodes with items. e.g. array, list
	 */
	itemsCallback() {
		const { items, traverse, kind } = this.node as AstArray | AstList;
		if (items.length === 0) {
			return;
		}

		// For arrays that have an assign parent, do not add indent
		// as it will be added by the assign callback
		const getAssignParent = traverse.parent('assign');
		if (getAssignParent !== false && kind === 'array') {
			return;
		}

		const { startLine, endLine } = this.getBlockLines(items, this.node);
		this.addLineIndent(startLine, endLine);
	}

	/**
	 * Handle assign nodes. e.g. $a = 1;
	 */
	assignCallback() {
		const { right: rightAssignment, left: leftAssignment } = this.node as AstAssign;

		let { startLine, endLine } = this.getBlockLines([rightAssignment], leftAssignment);

		// Account for array and call closing bracket
		if (rightAssignment.kind === 'array') {
			endLine = endLine - 1;
			this.addLineIndent(startLine, endLine);
			return;
		}

		if (rightAssignment.kind === 'call') {
			/* Check if this is a chained call
			* If it is, make the last line of the call the end line
			*/
			const what = (rightAssignment as AstLookup).what as AstLookup;
			const offset = what.offset as AstLookup;
			const locationEndLine = offset?.loc.end.line;
			endLine = locationEndLine === endLine ? locationEndLine : endLine - 1;

			this.addLineIndent(startLine, endLine);
			return;
		}

		if (rightAssignment.kind === 'encapsed') {
			this.handleMultiLineString(rightAssignment as AstEncapsed);
			return;
		}

		// Everything else
		this.addLineIndent(startLine, endLine);
	}

	/**
	 * Echo callback for handling multi-line strings
	 */
	echoCallback() {
		const { expressions } = this.node as AstEcho;
		expressions.forEach(this.handleMultiLineString.bind(this));
	}

	/**
	 * Handle multi-line strings by checking the start and end line
	 * with parent node, and removing the indent from all the lines of
	 * the string, except the first line (if it is on the same line as the parent)
	 *
	 * @param {AstNodeBase} node The node to check
	 */
	handleMultiLineString(node: AstNodeBase) {
		const parentNode = this.node;
		const { start, end } = node.loc;

		let {
			startLine,
			endLine,
		} = this.checkAgainstParentLines(
			start.line,
			end.line,
			parentNode
		);

		if (endLine === end.line - 1) {
			endLine = endLine + 1;
		}

		this.removeLineIndent(startLine, endLine, true);
	}

	/**
	 * Entry point of the rule processing
	 *
	 * @param  {RuleContext} context The context of the rule
	 * @return {boolean}             True if the rule should be processed, false otherwise
	 */
	@WithCallMapping
	process(context: RuleContext): boolean {
		this.context = context;
		this.node = context.node;

		const { node, payload } = this.context;

		const {
			kind,
			loc: nodePosition,
		} = node;
		const { start: nodeStart, end: nodeEnd } = nodePosition;

		// If the node is on the same line, don't process
		// unless it is a parameter or expression statement
		// because even if they are on the same line, they
		// might have nested nodes that need to be processed
		const kindExceptions = ['parameter', 'expressionstatement'];
		if (nodeStart.line === nodeEnd.line && kindExceptions.includes(kind) === false) {
			return false;
		}

		payload.lines = payload.lines || {} as Record<number, number>;

		// return any value except false to call WithCallMapping decorator
		return true;
	}

	/**
	 * Clear the payload on pre process
	 *
	 * @param {RulePreContext} context The rule context
	 */
	pre(context: RulePreContext) {
		const { payload } = context;
		payload.lines = {};
	}

	/**
	 * Get the type of whitespace in the current indent
	 *
	 * @param  {RegExpMatchArray} currentIndent The current indent
	 * @return {string}                         The type of whitespace
	 */
	getFoundWhitespaceType(currentIndent: RegExpMatchArray): string {
		const findTabs = currentIndent[0].match(/\t+/u);
		const findSpaces = currentIndent[0].match(/ +/u);

		const hasTabs = (findTabs?.length ?? -1) > 0;
		const hasSpaces = (findSpaces?.length ?? -1) > 0;

		const map: WhitespaceMap = {
			'mixed whitespace': hasTabs && hasSpaces,
			'tabs': hasTabs,
			'spaces': hasSpaces,
		};

		const foundType = Object.keys(map).find((key) => {
			return map[key] === true;
		});

		return foundType ?? 'whitespace';
	}

	/**
	 * Post process the rule
	 *
	 * @param {RuleContext} context The rule context
	 */
	post(context: RulePostContext) {
		const { report, payload, ast, config } = context;
		const { debug } = config;
		const { source } = ast.loc;
		if (source === undefined) {
			return;
		}
		const sourceLines = source.split(/\r?\n/u);

		sourceLines.forEach((line, index) => {
			const options = getOptions(context, index);
			const { type: indentType } = options;

			// Default is 0 indent for all lines
			const defaultLine = {
				length: 0,
				kind: ['none'],
				ignore: false,
			};

			let {
				length: newIndent,
				kind,
				ignore,
			} = payload?.lines?.[index] ?? defaultLine;

			/*
			* Some lines should be ignored. For example, multiline strings
			* or docblcoks (except for the first line).
			*/
			if (ignore) {
				return;
			}

			// If the line is empty, it should have 0 indent
			if (line.trim() === '') {
				newIndent = 0;
			}

			// Check current indent against new indent
			const currentIndent = line.match(/^\s*/u);
			if (currentIndent === null) {
				return;
			}

			const currentIndentLength = currentIndent?.[0].length ?? 0;
			if (currentIndentLength === newIndent) {
				return;
			}

			const foundType = this.getFoundWhitespaceType(currentIndent);
			const range: Loc = {
				start: {
					line: index,
					column: 0,
					offset: getOffsetFromLineAndColumn(sourceLines, index, 0),
				},
				end: {
					line: index,
					column: currentIndentLength,
					offset: getOffsetFromLineAndColumn(
						sourceLines,
						index,
						currentIndentLength
					),
				},
			};

			const indentTypeMessage = indentType === 'space' ? 'spaces' : 'tabs';

			let message = `Expected ${newIndent} ${indentTypeMessage}. found ${currentIndentLength} ${foundType}`;
			if (debug) {
				message += ` - (${kind.join(' → ')})`;
			}

			report({
				message,
				position: range,

				fix: (fixer: Fixer) => {
					const whiteSpace = indentType === 'space' ? ' ' : '\t';
					return fixer.replaceRange(range, whiteSpace.repeat(newIndent));
				},
			});
		});
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that the indentation is consistent',
			fixable: true,
			preset: 'psr',
		},
		name: 'indent',
		severity: 'warning',
		defaultOptions: {
			type: {
				type: 'string',
				description: 'The type of whitespace to use',
				oneOf: [
					{
						type: 'string',
						const: 'tab',
						description: 'Use tabs for indentation',
					},
					{
						type: 'string',
						const: 'space',
						description: 'Use spaces for indentation',
					},
				],
				default: 'space',
			},
			length: {
				description: 'The length of the indent',
				type: 'integer',
				minimum: 1,
				default: 4,
			},
		},
		register: [
			'class',
			'trait',
			'interface',
			'method',
			'function',
			'if',
			'do',
			'while',
			'foreach',
			'for',
			'array',
			'closure',
			'try',
			'catch',
			'retif',
			'switch',
			'case',
			'call',
			'expressionstatement',
			'list',
			'assign',
			'bin',
			'echo',
			'commentblock',
			'match',
			'enum',
		],
		bindClass: Indent,
	};
};
