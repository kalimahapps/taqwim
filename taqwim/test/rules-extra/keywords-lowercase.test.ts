import { expect, describe, test } from 'vitest';
import { keywordsLowercase } from '@taqwim/rules';

describe('Test edge cases and branching', () => {
	const ruleResult = keywordsLowercase();
	const { bindClass } = ruleResult;
	if (!bindClass) {
		return;
	}

	const classInit = new bindClass();

	test('Test expressionCallback', () => {
		classInit.node = {};

		expect(
			classInit.expressionCallback()
		).toBe(false);

		classInit.node = {
			loc: {},
			expression: {
				type: 'include',
				kind: 'include',
				require: false,
			},
		};
		expect(classInit.expressionCallback()).toBe(true);
	});

	test('Test checkAndReportKeyword', () => {
		classInit.context = {
			sourceLines: [''],
			report: () => { },
		};

		classInit.node = {
			loc: {},
		};
		expect(classInit.checkAndReportKeyword('keyword', '')).toBe(false);

		classInit.context = {
			sourceLines: [''],
			report: () => { },
		};

		classInit.node = {
			loc: {},
		};
		expect(classInit.checkAndReportKeyword('keyword', 'source')).toBe(false);
	});
});