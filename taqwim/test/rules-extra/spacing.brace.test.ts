import { expect, describe, test } from 'vitest';
import { spacingBrace } from '@taqwim/rules';

describe('Test edge cases and branching', () => {
	const ruleResult = spacingBrace();
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

	test('Test branching', () => {
		classInit.context = {
			sourceLines: [''],
		};
		classInit.node = {
			loc: searchRange,
			name: 'test',
			body: {
				loc: searchRange,
			},
			uses: [],
			catches: [],
			always: {
				loc: searchRange,
			},
		};

		expect(
			classInit.switchMatchCallback()
		).toBe(false);

		expect(
			classInit.doCallback()
		).toBe(false);

		expect(
			classInit.loopCallback()
		).toBe(false);

		expect(
			classInit.ifCallback()
		).toBe(false);

		expect(
			classInit.closureCallback()
		).toBe(false);

		expect(
			classInit.methodCallback()
		).toBe(false);

		expect(
			classInit.tryCatchCallback()
		).toBe(false);

		expect(
			classInit.objectCallback()
		).toBe(false);

		classInit.node = {
			loc: searchRange,

			isAnonymous: true,
		};
		expect(
			classInit.objectCallback()
		).toBe(false);
	});
});