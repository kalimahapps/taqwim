/* eslint-disable max-lines-per-function */

import { expect, describe, test } from 'vitest';
import { indent } from '@taqwim/rules';

describe('Test edge cases and branching', () => {
	const ruleResult = indent();
	const { bindClass } = ruleResult;
	if (!bindClass) {
		return;
	}

	const classInit = new bindClass();

	const range = {
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

	test('Test getBlockLines', () => {
		classInit.node = {
			loc: {
				start: {
					line: 1,
					column: 0,
					offset: 0,
				},
				end: {
					line: 1,
					column: 0,
					offset: 0,
				},
			},
		};
		expect(
			classInit.getBlockLines([])
		).toEqual({
			startLine: 1,
			endLine: 1,
		});

		classInit.context = {
			sourceLines: ['first', 'second line', 'third line'],
		};
		classInit.node = {
			loc: {
				start: {
					line: 1,
					column: 0,
					offset: 0,
				},
				end: {
					line: 2,
					column: 0,
					offset: 0,
				},
			},
		};
		expect(
			classInit.getBlockLines([])
		).toEqual({
			startLine: 1,
			endLine: 2,
		});
	});

	test('Test ifCallback', () => {
		classInit.node = {
			body: {},
		};
		expect(
			classInit.ifCallback()
		).toEqual(false);
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
		).toEqual(false);

		classInit.node = {
			traverse: {
				parent() {
					return {
						kind: 'if',
						loc: range,
					};
				},
			},
			left: {
				loc: range,
			},
			right: {
				loc: range,
			},
		};
		expect(
			classInit.binCallback()
		).toEqual(false);
	});

	test('Test expressionStatementCallback', () => {
		classInit.node = {
			traverse: {
				findByNodeName() {
					return [
						{
							traverse: {
								siblings() {
									return [];
								},
							},
						},
					];
				},

			},
		};
		expect(
			classInit.expressionStatementCallback()
		).toEqual(false);
	});

	test('Test post process', () => {
		const context = {
			config: {},
			ast: {
				loc: {},
			},
		};
		expect(
			classInit.post(context)
		).toBe(false);
	});

	test('Test process', () => {
		const context = {
			payload: {},
			node: {
				kind: 'if',
				body: {},
				loc: {
					start: {
						line: 1,
						column: 0,
						offset: 0,
					},
					end: {
						line: 2,
						column: 0,
						offset: 0,
					},
				},
			},
		};

		expect(
			classInit.process(context)
		).toBeUndefined();
	});

	test('Test removeLineIndent', () => {
		classInit.context = {
			options: {},
			node: {},
			payload: {
				lines: [],
			},
		};
		expect(
			classInit.removeLineIndent(0, 1)
		).toBeUndefined();
	});

	test('Test attrGroupCallback', () => {
		classInit.node = {
			attrs: [],
			loc: range,
		};

		expect(
			classInit.attrGroupCallback()
		).toBe(false);
	});

	test('Test callChildrenCallback', () => {
		classInit.node = {
			arguments: [
				{
					loc: range,
				},
			],
			what: {
				loc: range,
			},
			loc: range,
		};

		expect(
			classInit.callChildrenCallback()
		).toBe(false);
	});
});