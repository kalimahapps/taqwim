/* eslint-disable max-lines-per-function */
import { expect, describe, test } from 'vitest';
import { spacingOperators } from '@taqwim/rules';

describe('Test edge cases and branching', () => {
	const ruleResult = spacingOperators();
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

	test('Test leading/trailing space removing and adding', () => {
		classInit.context = {
			sourceLines: [''],
			node: 'test',
		};

		expect(
			classInit.reportAndFixAroundSpaces(searchRange, searchRange, '>')
		).toBe(false);

		expect(
			classInit.reportAndFixLeftSpace(searchRange, searchRange, '>', 1)
		).toBe(false);

		expect(
			classInit.reportAndFixRightSpace(searchRange, searchRange, '>', 1)
		).toBe(false);
	});

	test('Test handle type operator', () => {
		classInit.context = {
			sourceLines: [''],
			node: {
				loc: searchRange,
			},
		};

		expect(
			classInit.handleTypeOperator({
				loc: searchRange,
			})
		).toBe(false);

		classInit.context = {
			sourceLines: [' : '],
			report: () => { return true; },
			node: {
				loc: {
					start: {
						line: 0,
						column: 1,
						offset: 1,
					},
					end: {
						line: 0,
						column: 2,
						offset: 2,
					},
				},
			},
		};

		const typeSearchRange = {
			start: {
				line: 0,
				column: 2,
				offset: 2,
			},
			end: {
				line: 0,
				column: 3,
				offset: 3,
			},
		};

		expect(
			classInit.handleTypeOperator({
				loc: typeSearchRange,
			})
		).toBe(false);
	});

	test('Test handleArrowFunctionRef', () => {
		classInit.node = {
			loc: searchRange,
		};

		expect(
			classInit.handleArrowFunctionRef()
		).toBe(false);

		classInit.context = {
			sourceLines: ['fn  &  ($a)'],
			report: () => { return true; },
		};

		classInit.node = {
			kind: 'test',
			loc: {
				start: {
					line: 0,
					column: 0,
					offset: 0,
				},
				end: {
					line: 0,
					column: 12,
					offset: 12,
				},
			},
		};

		expect(
			classInit.handleArrowFunctionRef()
		).toBe(true);
	});

	test('Test parameterCallback', () => {
		classInit.node = {
			name: 'stringTest',
		};

		expect(
			classInit.parameterCallback()
		).toBe(false);

		classInit.node = {
			name: {
				loc: searchRange,
			},
		};
		expect(
			classInit.parameterCallback()
		).toBe(false);

		classInit.node = {
			loc: searchRange,
			name: {
				loc: searchRange,
			},
			byref: true,
		};

		expect(
			classInit.parameterCallback()
		).toBe(false);
	});
});