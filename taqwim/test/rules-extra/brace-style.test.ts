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
});