import { expect, describe, test } from 'vitest';
import { spacingAssignment } from '@taqwim/rules';

describe('Test edge cases and branching', () => {
	const ruleResult = spacingAssignment();
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

	test('Test reporting', () => {
		const node = {
			expression: {
				loc: searchRange,
				left: {
					loc: searchRange,
				},
				right: {
					loc: searchRange,
				},
			},
			loc: searchRange,
		};
		classInit.context = {
			sourceLines: [''],
			report: () => { },
		};

		expect(
			classInit.reportAndFixMultiLeadingSpace(node, 1)
		).toBe(false);

		expect(
			classInit.reportAndFixTraillingSpace(node)
		).toBe(false);

		expect(
			classInit.reportAndFixLeadingSpace(node)
		).toBe(false);
	});
});