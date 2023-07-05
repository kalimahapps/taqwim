import { expect, describe, test } from 'vitest';
import { nameCase } from '@taqwim/rules';

describe('Test edge cases and branching', () => {
	const ruleResult = nameCase();
	const { bindClass } = ruleResult;
	if (!bindClass) {
		return;
	}

	const classInit = new bindClass();

	test('Test createCaseMap', () => {
		classInit.updatedOptions = {
			method: 'test',
		};

		expect(() => {
			classInit.createCaseMap();
		}).toThrow();
	});

	test('Test updateAccessedProperties', () => {
		classInit.callbackMap = {
			method: () => {
				return 'test';
			},
		};
		classInit.context = {
			node: {
				kind: 'method',
				name: {
					name: 'test',
				},
			},
			ast: {
				traverse: {
					find() {
						return [
							{
								what: {
									name: 'this',
								},
								offset: {
									name: 'test',
								},
							},
						];
					},
				},
			},
		};

		expect(
			classInit.updateAccessedProperties()
		).toBeUndefined();
	});
});