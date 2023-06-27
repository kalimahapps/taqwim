/**
 * Ensure consistent brace
 * Ensure that:
 * - open brace has a space before if on the same line
 * - open brace has a space after if on the same line
 * - closing brace has a space after if on the same line
 */
/* eslint complexity: ["warn", 9] */
import { findAhead, findAheadRegex, findAheadRegexReverse } from '@taqwim/utils/index';
import type {
	AllAstTypes,
	AstClass,
	AstClosure,
	AstDo,
	AstFor,
	AstForeach,
	AstIf,
	AstMethod,
	AstSwitch,
	AstTry,
	CallbacksMap,
	Loc,
	RuleContext,
	RuleDataOptional
} from '@taqwim/types';
import type Fixer from '@taqwim/fixer';
import { WithCallMapping } from '@taqwim/decorators';

class BraceSpacing {
	/**
	 * The context of the rule
	 */
	context = {} as RuleContext;

	/**
	 * The node to process
	 */
	node = {} as AllAstTypes;

	/**
	 * The map of callbacks to use
	 */
	callbacksMap: CallbacksMap = {
		objectCallback: ['class', 'interface', 'trait', 'enum'],
		methodCallback: ['function', 'method'],
		closureCallback: ['closure'],
		ifCallback: ['if'],
		doCallback: ['do'],
		tryCatchCallback: ['try'],
		loopCallback: ['for', 'foreach', 'while'],
		switchMatchCallback: ['switch', 'match'],
	};

	/**
	 * Switch and match statements
	 */
	switchMatchCallback() {
		const { sourceLines } = this.context;
		const { loc, shortForm } = this.node as AstSwitch;
		if (shortForm) {
			return;
		}

		const parenPosition = findAhead(
			sourceLines,
			loc,
			')'
		);
		if (parenPosition === false) {
			return;
		}

		this.processOpenBrace({
			start: parenPosition,
			end: loc.end,
		});
	}

	/**
	 * Handle try statements
	 * e.g. try { ... } catch (Exception $e) { ... }
	 */
	tryCatchCallback() {
		const { sourceLines } = this.context;
		const { body, loc, catches, always } = this.node as AstTry;
		this.processOpenBrace({
			start: loc.start,
			end: {
				line: body.loc.start.line,
				column: body.loc.start.column + 1,
				offset: body.loc.start.offset + 1,
			},
		});

		// Check open brace for catches
		catches.forEach((catchNode) => {
			const { loc: nodeLoc, body: nodeBody } = catchNode;
			this.processOpenBrace({
				start: nodeLoc.start,
				end: {
					line: nodeBody.loc.start.line,
					column: nodeBody.loc.start.column + 1,
					offset: nodeBody.loc.start.offset + 1,
				},
			});
		});

		// Aggregate all nodes that have a closing brace
		const nodes = [body, ...catches];

		// If always is present, check opening brace and add to nodes
		// to check closing brace
		if (always) {
			nodes.push(always);

			const finallyPosition = findAheadRegexReverse(
				sourceLines,
				{
					start: loc.start,
					end: always.loc.start,
				},
				/(?<finally>finally)(?<spaceAfter>\s*)$/u
			);

			if (finallyPosition === false || finallyPosition?.groups?.finally === undefined) {
				return;
			}

			this.processOpenBrace({
				start: finallyPosition.groups.finally.end,
				end: always.loc.end,
			});
		}

		// Loop through all nodes and check the closing
		// brace of each node with the next node
		nodes.forEach((currentNode, index) => {
			const nextNode = nodes[index + 1];
			if (nextNode) {
				this.processClosingBrace(currentNode.loc, nextNode.loc);
			}
		});
	}

	/**
	 * Do callback
	 * e.g. do { ... } while (true);
	 */
	doCallback() {
		const { sourceLines } = this.context;
		const { loc, body } = this.node as AstDo;
		this.processOpenBrace({
			start: loc.start,
			end: {
				line: body.loc.start.line,

				// Add one to include brace in search
				column: body.loc.start.column + 1,
				offset: body.loc.start.offset + 1,
			},
		});

		const whilePosition = findAhead(
			sourceLines,
			{
				start: body.loc.end,
				end: loc.end,
			},
			'while'
		);

		if (whilePosition === false) {
			return;
		}

		this.processClosingBrace(loc, {
			start: whilePosition,
			end: loc.end,
		});
	}

	/**
	 * Loop callback
	 */
	loopCallback() {
		const { loc, shortForm } = this.node as AstFor & AstForeach;
		if (shortForm === true) {
			return;
		}

		const parenPosition = findAhead(
			this.context.sourceLines,
			loc,
			')'
		);

		if (parenPosition === false) {
			return;
		}

		this.processOpenBrace({
			start: parenPosition,
			end: loc.end,
		});
	}

	/**
	 * Handle brace spacing for if statements
	 */
	ifCallback() {
		const { sourceLines } = this.context;
		const { loc, alternate, shortForm } = this.node as AstIf;

		// Short form does not have braces
		if (shortForm) {
			return;
		}

		const parenPosition = findAhead(
			sourceLines,
			loc,
			')'
		);
		if (parenPosition === false) {
			return;
		}

		this.processOpenBrace({
			start: parenPosition,
			end: loc.end,
		});

		if (alternate) {
			this.processClosingBrace(loc, alternate.loc);
		}

		// Handle else
		if (alternate === null || alternate.ifType !== 'else') {
			return;
		}

		const elsePosition = findAheadRegexReverse(
			sourceLines,
			{
				start: loc.start,
				end: alternate.loc.start,
			},
			/(?<else>else)(?<spaceAfter>\s*)$/u
		);

		if (elsePosition === false || elsePosition?.groups?.else === undefined) {
			return;
		}

		this.processOpenBrace({
			start: elsePosition.groups.else.end,
			end: alternate.loc.end,
		});
	}

	/**
	 * Handle brace spacing for closures
	 */
	closureCallback() {
		const { loc, type, uses } = this.node as AstClosure;

		// Handle type if present
		if (type !== null) {
			this.processOpenBrace({
				start: type.loc.start,
				end: loc.end,
			});

			return;
		}

		// Handle uses if present
		if (uses.length > 0) {
			const lastUse = uses.at(-1);
			if (lastUse === undefined) {
				return;
			}

			this.processOpenBrace({
				start: lastUse.loc.end,
				end: loc.end,
			});

			return;
		}

		// The rest of the cases
		const parenPosition = findAhead(
			this.context.sourceLines,
			loc,
			'('
		);

		if (parenPosition === false) {
			return;
		}

		this.processOpenBrace({
			start: parenPosition,
			end: loc.end,
		});
	}

	/**
	 * Handle spaces for methods (function, method, closure)
	 */
	methodCallback() {
		const { name, loc, type } = this.node as AstMethod;

		if (type === null && typeof name === 'string') {
			return;
		}

		const searchRange = {
			start: type?.loc.start ?? name.loc.start,
			end: loc.end,
		};
		this.processOpenBrace(searchRange);
	}

	/**
	 * Handle spaces for objects (class, interface, trait, enum)
	 */
	objectCallback() {
		const { name, loc, isAnonymous } = this.node as AstClass;

		if (typeof name === 'string') {
			return;
		}

		if (isAnonymous) {
			const bracePosition = findAhead(
				this.context.sourceLines,
				loc,
				'{'
			);

			if (bracePosition !== false) {
				this.processOpenBrace({
					start: loc.start,
					end: {
						line: bracePosition.line,
						column: bracePosition.column + 1,
						offset: bracePosition.offset + 1,
					},
				});
			}

			return;
		}

		const searchRange = {
			start: name.loc.start,
			end: loc.end,
		};
		this.processOpenBrace(searchRange);
	}

	/**
	 * Report and fix closing brace
	 *
	 * @param {Loc} nodeLoc      The location of the main node
	 * @param {Loc} alternateLoc The location of the alternate node
	 */
	processClosingBrace(nodeLoc: Loc, alternateLoc: Loc) {
		const { report, sourceLines } = this.context;

		const searchRange = {
			start: nodeLoc.start,
			end: alternateLoc.start,
		};

		const braceLoc = findAheadRegexReverse(
			sourceLines,
			searchRange,
			/(?<brace>\})(?<spaces>\s*)/u
		);

		// If not on the same line as the start of the node, ignore
		if (
			braceLoc === false ||
			braceLoc.groups?.brace === undefined ||
			braceLoc.start.line !== alternateLoc.start.line
		) {
			return;
		}

		const { spaces, brace } = braceLoc.groups;
		const spacesLength = spaces?.value.length ?? 0;

		if (spacesLength === 1) {
			return;
		}

		const position = {
			start: brace.start,
			end: spaces?.end ?? brace.end,
		};

		report({
			message: `There must be a single space after the closing brace. Found: ${spacesLength} spaces`,
			position,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(position, '} ');
			},
		});
	}

	/**
	 * Report and fix opening braces
	 *
	 * @param {Loc} nodeLoc The location of the node to process.
	 */
	processOpenBrace(nodeLoc: Loc) {
		const { sourceLines, report } = this.context;

		const openingBrace = findAheadRegex(
			sourceLines,
			nodeLoc,
			/(?<spaceBefore>\s*)(?<brace>\{)/u
		);

		if (openingBrace === false || openingBrace?.groups?.brace === undefined) {
			return;
		}

		const { spaceBefore, brace } = openingBrace.groups;

		// If not on the same line as the start of the node, ignore
		if (brace.start.line !== nodeLoc.start.line) {
			return;
		}

		const spaceFoundLength = spaceBefore?.value.length ?? 0;
		if (spaceFoundLength === 1) {
			return;
		}

		const position = {
			start: {
				line: spaceBefore?.start.line ?? brace.start.line,
				column: spaceBefore?.start.column ?? brace.start.column,
				offset: spaceBefore?.start.offset ?? brace.start.offset,
			},
			end: brace.end,
		};

		report({
			message: `There must be a single space before the opening brace. Found: ${spaceFoundLength} spaces`,
			position,
			fix: (fixer: Fixer) => {
				return fixer.replaceRange(position, ' {');
			},
		});
	}

	/**
	 * Report and fix empty braces 
	 *
	 * @return {boolean} Whether braces have been found 
	 */
	processEmptyBraces(): boolean {
		const { node, sourceLines, report } = this.context;
		const { loc } = node;

		const findParens = findAheadRegex(
			sourceLines,
			loc,
			/\{(?<space>\s*)\}/u
		);

		if (findParens === false || findParens.groups === undefined) {
			return false;
		}

		const { space } = findParens.groups;
		if (space === undefined) {
			return true;
		}

		report({
			message: `There must be no space between empty braces. Found: ${space.value.length} spaces`,
			position: space,
			fix: (fixer: Fixer) => {
				return fixer.removeRange(space);
			},
		});

		return true;
	}

	/**
	 * Entry point of the rule processing
	 *
	 * @param  {RuleContext} context The context of the rule
	 * @return {boolean}             false if empty braces found
	 */
	@WithCallMapping
	process(context: RuleContext): boolean {
		this.context = context;
		this.node = this.context.node;

		const hasFoundEmptyParen = this.processEmptyBraces();
		if (hasFoundEmptyParen) {
			return false;
		}

		return true;
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure consistent brace spacing',
			fixable: true,
			preset: 'psr',
		},
		severity: 'warning',
		name: 'spacing.brace',
		register: [
			'class',
			'interface',
			'trait',
			'enum',
			'function',
			'method',
			'closure',
			'if',
			'for',
			'foreach',
			'while',
			'do',
			'try',
			'switch',
			'match',
		],
		bindClass: BraceSpacing,
	};
};
