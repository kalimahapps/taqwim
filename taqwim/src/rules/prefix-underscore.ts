/**
 * Allow/disallow prefixing of underscore to identifiers
 *
 * @see https://www.php-fig.org/psr/psr-12/#43-properties-and-constants
 * @see https://www.php-fig.org/psr/psr-12/#44-methods-and-functions
 */
import type {
	RuleDataOptional,
	RuleContext,
	RulePostContext,
	AstIdentifier,
	AstNode
} from '@taqwim/types';
import { capitalCase } from 'change-case';
import type Fixer from '@taqwim/fixer';
import { findAhead } from '@taqwim/utils';

class PrefixUnderscore {
	magicMethods: string[] = [
		'__construct',
		'__invoke',
		'__destruct',
		'__call',
		'__callStatic',
		'__get',
		'__set',
		'__isset',
		'__unset',
		'__sleep',
		'__wakeup',
		'__serialize()',
		'__unserialize()',
		'__toString()',
		'__invoke()',
		'__set_state()',
		'__clone()',
		'__debugInfo()',
	];

	globalVariables: string[] = [
		'$GLOBALS',
		'$_SERVER',
		'$_GET',
		'$_POST',
		'$_FILES',
		'$_COOKIE',
		'$_SESSION',
		'$_REQUEST',
		'$_ENV',
	];

	context = {} as RuleContext;

	/**
	 * Add the payload to the context for post processing
	 */
	addPayload() {
		const { node, payload } = this.context;
		const { kind, name } = node;

		if (kind !== 'property' && kind !== 'method') {
			return;
		}

		payload.properties = payload.properties || [];
		payload.properties.push(name.name);
	}

	/**
	 * Check if the node should be skipped
	 *
	 * @param  {string}  identifier name
	 * @return {boolean}            True if should be skipped, false otherwise
	 */
	shouldSkip(identifier: string): boolean {
		const { node } = this.context;
		const { kind } = node;

		// magic methods
		const isMagicMethod = kind === 'method' && this.magicMethods.includes(identifier);

		// global variables
		const isGlobalVariable = kind === 'variable' && this.globalVariables.includes(`$${identifier}`);

		return isMagicMethod || isGlobalVariable;
	}

	/**
	 * Process the rule
	 *
	 * @param  {RuleContext} context Rule context
	 * @return {void}
	 */
	/* eslint complexity: ["warn", 8] */
	process(context: RuleContext): void {
		this.context = context;
		const { report, node, options, sourceLines } = this.context;

		let {
			name: identifier,
			loc: identifierLoc,
			kind,
			isAnonymous,
		} = node;

		if (isAnonymous || options.exclude.includes(kind)) {
			return;
		}

		// Normalize identifier and location
		if (kind !== 'variable') {
			const { name, loc } = identifier as AstIdentifier;
			identifier = name;
			identifierLoc = loc;
		}

		if (kind === 'enumcase') {
			// enumcase includes the whole enum name (including keyword case)
			const nameLoc = findAhead(sourceLines, identifierLoc, identifier);
			if (nameLoc !== false) {
				identifierLoc = {
					start: nameLoc,
					end: identifierLoc.end,
					source: identifier,
				};
			}
		}

		const shouldSkip = this.shouldSkip(identifier);
		if (shouldSkip === true) {
			return;
		}

		// Add to payload if property kind
		this.addPayload();

		// has underscore prefix
		const hasUnderscorePrefix = identifier.startsWith('_');

		// Skip if it doesn't have an underscore prefix
		if (hasUnderscorePrefix === false) {
			return;
		}

		report({
			message: `${capitalCase(kind)} name "${identifier}" should not be prefixed with an underscore`,
			position: identifierLoc,
			fix: (fixer: Fixer) => {
				const isDollarSigned = ['property', 'variable', 'parameter'].includes(kind);
				const convert = identifier.replace(/^_/u, '');
				const convertedName = (isDollarSigned) ? `$${convert}` : convert;
				return fixer.replaceRange(identifierLoc, convertedName);
			},
		});
	}

	/**
	 * Check that accessed properties and methods are also converted
	 *
	 * For example, if a property is accessed as "$this->_fooBar",
	 * then the underscore prefix should be removed from the property
	 *
	 * @param  {RulePostContext} context Rule context
	 * @return {boolean}                 True if the rule was processed, false otherwise
	 */
	post(context: RulePostContext): boolean {
		const { ast, payload, report } = context;
		const propertylookups = ast.traverse.find('propertylookup');

		if (!propertylookups) {
			return false;
		}

		propertylookups.forEach((propertylookup: AstNode) => {
			const { what, offset, loc, traverse } = propertylookup;
			const whatName = what?.name;
			const offsetName = offset?.name;

			if (whatName !== 'this' || !payload.properties?.includes(offsetName)) {
				return;
			}

			const hasUnderscorePrefix = offsetName.startsWith('_');

			// Skip if it doesn't have an underscore prefix
			if (hasUnderscorePrefix === false) {
				return;
			}

			const isMethod = traverse.closest('call');
			const kind = (isMethod) ? 'Method' : 'Property';

			report({
				message: `${kind} name "${offsetName}" should not be prefixed with an underscore`,
				position: loc,
				fix: (fixer: Fixer) => {
					const convert = offsetName.replace(/^_/u, '');
					return fixer.replaceRange(loc, `$this->${convert}`);
				},
			});
		});

		return true;
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that identifiers are not prefixed with an underscore',
			fixable: true,
			preset: 'psr',
		},
		severity: 'warning',
		defaultOptions: {
			exclude: {
				description: 'Exclude certain kinds of identifiers from being checked',
				type: 'array',
				items: {
					uniqueItems: true,
					type: 'string',
					oneOf: [
						{
							type: 'string',
							const: 'class',
							description: 'Exclude class names',
						},
						{
							type: 'string',
							const: 'interface',
							description: 'Exclude interface names',
						},
						{
							type: 'string',
							const: 'trait',
							description: 'Exclude trait names',
						},
						{
							type: 'string',
							const: 'enum',
							description: 'Exclude enum names',
						},
						{
							type: 'string',
							const: 'enumcase',
							description: 'Exclude enum case names',
						},
						{
							type: 'string',
							const: 'property',
							description: 'Exclude property names',
						},
						{
							type: 'string',
							const: 'method',
							description: 'Exclude method names',
						},
						{
							type: 'string',
							const: 'variable',
							description: 'Exclude variable names',
						},
						{
							type: 'string',
							const: 'parameter',
							description: 'Exclude parameter names',
						},
						{
							type: 'string',
							const: 'function',
							description: 'Exclude function names',
						},
						{
							type: 'string',
							const: 'constant',
							description: 'Exclude constant names',
						},
					],
				},
				default: [''],
			},
		},
		name: 'prefix-underscore',
		register: [
			'class',
			'interface',
			'trait',
			'enum',
			'enumcase',
			'property',
			'method',
			'variable',
			'parameter',
			'function',
			'constant',

		],
		bindClass: PrefixUnderscore,
	};
};
