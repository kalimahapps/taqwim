/**
 * Set the name case for various elements
 *
 * @see https://www.php-fig.org/psr/psr-1/
 */

import type { RuleDataOptional, RuleContext, AstIdentifier, AstNode } from '@taqwim/types';
import {
	camelCase,
	capitalCase,
	constantCase,
	pascalCase,
	snakeCase
} from 'change-case';

import type Fixer from '@taqwim/fixer';

type Options = {
	[key: string]: string;
	class: string;
	interface: string;
	trait: string;
	enum: string;
	function: string;
	method: string;
	constant: string;
	property: string;
	variable: string;
	parameter: string;
};

type OptionsCallbacks = {
	[key: string]: (input: string) => string;
	class: (input: string) => string;
	interface: (input: string) => string;
	trait: (input: string) => string;
	enum: (input: string) => string;
	function: (input: string) => string;
	method: (input: string) => string;
	constant: (input: string) => string;
	property: (input: string) => string;
	variable: (input: string) => string;
	parameter: (input: string) => string;
};

type Callbacks = {
	camel: (input: string) => string;
	pascal: (input: string) => string;
	snake: (input: string) => string;
	upper: (input: string) => string;
};

class NameCase {
	magicMethods: string[] = [
		'__construct',
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
	callbackMap = {} as OptionsCallbacks;
	updatedOptions = {} as Options;

	/**
	 * Create a map of the options to the callback
	 *
	 * @return {OptionsCallbacks} Map of options to callback
	 */
	createCaseMap(): OptionsCallbacks {
		const caseCallback: Callbacks = {
			camel: camelCase,
			pascal: pascalCase,
			snake: snakeCase,
			upper: constantCase,
		};

		const allowedCases = Object.keys(caseCallback);

		const namesWithCallback = {} as OptionsCallbacks;

		Object.keys(this.updatedOptions).forEach((key: string) => {
			const option = this.updatedOptions[key as keyof Options];
			if (!allowedCases.includes(option)) {
				throw new Error(`Invalid case ${option} for ${key}`);
			}

			namesWithCallback[key] = caseCallback[option as keyof Callbacks];
		});

		return namesWithCallback;
	}

	/**
	 * Fill undefined options with default values
	 *
	 * @return {Options} Options with default values
	 */
	updateOptionWithDefaults(): Options {
		const { options } = this.context;

		const defaultOptions = {
			interface: options.class,
			trait: options.class,
			enum: options.class,
			parameter: options.variable,
		};

		return {
			...defaultOptions,
			...options,
		} as Options;
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
	process(context: RuleContext): void {
		this.context = context;
		const { report, node } = this.context;

		let {
			name: identifier,
			loc: identifierLoc,
			kind,
			isAnonymous,
		} = node;

		if (isAnonymous) {
			return;
		}

		// Normalize identifier and location
		if (kind !== 'variable') {
			const { name, loc } = identifier as AstIdentifier;
			identifier = name;
			identifierLoc = loc;
		}

		const shouldSkip = this.shouldSkip(identifier);

		if (shouldSkip === true) {
			return;
		}

		// Get options with default values for
		// undefined properties like interface and trait
		this.updatedOptions = this.updateOptionWithDefaults();

		// Prepare callback map
		this.callbackMap = this.createCaseMap();

		const changeCaseCallback = this.callbackMap[kind];

		const caseChangeOption = `${this.updatedOptions[kind]} case`;
		const convert = changeCaseCallback(identifier);

		// Skip if conversion produces the same name
		if (convert === identifier) {
			return;
		}

		// Fix accessed properties
		this.updateAccessedProperties();

		report({
			message: `${capitalCase(kind)} name "${identifier}" should be "${convert}" (${changeCaseCallback(caseChangeOption)})`,
			position: identifierLoc,
			fix: (fixer: Fixer) => {
				const isDollarSigned = ['property', 'variable', 'parameter'].includes(kind);

				const convertedName = (isDollarSigned) ? `$${convert}` : convert;

				return fixer.replaceRange(identifierLoc, convertedName);
			},
		});
	}

	/**
	 * Check that accessed properties are also converted
	 * to the correct case. This is for both properties and methods.
	 *
	 * For example, if a property is called `fooBar` is converted 
	 * and it is accessed as "$this->fooBar", then the property
	 * should also be converted to match the case of the property.
	 */
	updateAccessedProperties(): void {
		const { ast, report, node } = this.context;
		const { kind, name } = node;

		if (kind !== 'property' && kind !== 'method') {
			return;
		}

		const propertyName = name.name;
		const propertylookups = ast.traverse.find('propertylookup');

		if (propertylookups.length === 0) {
			return;
		}

		propertylookups.forEach((propertylookup: AstNode) => {
			const { what, offset, loc } = propertylookup;
			const whatName = what?.name;
			const offsetName = offset?.name;

			if (whatName !== 'this' || propertyName !== offsetName) {
				return;
			}

			const changeCaseCallback = this.callbackMap[kind];
			const caseChangeOption = `${this.updatedOptions.property} case`;
			const convert = changeCaseCallback(offsetName);

			// Skip if conversion produces the same name
			if (convert === offsetName) {
				return;
			}

			const type = kind === 'property' ? 'Property' : 'Method';

			report({
				message: `${type} lookup "${offsetName}" should be "${convert}" (${changeCaseCallback(caseChangeOption)})`,
				position: loc,
				fix: (fixer: Fixer) => {
					return fixer.replaceRange(loc, `$this->${convert}`);
				},
			});
		});
	}
}

export default (): RuleDataOptional => {
	const oneOf = [
		{
			type: 'string',
			const: 'camel',
			description: 'Use camelCase convention',
		},
		{
			type: 'string',
			const: 'pascal',
			description: 'Use PascalCase convention',
		},
		{
			type: 'string',
			const: 'snake',
			description: 'Use snake_case convention',
		},
		{
			type: 'string',
			const: 'upper',
			description: 'Use UPPER_CASE convention',
		},
	];
	return {
		meta: {
			description: 'Ensure that the name case is correct',
			fixable: true,
			preset: 'psr',
		},
		severity: 'warning',
		defaultOptions: {
			class: {
				type: 'string',
				oneOf,
				default: 'pascal',
				description: "Class name case. Default is 'pascal'",
			},
			interface: {
				type: 'string',
				oneOf,
				description: 'Interface name case. If not set, class name case will be used',
			},
			trait: {
				type: 'string',
				oneOf,
				description: 'Trait name case. If not set, class name case will be used',
			},
			enum: {
				type: 'string',
				oneOf,
				description: 'Enum name case. If not set, class name case will be used',
			},
			function: {
				type: 'string',
				oneOf,
				default: 'snake',
				description: 'Function name case. Default is snake',
			},
			method: {
				type: 'string',
				oneOf,
				default: 'camel',
				description: 'Method name case. Default is camel',
			},
			constant: {
				type: 'string',
				oneOf,
				default: 'upper',
				description: 'Constant name case. Default is upper',
			},
			property: {
				type: 'string',
				oneOf,
				default: 'snake',
				description: 'Property name case. Default is snake',
			},
			variable: {
				type: 'string',
				oneOf,
				default: 'snake',
				description: 'Variable name case. Default is snake',
			},
		},
		name: 'name-case',
		register: ['class', 'interface', 'trait', 'enum', 'property', 'method', 'variable', 'parameter', 'function', 'constant'],
		bindClass: NameCase,
	};
};
