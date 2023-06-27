import { expect, describe, test } from 'vitest';
import { spacingTypes } from '@taqwim/rules';

describe('Test edge cases and branching', () => {
	const ruleResult = spacingTypes();
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

	test('Test parameterCallback', () => {
		classInit.context = {
			sourceLines: [''],
			report: () => { },
		};

		classInit.node = {
			nullable: true,
			type: {
				loc: {
					start: {
						line: 0,
						column: 0,
						offset: 0,
					},
					end: {
						line: 0,
						column: 100,
						offset: 100,
					},
				},
			},
			name: {
				loc: searchRange,
			},
			loc: searchRange,
		};

		expect(
			classInit.parameterCallback()
		).toBe(false);
	});
});