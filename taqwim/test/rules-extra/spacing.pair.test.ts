import { expect, describe, test } from 'vitest';
import { spacingPair } from '@taqwim/rules';

describe('Test edge cases and branching', () => {
	const ruleResult = spacingPair();
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

	test('Test handleItems ', () => {
		classInit.context = {
			options: {
				align: true,
			},
		};

		classInit.node = {
			items: [],
			loc: searchRange,
		};

		expect(
			classInit.handleItems()
		).toBe(false);

		classInit.context.sourceLines = [''];
		classInit.node.items = [
			{
				key: 'ss',
				value: {
					loc: searchRange,
				},
				loc: searchRange,
			},
		];

		expect(
			classInit.handleItems()
		).toBe(false);
	});

	test('Test handleMatch ', () => {
		classInit.context = {
			options: {
				align: true,
			},
		};

		classInit.node = {
			arms: [],
			loc: searchRange,
		};

		expect(
			classInit.handleMatch()
		).toBe(false);

		classInit.context.sourceLines = [''];
		classInit.node.arms = [
			{
				key: 'key',
				value: {
					loc: searchRange,
				},
				loc: searchRange,
			},
		];

		expect(
			classInit.handleMatch()
		).toBe(false);

		// classInit.context.options.align = true;
		classInit.node.loc = {
			start: {
				line: 0,
				column: 0,
				offset: 0,
			},
			end: {
				line: 2,
				column: 0,
				offset: 0,
			},
		};

		expect(
			classInit.handleMatch()
		).toBe(false);
	});

	test('Test getEntries', () => {
		classInit.node = {
			items: [],
		};

		expect(
			classInit.getEntries()
		).toEqual([]);
	});
});
