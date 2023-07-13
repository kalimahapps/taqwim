/**
 * Validate and format @param tag
 */

import type { AstComment, AstNode, RuleContext, RuleDataOptional } from '@taqwim/types';
import type { DocblockTag } from '@kalimahapps/docblock-parser';
import Parser from '@kalimahapps/docblock-parser';

type ParameterLoc = {
	line: number,
	column: number
};

class ValidateParameter {
	docblock: AstComment = {} as AstComment;
	context: RuleContext = {} as RuleContext;
	paramTags: DocblockTag[] = [];
	methodArguments: AstNode[] = [];

	/**
	 * Check if the @param tag has a different type than the method argument
	 *
	 * @param {DocblockTag} tag `@param` tag to check
	 */
	checkMismatchedType(tag: DocblockTag) {
		const {
			type: parameterType,
			variable,
			position,
		} = tag;

		const matchingArgument = this.methodArguments.find((argument: AstNode) => {
			return `$${argument.name.name}` === variable.value;
		});

		// If there is no matching argument, then the param is extraneous
		if (!matchingArgument || !matchingArgument.type) {
			return;
		}

		const { name: argumentType } = matchingArgument.type;

		if (argumentType === undefined || argumentType === 'nullkeyword' || parameterType.value.includes(argumentType)) {
			return;
		}

		const { report } = this.context;
		console.log('position', position);
		report({
			message: `Type mismatch. @param tag has type \`${parameterType.value}\` but argument is of type \`${argumentType}\``,
			position,
		});
	}

	/**
	 * Find if a method argument is missing a @param tag
	 *
	 * @param {AstNode} methodArgument Method argument to check
	 */
	findMissingParams(methodArgument: AstNode) {
		const { report } = this.context;
		const { loc: commentLoc } = this.docblock;

		const { name: argumentName } = methodArgument;
		const parameter = this.paramTags.find((parameter: DocblockTag) => {
			return parameter.variable.value === `$${argumentName.name}`;
		});

		if (parameter !== undefined) {
			return;
		}

		report({
			message: `Missing @param tag for "$${argumentName.name}" parameter`,
			position: {
				start: commentLoc.start,
				end: {
					...commentLoc.start,
					column: commentLoc.start.column + 3,
				},
			},
		});
	}

	/**
	 * Report error if there are issues with the anatomy of a `@param` tag
	 *
	 * @param  {DocblockTag} tag  `@param` tag to report error for
	 * @param  {string}      type Part of `@param` tag to report error for
	 * @return {void}
	 */
	reportMissingParamData(tag: DocblockTag, type: string): void {
		const { report } = this.context;

		let errorMessage = '';
		if (type === 'type') {
			errorMessage = 'Missing type for @param tag';
		} else if (type === 'desc') {
			errorMessage = 'Missing description for @param tag';
		}

		report({
			message: errorMessage,
			position: tag.name.position,
		});
	}

	/**
	 * Get start location of `@param` in docblock based on method argument name
	 *
	 * @param  {string}       argumentName Argument name
	 * @return {ParameterLoc}              Location of @param tag if found, undefined otherwise
	 */
	getParamStartLoc(argumentName: string): ParameterLoc {
		const lines = this.docblock.value.split(/\r?\n/u);

		const parameterIndex = lines.findIndex((line) => {
			const regex = new RegExp(`@param.+${argumentName}`, 'u');
			return regex.test(line);
		});

		if (parameterIndex === -1) {
			return Object.create(null);
		}

		const parameterStartCol = lines[parameterIndex].indexOf('@param');

		if (parameterStartCol === -1) {
			return Object.create(null);
		}

		return {
			line: parameterIndex,
			column: parameterStartCol,
		};
	}

	/**
	 * Get all @param tags from docblock
	 *
	 * @return {DocblockTag[]} Array of @param tags
	 */
	getParamsTags(): DocblockTag[] {
		const { loc, value } = this.docblock;
		const { tags } = new Parser().parse(value, loc.start.line, loc.start.offset);

		return tags.filter((tag: DocblockTag) => {
			return tag.name.value === '@param';
		});
	}

	/**
	 * Check if there are extraneous params in docblock
	 */
	reportExtraneousParams() {
		const { report } = this.context;

		// Find and report extraneous params
		const matchingParameters = this.paramTags
			.reduce((accumulator: DocblockTag[], parameter: DocblockTag) => {
				const { variable, position } = parameter;
				const argumentTag = this.methodArguments.find((methodArgument) => {
					return `$${methodArgument.name.name}` === variable.value;
				});

				if (argumentTag !== undefined) {
					accumulator.push(parameter);
					return accumulator;
				}

				report({
					message: 'Extraneous @param tag',
					position,
				});

				return accumulator;
			}, []);

		// Update param tags to remove extraneous params
		this.paramTags = matchingParameters;
	}

	process(context: RuleContext) {
		const { node } = context;
		const { leadingComments, arguments: methodArguments } = node;

		this.context = context;
		this.methodArguments = methodArguments ?? [];

		leadingComments.forEach((docblock) => {
			const { value: docblockString } = docblock;

			// Make sure it is a docblock
			if (!docblockString.startsWith('/**')) {
				return;
			}

			this.docblock = docblock;

			this.paramTags = this.getParamsTags();

			if (this.methodArguments.length === 0) {
				// Report error if there are params in docblock
				if (this.paramTags.length === 0) {
					return;
				}

				this.reportExtraneousParams();
				return;
			}

			// Find extraneous params
			// This will also manipulate the paramTags array and remove extraneous params
			this.reportExtraneousParams();

			// Find missing params
			this.methodArguments.forEach(this.findMissingParams.bind(this));

			// Validate params format in docblock
			this.paramTags.forEach((parameter: DocblockTag) => {
				const {
					type: parameterType,
					description: parameterDesc,
				} = parameter;

				if (parameterDesc.length === 0) {
					this.reportMissingParamData(parameter, 'desc');
				}

				if (parameterType.value.length === 0) {
					this.reportMissingParamData(parameter, 'type');
				} else if (parameterType.value.includes('mixed') === false) {
					this.checkMismatchedType(parameter);
				}
			});
		});
	}
}

export default (): RuleDataOptional => {
	return {
		meta: {
			description: 'Validate and format @param tag',
			preset: 'docblock',
			fixable: false,
		},
		name: 'param-tag',
		register: ['function', 'method'],
		bindClass: ValidateParameter,
	};
};