/* eslint-disable max-lines-per-function */
import { expect, describe, test } from 'vitest';
import { spacingSeparation } from '@taqwim/rules';

describe('Test edge cases and branching', () => {
	const ruleResult = spacingSeparation();
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

	test('Test leading/trailing space removing and adding', () => {
		classInit.context.sourceLines = [];

		expect(
			classInit.removeSeparatorLeadingSpace(searchRange)
		).toBe(false);

		expect(
			classInit.removeLeadingSpace(searchRange)
		).toBe(false);

		classInit.context.sourceLines = [''];

		expect(
			classInit.removeSeparatorLeadingSpace(searchRange)
		).toBe(false);

		expect(
			classInit.removeLeadingSpace(searchRange)
		).toBe(false);

		expect(
			classInit.addLeadingSpace(searchRange)
		).toBe(false);

		expect(
			classInit.processTrailingSpace(searchRange)
		).toBe(false);
	});

	test('Test match callback', () => {
		classInit.node = {
			arms: [],
		};

		expect(
			classInit.matchCallback()
		).toBe(false);
	});

	test('Test process entries', () => {
		// Test process entries function
		const entry = {
			traverse: {
				parent() {
					return false;
				},
			},
		};

		expect(
			classInit.processEntries(entry, 0, [])
		).toBe(false);
	});
	test('Test array callback', () => {
		// Test array callback
		classInit.node = {
			items: [],
			loc: searchRange,
		};

		expect(
			classInit.arrayCallback()
		).toBe(false);
	});

	test('Test constant statement callback', () => {
		classInit.node = {
			constants: [],
		};

		expect(
			classInit.constantStatementCallback()
		).toBe(false);

		classInit.node = {
			constants: [''],
			loc: searchRange,
			kind: 'constantstatement',
		};

		expect(
			classInit.constantStatementCallback()
		).toBe(true);

		classInit.node = {
			constants: [''],
			loc: searchRange,
			traverse: {
				nextSibling() {
					return false;
				},
				parent() {
					return false;
				},
			},
		};

		expect(
			classInit.constantStatementCallback()
		).toBe(false);

		classInit.node = {
			constants: [''],
			loc: searchRange,
			traverse: {
				nextSibling() {
					return false;
				},
				parent() {
					return {
						loc: searchRange,
					};
				},
			},
		};

		expect(
			classInit.constantStatementCallback()
		).toBe(true);
	});

	test('Test case callback', () => {
		expect(
			classInit.caseCallback()
		).toBe(false);

		classInit.node = {
			body: {
				children: [],
			},
		};

		expect(
			classInit.caseCallback()
		).toBe(false);
	});

	test('Test enumcase callback', () => {
		classInit.node = {
			traverse: {
				parent() {
					return false;
				},
			},
		};

		expect(
			classInit.enumcaseCallback()
		).toBe(false);

		classInit.node = {
			loc: searchRange,
			traverse: {
				parent() {
					return {
						loc: searchRange,
					};
				},
			},
		};

		expect(
			classInit.enumcaseCallback()
		).toBe(false);
	});

	test('Test traitUse callback ', () => {
		classInit.node = {
			traits: [],
			loc: searchRange,
		};

		expect(
			classInit.traitUseCallback()
		).toBe(true);
	});

	test('Test property statement callback ', () => {
		classInit.node = {
			properties: [],
			traverse: {
				parent() {
					return false;
				},
			},
			loc: searchRange,
		};

		expect(
			classInit.propertyStatementCallback()
		).toBe(false);

		classInit.node = {
			properties: [],
			traverse: {
				parent() {
					return {
						loc: searchRange,
					};
				},
			},
			loc: searchRange,
		};

		expect(
			classInit.propertyStatementCallback()
		).toBe(false);
	});
});
