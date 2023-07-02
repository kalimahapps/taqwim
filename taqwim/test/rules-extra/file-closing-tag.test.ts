import { expect, describe, test } from 'vitest';
import { fileClosingTag } from '@taqwim/rules';

describe('Test edge cases and branching', () => {
	const ruleResult = fileClosingTag();
	const { process } = ruleResult;
	if (!process) {
		return;
	}

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

	test('source is not available', () => {
		const context = {
			node: {
				loc: range,
			},
		};

		expect(
			process(context as any)
		).toBe(false);
	});

	test('Sourcelines is empty', () => {
		const context = {
			node: {
				loc: {
					...range,
					source: '?>',
				},
			},
			sourceLines: [],
			report() { },
		};

		expect(
			process(context as any)
		).toBe(true);
	});
});