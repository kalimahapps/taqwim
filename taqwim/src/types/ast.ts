/* eslint-disable no-use-before-define, eslint-comments/disable-enable-pair */
import type { Loc } from './loc';

/**
 * Define a node that contains the properties of all nodes
 */
interface AstNode extends AstNodeBase {
	children?: AstNode[];
	body?: any;
	test?: any;
	type?: any;
	left?: AstNode;
	right?: AstNode;
	what?: AstNode;
	offset?: AstNode;
	name: any;
	sourceCode: string;
	visibility?: string;
	properties?: AstNode[];
	constants?: AstNode[];
	arguments?: AstNode[];
	items?: AstNode[];
	catches?: AstNode[];
	always?: AstNode;
	variables?: AstNode[];
	alias?: AstNode;
	comments?: AstComment[];
	value?: any,
	alternate?: AstNode;
	trueExpr?: AstNode;
	falseExpr?: AstNode;
	expr?: AstNode;
	expressions?: AstNode[];
	path: string[];
	operator?: string;
	arms?: any[];
	conds?: any[];
	isAnonymous?: boolean;
	ifType: 'if' | 'elseif' | 'else' | 'onlyif',
	shortForm?: boolean;
	parenthesizedExpression?: boolean;
	expression?: AstExpression;
	[key: string]: AstNode | any;
}

interface AstLocation extends Loc {
	source: string | undefined;
}

interface AstIdentifier {
	kind: string;
	name: string;
	loc: AstLocation;
}

interface AstNodeBase {
	kind: string;
	leadingComments: AstComment[];
	trailingComments: AstComment[];
	loc: AstLocation,
	traverse: {
		siblings: (kind: string | string[]) => AstNode[];
		find: (kind: string | string[]) => AstNode[];
		findByNodeName: (name: string | string[]) => AstNode[];
		closest: (kind: string | string[]) => AstNode | false;
		parent: (kind?: string) => AstNode | false;
		nextSibling: () => AstNode | false;
		prevSibling: () => AstNode | false;
	};
	path: string[];
}

interface AstComment extends AstNodeBase {
	value: string;
	offset: number;
}

type AstNoop = AstNodeBase;
interface AstExpression extends AstNodeBase {
	parenthesizedExpression: boolean;
}

/**
 * Defines an expression based statement
 */
interface AstExpressionStatement extends AstStatement {
	expression: AstExpression | AstAssign;
}

type Operation = AstNodeBase;
type AstStatement = AstNodeBase;

/**
 * Defines a reference node
 */
type AstReference = AstNodeBase;

/**
 * A block statement, i.e., a sequence of statements surrounded by braces.
 */
interface AstBlock extends AstNodeBase {
	children: AstNodeBase[];
	ifType?: 'else';
}

/**
 * The main program node
 */
interface AstProgram extends AstBlock {
	errors: Error[];
	comments: AstComment[];
	tokens: string[] | null;
}

/**
 * Defines binary operations
 */
type AstOperation = AstExpression;

/**
 * Defines a post operation `$i++` or `$i--`
 */
interface AstPost extends AstOperation {
	type: string;
	what: AstVariable;
}

/**
 * Defines a pre operation `++$i` or `--$i`
 */
interface AstPre extends AstOperation {
	type: string;
	what: AstVariable;
}

/**
 * An if statement. The `alternate` field will be null if the `else` clause was
 * not present.
 */
interface AstIf extends AstStatement {
	test: AstNodeBase;
	body: AstBlock;
	alternate: AstBlock | AstIf | null;
	shortForm: boolean;
	ifType: 'if' | 'elseif' | 'else' | 'onlyif';
}

/**
 * Defines binary operations
 */
type MODIFIER_PUBLIC = 1;
type MODIFIER_PROTECTED = 2;
type MODIFIER_PRIVATE = 4;

/**
 * Defines a function parameter
 */
interface AstParameter extends AstDeclaration {
	type: AstIdentifier | null;
	value: Node | null;
	byref: boolean;
	variadic: boolean;
	readonly: boolean;
	nullable: boolean;
	attrGroups: AstAttributeGroup[];
	flags: MODIFIER_PUBLIC | MODIFIER_PROTECTED | MODIFIER_PRIVATE;
}

/**
 * A binary expression. e.g. `a + b`, `a === b`, `a ?? b`
 */
interface AstBin extends Operation {
	type: string;
	left: AstExpression;
	right: AstExpression;
}

/**
 * Unary operations
 */
interface AstUnary extends AstOperation {
	type: string;
	what: AstExpression;
}

/**
 * Attribute Value
 */
interface AstAttribute extends Node {
	name: string;
	args: AstParameter[];
}

/**
 * Attribute group
 */
interface AstAttributeGroup extends AstNode {
	attrs: AstAttribute[];
}

/**
 * Defines a closure
 */
interface AstClosure extends AstExpression {
	arguments: AstParameter[];
	uses: AstVariable[];
	type: AstIdentifier;
	byref: boolean;
	nullable: boolean;
	body: AstBlock | null;
	isStatic: boolean;
	attrGroups: AstAttributeGroup[];
}

interface AstReturn extends AstStatement {
	expr: AstExpression | null;
}

/**
 * Defines a short if statement that returns a value
 */
interface AstReturnIf extends AstExpression {
	test: AstExpression;
	trueExpr: AstExpression | null;
	falseExpr: AstExpression;
}

/**
 * Defines a constant
 */
interface AstConstant extends AstNodeBase {
	name: string;
	value: Node | string | number | boolean | null;
}

/**
 * Defines a class/interface/trait constant
 */
interface AstClassConstant extends AstConstantStatement {

	visibility: string;
	final: boolean;
	attrGroups: AstAttributeGroup[];
}

/**
 * Declares a constants into the current scope
 */
interface AstConstantStatement extends AstStatement {
	constants: AstConstant[];
}

/**
 * The main program node
 */
interface AstNamespace extends AstBlock {
	name: string;
	withBrackets: boolean;
}

/**
 * Defines a class property
 */
interface AstProperty extends AstStatement {
	name: string;
	value: Node | null;
	readonly: boolean;
	nullable: boolean;
	type: AstIdentifier | AstIdentifier[] | null;
	attrGroups: AstAttributeGroup[];
}

/**
 * Declares a properties into the current scope
 */
interface AstPropertyStatement extends AstStatement {
	properties: AstProperty[];
	visibility: string | null;
	isStatic: boolean;
}

/**
 * A trait definition
 */
interface AstTrait extends AstDeclaration {
	body: AstDeclaration[];
}

/**
 * Defines a trait usage
 */
interface AstTraitUse extends AstNodeBase {
	traits: AstIdentifier[];
	adaptations: AstNodeBase[] | null;
}

/**
 * Defines a use statement (from namespace)
 *
 * @property {string | null} type - Possible value : function, const
 */
interface AstUseItem extends AstStatement {

	/**
	 * Importing a constant
	 */
	readonly TYPE_CONST: string;

	/**
	 * Importing a function
	 */
	readonly TYPE_FUNC: string;
	name: string;

	/**
	 * Possible value : function, const
	 */
	type: string | null;
	alias: AstIdentifier | null;
}

interface AstUseGroup extends AstNodeBase {
	name: string | null;
	type: string | null;
	items: AstUseItem[];
}

/**
 * Defines a classic function
 */
interface AstFunction extends AstDeclaration {
	arguments: AstParameter[];
	type: AstIdentifier | null;
	byref: boolean;
	nullable: boolean;
	body: AstBlock | null;
	attrGroups: AstAttributeGroup[];
}

/**
 * Defines a class/interface/trait method
 */
interface AstMethod extends AstFunction {
	name: AstIdentifier;
	isAbstract: boolean;
	isFinal: boolean;
	isStatic: boolean;
	visibility: string;
	body: AstBlock;
	arguments: AstParameter[];
}

/**
 * A class definition
 */
interface AstClass extends AstDeclaration {
	extends: AstIdentifier | null;
	implements: AstIdentifier[] | null;
	body: AstDeclaration[];
	isAnonymous: boolean;
	isAbstract: boolean;
	isFinal: boolean;
	isReadonly: boolean;
	attrGroups: AstAttributeGroup[];
	name: AstIdentifier | string & null;
}

/**
 * An interface definition
 */
interface AstInterface extends AstDeclaration {
	extends: AstIdentifier[];
	body: AstDeclaration[];
	attrGroups: AstAttributeGroup[];
}

/**
 * A enum definition
 */
interface AstEnum extends AstDeclaration {
	valueType: AstIdentifier | null;
	implements: AstIdentifier[];
	body: AstEnumCase[];
	attrGroups: AstAttributeGroup[];
}

/**
 * Declares a cases into the current scope
 */
interface AstEnumCase extends AstNodeBase {
	name: string;
	value: string | number | null;
}

/**
 * Lookup on an offset in the specified object
 */
interface AstLookup extends AstExpression {
	what: AstExpression | AstLookup;
	offset: AstExpression;
}

/**
 * Assigns a value to the specified target
 */
interface AstAssign extends AstExpression {
	left: AstVariable;
	right: AstLookup | AstExpression;
	operator: string;
}

/**
 * Part of `Encapsed` node
 */
interface AstEncapsedPart extends AstExpression {
	expression: AstExpression;
	syntax: string;
	curly: boolean;
}

/**
 * Defines an array structure
 */
interface AstLiteral extends AstExpression {
	raw: string;
	value: AstEncapsedPart[] | AstNode | string | number | boolean | null;
}

/**
 * Defines an encapsed string (contains expressions)
 */
interface AstEncapsed extends AstLiteral {

	/**
	 * The node is a double quote string :
	 * ```php
	 * echo "hello $world";
	 * ```
	 */
	readonly TYPE_STRING: string;

	/**
	 * The node is a shell execute string :
	 * ```php
	 * echo `ls -larth $path`;
	 * ```
	 */
	readonly TYPE_SHELL: string;

	/**
	 * The node is a shell execute string :
	 * ```php
	 * echo <<<STR
	 * Hello $world
	 * STR
	 * ;
	 * ```
	 */
	readonly TYPE_HEREDOC: string;

	/**
	 * The node contains a list of constref / variables / expr :
	 * ```php
	 * <?php
	 * echo $foo->bar_$baz;
	 * ```
	 */
	readonly TYPE_OFFSET: string;

	/**
	 * Defines the type of encapsed string (shell, heredoc, string)
	 */
	type: string;

	/**
	 * The heredoc label, defined only when the type is heredoc
	 */
	label: string | null;
	value: AstEncapsedPart[];
}

/**
 * A declaration statement (function, class, interface...)
 */
interface AstDeclaration extends AstStatement {
	name: AstIdentifier | string;
}

/**
 * Define objects, classes, interfaces, traits
 */
interface AstObject extends AstDeclaration {
	body: AstDeclaration[];
}

/**
 * Defines a trait alias
 */
interface AstTraitAlias extends AstNodeBase {
	trait: AstIdentifier | null;
	method: AstIdentifier;
	as: AstIdentifier | null;
	visibility: string | null;
}

/**
 * Defines a trait alias
 */
interface AstTraitPrecedence extends AstNodeBase {
	trait: AstIdentifier | null;
	method: AstIdentifier;
	instead: AstIdentifier[];
}

/**
 * Any expression node. Since the left-hand side of an assignment may
 * be any expression in general, an expression can also be a pattern.
 *
 * @example
 * // PHP code :
 * $foo
 * // AST output
 * {
 *  "kind": "variable",
 *  "name": "foo",
 *  "curly": false
 * }
 */
interface AstVariable extends AstExpression {

	/**
	 * The variable name (can be a complex expression when the name is resolved dynamically)
	 */
	name: string | AstNode;

	/**
	 * Indicate if the name is defined between curlies, ex `${foo}`
	 */
	curly: boolean;
}

/**
 * Defines a interface Astreference node
 */
interface AstName extends AstReference {

	/**
	 * This is an identifier without a namespace separator, such as Foo
	 */
	readonly UNQUALIFIED_NAME: string;

	/**
	 * This is an identifier with a namespace separator, such as Foo\Bar
	 */
	readonly QUALIFIED_NAME: string;

	/**
	 * This is an identifier with a namespace separator that begins with
	 * a namespace separator, such as \Foo\Bar. The namespace \Foo is also
	 * a fully qualified name.
	 */
	readonly FULL_QUALIFIED_NAME: string;

	/**
	 * This is an identifier starting with namespace, such as namespace\Foo\Bar.
	 */
	readonly RELATIVE_NAME: string;
	name: string;
	resolution: string;
}

/**
 * Defines a for iterator
 */
interface AstFor extends AstStatement {
	init: AstExpression[];
	test: AstExpression[];
	increment: AstExpression[];
	body: AstBlock;
	shortForm: boolean;
}

/**
 * Defines a foreach iterator
 */
interface AstForeach extends AstStatement {
	source: AstExpression;
	key: AstExpression | null;
	value: AstExpression;
	body: AstBlock;
	shortForm: boolean;
}

/**
 * Defines a catch statement
 */
interface AstCatch extends AstStatement {
	what: AstName[];
	variable: AstVariable;
	body: AstBlock;
}

/**
 * Defines a try statement
 */
interface AstTry extends AstStatement {
	body: AstBlock;
	catches: AstCatch[];
	always: AstBlock;
}

/**
 * An array entry
 */
interface AstEntry extends AstExpression {

	/**
	 * The entry key/offset
	 */
	key: AstNode | null;

	/**
	 * The entry value
	 */
	value: AstNode;

	/**
	 * By reference
	 */
	byRef: boolean;

	/**
	 * Argument unpacking
	 */
	unpack: boolean;
}

/**
 * Defines list assignment
 */
interface AstList extends AstExpression {
	shortForm: boolean;
	items: AstEntry[];
}

/**
 * Defines an array structure
 *
 * @example
 * // PHP code :
 * [1, 'foo' => 'bar', 3]
 *
 * // AST structure :
 * {
 *  "kind": "array",
 *  "shortForm": true
 *  "items": [
 *    {"kind": "number", "value": "1"},
 *    {
 *      "kind": "entry",
 *      "key": {"kind": "string", "value": "foo", "isDoubleQuote": false},
 *      "value": {"kind": "string", "value": "bar", "isDoubleQuote": false}
 *    },
 *    {"kind": "number", "value": "3"}
 *  ]
 * }
 */
interface AstArray extends AstExpression {

	/**
	 * List of array items
	 */
	items: (AstEntry | AstExpression | AstVariable)[];

	/**
	 * Indicate if the short array syntax is used, ex `[]` instead `array()`
	 */
	shortForm: boolean;
}

/**
 * Defines an arrow function (it's like a closure)
 */
interface AstArrowFunction extends AstExpression {
	arguments: AstParameter[];
	type: AstIdentifier;
	body: AstExpression;
	byref: boolean;
	nullable: boolean;
	isStatic: boolean;
}

/**
 * Defines system based call
 */
interface AstEcho extends AstStatement {
	shortForm: boolean;
	expressions: AstExpression[];
}

/**
 * Executes a call statement
 */
interface AstCall extends AstExpression {
	what: AstIdentifier | AstVariable;
	arguments: AstParameter[];
}

/**
 * A switch case statement
 *
 * @property {AstExpression|null} test - if null, means that the default case
 */
interface AstCase extends AstStatement {

	/**
	 * if null, means that the default case
	 */
	test: AstExpression | null;
	body: AstBlock | null;
}

interface AstUnset extends AstStatement {
	variables: AstVariable[];
}

/**
 * Imports a variable from the global scope
 */
interface AstGlobal extends AstStatement {
	items: AstVariable[];
}

/**
 * An array entry - see [Array](#array)
 */
interface AstMatchArm extends AstExpression {

	/**
	 * The match condition expression list - null indicates default arm
	 */
	conds: AstExpression[] | null;

	/**
	 * The return value expression
	 */
	body: AstExpression;
}

/**
 * Defines a match expression
 */
interface AstMatch extends AstExpression {

	/**
	 * Condition expression to match against
	 */
	cond: AstExpression;

	/**
	 * Arms for comparison
	 */
	arms: AstMatchArm[];
}

/**
 * Defines a switch statement
 */
interface AstSwitch extends AstStatement {
	test: AstExpression;
	body: AstBlock;
	shortForm: boolean;
}

/**
 * Defines a while statement
 */
interface AstWhile extends AstStatement {
	test: AstExpression;
	body: AstBlock;
	shortForm: boolean;
}

/**
 * Defines a do/while statement
 */
interface AstDo extends AstStatement {
	test: AstExpression;
	body: AstBlock;
}

/**
 * Defines system include call
 */
interface AstInclude extends AstExpression {
	target: Node;
	once: boolean;
	require: boolean;
}

type AllAstTypes =
	AstNode |
	AstIf |
	AstMethod |
	AstFunction |
	AstClosure |
	AstComment |
	AstTry |
	AstCatch |
	AstFor |
	AstForeach |
	AstCall |
	AstArray |
	AstList |
	AstEcho |
	AstWhile |
	AstDo |
	AstReturn |
	AstUnset |
	AstCase |
	AstUseGroup |
	AstNamespace |
	AstProperty |
	AstPropertyStatement |
	AstTraitUse |
	AstTraitPrecedence |
	AstAssign |
	AstBin |
	AstReturnIf |
	AstPre |
	AstPost |
	AstUnary |
	AstEntry |
	AstParameter |
	AstArrowFunction |
	AstSwitch |
	AstGlobal |
	AstMatch |
	AstMatchArm |
	AstInterface |
	AstClass |
	AstConstant |
	AstConstantStatement |
	AstClassConstant |
	AstTrait |
	AstEnum |
	AstVariable |
	AstEnumCase |
	AstInclude |
	AstExpressionStatement |
	AstBlock;

export type {
	AstNodeBase,
	AstNode,
	AstComment,
	AstIdentifier,
	AstUseGroup,
	AstInterface,
	AstSwitch,
	AstWhile,
	AstDo,
	AstClass,
	AstTrait,
	AstMethod,
	AstFunction,
	AstNoop,
	AstIf,
	AstBlock,
	AstBin,
	AstAssign,
	AstLookup,
	AstEncapsed,
	AstDeclaration,
	AstObject,
	AstEntry,
	AstFor,
	AstForeach,
	AstTry,
	AstCatch,
	AstCall,
	AstArray,
	AstList,
	AstEcho,
	AstProgram,
	AstExpression,
	AstExpressionStatement,
	AstClosure,
	AstReturn,
	AstCase,
	AstUnset,
	AstGlobal,
	AstNamespace,
	AstParameter,
	AstTraitUse,
	AstPropertyStatement,
	AstTraitPrecedence,
	AstConstant,
	AstClassConstant,
	AstInclude,
	AstConstantStatement,
	AstVariable,
	AstReturnIf,
	AstPre,
	AstPost,
	AstUnary,
	AstArrowFunction,
	AstMatch,
	AstMatchArm,
	AstStatement,
	AstEnum,
	AstEnumCase,
	AstProperty,
	AllAstTypes
};