/* eslint-disable max-lines-per-function */
import { expect, describe, test } from 'vitest';
import { spacingParen } from '@taqwim/rules';

describe('Test edge cases and branching', () => {
	const ruleResult = spacingParen();
	const { bindClass } = ruleResult;
	if (!bindClass) {
		return;
	}

	const classInit = new bindClass();

	const searchRange = {
		start: {
			line: 0,
			column: 0,
			offset: 0,
		},
		end: {
			line: 0,
			column: 0,
			offset: 0,
		},
	};

	test('Test processOpenParen', () => {
		classInit.context = {
			sourceLines: [''],
			node: {},
		};
		expect(
			classInit.processOpenParen(searchRange)
		).toBe(false);
	});

	test('Test closureCallback', () => {
		classInit.context = {
			sourceLines: [''],
		};

		classInit.node = {
			uses: [''],
			kind: 'test',
			loc: searchRange,
		};
		expect(
			classInit.closureCallback()
		).toBe(false);
	});

	test('Test doCallback', () => {
		classInit.context = {
			sourceLines: [''],
		};

		classInit.node = {
			kind: 'test',
			body: { loc: searchRange },
			loc: searchRange,
		};
		expect(
			classInit.doCallback()
		).toBe(false);
	});

	test('Test binCallback', () => {
		classInit.node = {
			traverse: {
				parent() {
					return false;
				},
			},
		};
		expect(
			classInit.binCallback()
		).toBe(false);
	});
});
