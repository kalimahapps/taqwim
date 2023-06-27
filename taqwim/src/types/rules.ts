import type Fixer from '@taqwim/fixer';
import type InlineConfig from '@taqwim/inline-config';
import type { AstNode } from '@taqwim/types/ast';
import type { ReportData } from '@taqwim/types/report';
import type { Loc } from '@taqwim/types/loc';
import type { TaqwimConfig } from './config';

type RuleFix = {

	/**
	 * The callback function to fix the error
	 *
	 * @param  {Fixer}  fixer The fixer object
	 * @return {string}       The fixed string
	 */
	fix: (fixer: Fixer) => string;

	/**
	 * The position of the error
	 */
	position: Loc;

	/**
	 * Whether the fix is inside another fix
	 */
	isInner?: boolean;
};

interface RuleContext<NodeType = AstNode> {

	/**
	 * A function to report issues with the code
	 *
	 * @param {ReportData} data The data to report
	 */
	report: (data: ReportData) => void;

	/**
	 * The node that is being processed
	 */
	node: NodeType;

	/**
	 * The options for the rule. This will include merged config
	 * from user config and inline config
	 */
	options: Record<string, any>;

	/**
	 * The AST of the node that is being processed
	 */
	ast: AstNode;

	/**
	 * The name of the rule
	 */
	ruleName: string;

	/**
	 * The payload of the rule. This is useful for rules that
	 * uses pre/post callbacks
	 */
	payload: Record<string, any>;

	/**
	 * Walk the AST and calls the callback for each node
	 *
	 * @param {AstNode} node     The starting node
	 * @param {any}     callback The callback to call for each node
	 */
	walk: (node: AstNode, callback: (node: AstNode) => any) => void;

	// Source code represented as an array of lines
	sourceLines: string[];

	// Source code represented as a string
	sourceCode: string;

	/**
	 * Inline config to be used by the rule. This is mostly
	 * useful for rules that register for 'program' node type
	 * because it is the only node that contains the whole file
	 * And it is impossible to get the inline config for a specific
	 * node inside it
	 */
	inlineConfig: InlineConfig | undefined;

	/**
	 * Taqwim config object
	 */
	config: TaqwimConfig;
}

type RulePreContext = Omit<RuleContext, 'node'>;
interface RulePostContext extends Omit<RuleContext, 'node'> {
	fixes: RuleFix[];
}

/**
 * OneOf schema type
 */
type RuleOneOfSchema = {
	const: string;
	type: string;
	description: string;
};

/**
 * Levels of rule severity
 */
type RuleSeverityLevels = 'error' | 'warning' | 'off';

/**
 * The default value for a rule option
 */
type RuleOptionDefaultValue =
	(string | number | boolean | string[] | Record<string, unknown>) | RuleSeverityLevels;

/**
 * Rule default options type. These are the options supplied
 * by the rule before merging with the user supplied options.
 * It follows the JSON schema format
 */
type RuleDefaultOptions = {
	severity?: string;
	type: string;
	default?: RuleOptionDefaultValue;
	enum?: string[];
	oneOf?: RuleOneOfSchema[];
	description: string;
	minimum?: number;
	maximum?: number;
	items?: {
		uniqueItems?: boolean;
		type: string;
		enum?: string[];
		oneOf?: RuleOneOfSchema[];
	}
};

interface RuleData {

	/**
	 * The name of the rule
	 */
	name: string;

	/**
	 * List of rule names that this rule depends on
	 * The rule can supply an array of rule names
	 * or a function that returns an array of rule names
	 */
	register: string[] | (() => string[]);

	/**
	 * Meta data for the rule
	 */
	meta: {
		fixable: boolean;
		description: string;
		url?: string;
		preset: string;
	};

	/*
	 * Callback to process the rule. It will run
	 * for each node in register list
	 */
	process?: (context: RuleContext) => void;

	/*
	 * Callback to process the rule before the
	 * process callback. It will run once
	 * per rule
	 */
	pre?: (context: RulePreContext) => void;

	/*
	* Callback to process the rule after the
	* process callback. It will run once
	* per rule
	*/
	post?: (context: RulePostContext) => void;

	/**
	 * A class to bind to the rule
	 */
	bindClass?: { new(): any };
}

/**
 * Extended RuleData to include more properties
 */
interface RuleDataStrict extends RuleData {

	// Severity of the rule
	severity: RuleSeverityLevels;

	/* Options represent the default options merged
	* with the user supplied options
	*/
	options: Record<string, RuleOptionDefaultValue>;

	/* Order of the rule.
	* It will be used to sort the rules and run them sequentially.
	* The lower the number, the earlier the rule will run.
	* The default value is 0
	*/
	order: number;
}

interface RuleDataOptional extends Partial<Pick<RuleDataStrict, 'severity' | 'order'>>, RuleData {
	defaultOptions?: Record<string, RuleDefaultOptions>;
}

export type {
	RuleData,
	RuleDataStrict,
	RuleDataOptional,
	RuleContext,
	RulePostContext,
	RulePreContext,
	RuleFix,
	RuleOptionDefaultValue,
	RuleDefaultOptions,
	RuleOneOfSchema,
	RuleSeverityLevels
};