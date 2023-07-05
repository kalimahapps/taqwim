import { expect, describe, test } from 'vitest';
import { arrayCommaDangle } from '@taqwim/rules';

describe('Test edge cases and branching', () => {
	const ruleResult = arrayCommaDangle();
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

	test('Test process', () => {
		const context = {
			sourceLines: [''],
			node: {
				loc: range,
				items: [
					{
						loc: range,
					},
				],
			},
			options: {},
		};

		expect(
			classInit.process(context)
		).toBe(false);
	});
});