/**
 * Test undefined properties
 */
import { expect, describe, test } from 'vitest';
import {
	fileEndLine,
	arraySyntax,
	noMixWhitespace,
	lineLimit,
	linebreakStyle,
	oneDeclarationPerFile,
	prefixUnderscore,
	keywordsLowercase
} from '@taqwim/rules';
import type { RuleContext } from '@taqwim/types';

const processRules = [fileEndLine, arraySyntax, noMixWhitespace, lineLimit, linebreakStyle];
const foreachTest = test.each(processRules);

describe('Test undefined source in loc', () => {
	foreachTest('Test file end line', (rule) => {
		const ruleResult = rule();
		const { process } = ruleResult;
		if (!process) {
			return;
		}

		const context = {
			node: {
				loc: {
					source: undefined,
				},
			},
		};

		expect(process(context as RuleContext)).toBe(false);
	});
});

test('Test undefined children', () => {
	const ruleResult = oneDeclarationPerFile();
	const { process } = ruleResult;
	if (!process) {
		return;
	}

	const context = {
		node: {
			children: undefined,
		},
	};

	expect(process(context as RuleContext)).toBe(false);
});

test('Test undefined propertylookup in traverse', () => {
	const ruleResult = prefixUnderscore();
	const { bindClass } = ruleResult;

	if (!bindClass) {
		return;
	}

	const initClass = new bindClass();
	const context = {
		ast: {
			traverse: {
				find: () => { },
			},
		},
	};
	expect(initClass.post(context)).toBe(false);
});
