import { expect, describe, test } from 'vitest';
import { spacingAccessor } from '@taqwim/rules';

describe('Test edge cases and branching', () => {
	const ruleResult = spacingAccessor();
	const { bindClass } = ruleResult;
	if (!bindClass) {
		return;
	}

	const classInit = new bindClass();

	test('Test accessor location', () => {
		const range = {
			line: 0,
			column: 0,
			offset: 0,
		};

		classInit.context = {
			sourceLines: [''],
		};

		expect(
			classInit.getAccessorLoc(range, range)
		).toBe(false);
	});
});