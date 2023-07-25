/**
 * Ensure that all blocks have a docblock
 */
import type {
	RuleDataOptional,
	RuleContext,
	Loc,
	AllAstTypes,
	AstMethod,
	AstClass,
	AstPropertyStatement,
	AstConstantStatement
} from '@taqwim/types';
import { getOffsetFromLineAndColumn } from '@taqwim/utils';
import type Fixer from '@taqwim/fixer';
import { WithCallMapping } from '@taqwim/decorators';

type CallbacksMap = {
	[key: string]: string[];
};

class DocblockRequired {
	/**
	 * Rule context
	 */
	context = {} as RuleContext;

	/**
	 * Current node
	 */
	node = {} as AllAstTypes;

	/**
	 * A map for each node and their corresponding callback
	 */
	callbacksMap: CallbacksMap = {
		propertyCallback: ['propertystatement'],
		constantCallback: ['constantstatement'],
		objectCallback: ['class', 'interface', 'trait'],
		methodCallback: ['function', 'method'],
	};

	/**
	 * Poisition of the report
	 */
	position: Loc | undefined;

	/**
	 * Comment template for the report fixer
	 */
	commentTemplate = '';

	/**
	 * Name of the identifier to display in the report message
	 */
	identifierName: string | undefined;

	/**
	 * Kind of node to display in the report message
	 */
	kindName: string | undefined;

	/**
	 * Generate docblock for functions/methods
	 *
	 * @return {string} Docblock
	 */
	getFunctionDocblock(): string {
		const { node } = this.context;
		const { type: nodeType } = node;

		let docblock = '/**';
		docblock += '\n * \n';

		const { arguments: parameters } = node;
		if (parameters === undefined) {
			return '';
		}

		if (parameters.length === 0) {
			docblock += ' */\n';
			return docblock;
		}

		const results = [];
		for (const parameter of parameters) {
			const { type, name } = parameter;

			const parameterType = type?.name === undefined ? '' : `${type.name} `;

			const parameterInfo = `@param ${parameterType}$${name.name} `;
			results.push(parameterInfo);
		}

		docblock += ` * \n * ${results.join('\n * ')}`;

		const returnType = nodeType?.name === undefined ? '' : `${nodeType.name} `;

		docblock += `\n * @return ${returnType}`;
		docblock += '\n */\n';

		return docblock;
	}

	/**
	 * Report and fix issues
	 *
	 * @return {boolean} True if the report was made
	 */
	reportAndFix(): boolean {
		const { report, sourceLines } = this.context;
		const { loc } = this.node;
		const { start } = loc;

		if (this.position === undefined) {
			return false;
		}

		const startLine = start.line;

		const insertCommentAt = {
			line: startLine,
			column: 0,
			offset: getOffsetFromLineAndColumn(sourceLines, startLine, 0),
		};

		const fixerPosition = {
			start: insertCommentAt,
			end: insertCommentAt,
		};

		const template = this.commentTemplate;
		report({
			message: `Missing docblock for "${this.identifierName}" ${this.kindName} declaration`,
			position: this.position,
			fix: (fixer: Fixer) => {
				return fixer.before(fixerPosition, template);
			},
		});

		return true;
	}

	/**
	 * Callback for constants
	 */
	constantCallback() {
		const { options } = this.context;
		const { constants } = this.node as AstConstantStatement;

		if (options.exclude.includes('constant')) {
			return;
		}

		this.position = constants?.[0]?.name?.loc;
		this.commentTemplate = '/**\n * @var \n */\n';
		this.identifierName = constants?.[0]?.name?.name;
		this.kindName = 'constant';

		this.reportAndFix();
	}

	/**
	 * Callback for properties
	 */
	propertyCallback() {
		const { options } = this.context;

		if (options.exclude.includes('property')) {
			return;
		}
		const { properties } = this.node as AstPropertyStatement;
		this.position = properties?.[0]?.name?.loc;
		this.commentTemplate = '/**\n * @var \n */\n';
		this.identifierName = properties?.[0]?.name?.name;
		this.kindName = 'property';

		this.reportAndFix();
	}

	/**
	 * Callback for classes, interfaces and traits
	 */
	objectCallback() {
		const { name } = this.node as AstClass;

		this.position = name.loc;

		this.commentTemplate = '/**\n * \n */\n';
		this.reportAndFix();
	}

	/**
	 * Callback for functions/methods
	 */
	methodCallback() {
		const { name } = this.node as AstMethod;

		this.position = name.loc;
		this.commentTemplate = this.getFunctionDocblock();

		this.reportAndFix();
	}

	/**
	 * Check if node has a docblock
	 *
	 * @return {boolean} True if node has a docblock
	 */
	hasDocBlock(): boolean {
		const { leadingComments } = this.node;
		const getCommentBlocks = leadingComments.filter((comment) => {
			return comment.kind === 'commentblock';
		});

		if (getCommentBlocks.length === 0) {
			return false;
		}

		const hasDocumentBlock = getCommentBlocks.some((comment) => {
			return comment.value.startsWith('/**');
		});

		return hasDocumentBlock;
	}

	/**
	 * Start the process and fire the callback for 
	 * the corresponding node
	 *
	 * @param  {RuleContext} context Rule context
	 * @return {boolean}             True if the rule should be applied
	 */
	@WithCallMapping
	process(context: RuleContext) {
		this.context = context;
		const { node, options } = this.context;
		this.node = node;

		const { name, kind, isAnonymous } = this.node;

		const { exclude } = options;

		if (isAnonymous || this.hasDocBlock() || exclude.includes(kind)) {
			return false;
		}

		this.identifierName = name?.name;
		this.kindName = kind;

		// callbackFunction.call(this);
		return true;
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that all blocks have a docblock',
			preset: 'docblock',
			fixable: true,
		},
		name: 'required',
		defaultOptions: {
			exclude: {
				description: 'Exclude certain blocks from being checked',
				type: 'array',
				items: {
					uniqueItems: true,
					type: 'string',
					oneOf: [
						{
							type: 'string',
							const: 'class',
							description: 'Exclude classes',
						},
						{
							type: 'string',
							const: 'interface',
							description: 'Exclude interfaces',
						},
						{
							type: 'string',
							const: 'trait',
							description: 'Exclude traits',
						},
						{
							type: 'string',
							const: 'property',
							description: 'Exclude properties',
						},
						{
							type: 'string',
							const: 'method',
							description: 'Exclude methods',
						},
						{
							type: 'string',
							const: 'function',
							description: 'Exclude functions',
						},
						{
							type: 'string',
							const: 'constant',
							description: 'Exclude constants',
						},
					],
				},
				default: [''],
			},
		},
		severity: 'warning',
		register: [
			'function',
			'method',
			'class',
			'interface',
			'trait',
			'constantstatement',
			'propertystatement',
		],
		bindClass: DocblockRequired,
	};
};
