import { required } from '@taqwim/plugins/docblock';
import { expect, describe, test } from 'vitest';

describe('Test edge cases and branching', () => {
	const ruleResult = required();
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

	test('Test reportAndFix', () => {
		classInit.node = {
			loc: range,
		};

		expect(
			classInit.reportAndFix()
		).toBe(false);
	});

	test('Test getFunctionDocblock', () => {
		classInit.context = {
			node: { type: '' },
		};
		expect(
			classInit.getFunctionDocblock()
		).toBe('');
	});
});