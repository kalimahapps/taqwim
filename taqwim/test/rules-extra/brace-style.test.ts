/* eslint-disable max-lines-per-function */
import { expect, describe, test } from 'vitest';
import { braceStyle } from '@taqwim/rules';

describe('Test edge cases and branching', () => {
	const ruleResult = braceStyle();
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

	test('Test doWhilecallback', () => {
		classInit.context = {
			sourceLines: [''],
		};
		classInit.node = {
			body: {
				loc: range,
			},
			loc: range,
		};

		expect(
			classInit.doWhileCallback()
		).toBe(false);
	});

	test('Test match arms', () => {
		classInit.node = {
			arms: [],
		};

		expect(
			classInit.matchCallback()
		).toBe(false);

		classInit.node = {
			arms: [undefined],
		};

		expect(
			classInit.matchCallback()
		).toBe(false);
	});

	test('Test reportAndFixOpeningBrace', () => {
		classInit.context = {
			sourceLines: [''],
			report: () => { },
		};
		classInit.node = {
			body: {
				loc: range,
			},
			loc: range,
		};

		expect(
			classInit.reportAndFixOpeningBrace()
		).toBe(false);
	});

	test('Test objectMethodCallback', () => {
		classInit.node = {
			body: {
				loc: range,
			},
			loc: range,
		};

		expect(
			classInit.objectMethodCallback()
		).toBe(false);
	});

	test('Test reportAndFixClosingBrace', () => {
		classInit.context = {
			sourceLines: [''],
			report: () => { },
		};
		const node = {
			loc: range,
		};

		expect(
			classInit.reportAndFixClosingBrace(node)
		).toBe(false);

		classInit.context = {
			sourceLines: ['}', '', '', ''],
		};

		const node2 = {
			loc: {
				start: {
					line: 0,
					column: 0,
					offset: 0,
				},
				end: {
					line: 0,
					column: 1,
					offset: 1,
				},
			},
		};

		const node3 = {
			loc: {
				start: {
					line: 2,
					column: 0,
					offset: 0,
				},
				end: {
					line: 3,
					column: 1,
					offset: 1,
				},
			},
		};

		expect(
			classInit.reportAndFixClosingBrace(node2, node3)
		).toBe(false);
	});
});