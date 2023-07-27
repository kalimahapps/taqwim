/* eslint complexity: ["warn", 12] */
import { WithCallMapping } from '@taqwim/decorators';
import type {
	AllAstTypes,
	AstClass,
	AstEntry,
	AstIdentifier,
	AstMethod,
	AstParameter,
	AstProperty,
	CallbacksMap,
	Loc,
	RuleContext,
	RuleDataOptional
} from '@taqwim/types';

class Compatibility {
	/**
	 * The context of the rule
	 */
	context = {} as RuleContext;

	/**
	 * The node to process
	 */
	node = {} as AllAstTypes;

	/**
	 * List of PHP versions
	 */
	phpVersion = ['8.0', '8.1', '8.2'];

	/**
	 * List of callbacks for each node type
	 */
	callbacksMap: CallbacksMap = {
		enumCallback: ['enum'],
		propertyCallback: ['property'],
		parameterCallback: ['parameter'],
		methodCallback: ['method', 'function'],
		entryCallback: ['entry'],
		classCallback: ['class'],
	};

	/**
	 * Check if the set version is compatible with the given version
	 *
	 * @param  {string}  version The version to check for compatibility
	 * @return {boolean}         True if the set version is compatible with the given version
	 */
	isCompatible(version: string): boolean {
		const { options } = this.context;
		const versionInt = Number.parseInt(version.replace('.', ''), 10);
		const phpVersionInt = Number.parseInt(options.version.replace('.', ''), 10);

		return versionInt <= phpVersionInt;
	}

	/**
	 * Helper function to report a feature for a given version
	 *
	 * @param {string} feature  The feature to report
	 * @param {Loc}    position The position of the feature
	 * @param {string} version  The version of PHP the feature is supported in
	 */
	reportFeature(feature: string, position: Loc, version = '8.1') {
		const { report, options } = this.context;

		report({
			message: `${feature} is supported in PHP ${version} and above. Current set version is ${options.version}`,
			position,
		});
	}

	processTypeCompatibility(type: AstIdentifier) {
		const is81Compatible = this.isCompatible('8.1');
		const is82Compatible = this.isCompatible('8.2');

		const isIntersectionType = type.kind === 'intersectiontype';

		let isNeverType = false;
		let isFalseType = false;
		let isTrueType = false;
		let isNullType = false;

		if (type.kind === 'name') {
			isNeverType = type.name === 'never';
			isFalseType = type.name === 'false';
			isTrueType = type.name === 'true';
			isNullType = type.name === 'null';
		}

		if (!is81Compatible && (isIntersectionType || isNeverType)) {
			const kind = type.kind === 'intersectiontype' ? 'Intersection return type' : 'Never return type';
			this.reportFeature(kind, type.loc);
		}

		if (!is82Compatible && (isFalseType || isTrueType || isNullType)) {
			let kind = 'False type';
			if (isTrueType) {
				kind = 'True type';
			} else if (isNullType) {
				kind = 'Null type';
			}

			this.reportFeature(kind, type.loc, '8.2');
		}
	}

	/**
	 * Handle class
	 */
	classCallback() {
		const isCompatible = this.isCompatible('8.2');
		if (isCompatible) {
			return;
		}

		const { isReadonly } = this.node as AstClass;
		if (isReadonly !== true) {
			return;
		}

		this.reportFeature('Readonly class', this.node.loc, '8.2');
	}

	/**
	 * Handle array entry
	 */
	entryCallback() {
		const isCompatible = this.isCompatible('8.1');
		if (isCompatible) {
			return;
		}

		const { unpack } = this.node as AstEntry;
		if (unpack !== true) {
			return;
		}

		this.reportFeature('Array unpacking', this.node.loc);
	}

	/**
	 * Handle function and method type
	 */
	methodCallback() {
		const { type } = this.node as AstMethod;

		if (!type) {
			return;
		}

		this.processTypeCompatibility(type as AstIdentifier);
	}

	/**
	 * Handle parameter type
	 */
	parameterCallback() {
		const { type } = this.node as AstParameter;
		if (!type) {
			return;
		}
		this.processTypeCompatibility(type);
	}

	/**
	 * Handle class property 
	 */
	propertyCallback() {
		const isCompatible = this.isCompatible('8.1');
		if (isCompatible) {
			return;
		}

		const { loc, readonly } = this.node as AstProperty;

		if (readonly !== true) {
			return;
		}

		this.reportFeature('Readonly property', loc);
	}

	/**
	 * Handle enum
	 */
	enumCallback() {
		const isCompatible = this.isCompatible('8.1');
		if (isCompatible) {
			return;
		}

		const { loc } = this.node;
		this.reportFeature('Enum', loc);
	}

	@WithCallMapping
	process(context: RuleContext): boolean {
		this.context = context;
		this.node = context.node;

		return true;
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Ensure that implemented features are compatible with the set version of PHP',
			fixable: false,
			preset: 'taqwim',
		},
		name: 'compatibility',
		severity: 'warning',
		defaultOptions: {
			version: {
				type: 'string',
				default: '8.0',
				description: 'The version of PHP to check for compatibility',
				oneOf: [
					{
						const: '8.0',
						type: 'string',
						description: 'PHP 8.0',
					},
					{
						const: '8.1',
						type: 'string',
						description: 'PHP 8.1',
					},
					{
						const: '8.2',
						type: 'string',
						description: 'PHP 8.2',
					},
				],
			},
		},
		register: ['enum', 'property', 'parameter', 'function', 'method', 'entry', 'class'],
		bindClass: Compatibility,
	};
};
