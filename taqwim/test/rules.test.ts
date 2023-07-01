import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import fse from 'fs-extra';
import { expect, describe, test } from 'vitest';
import { globSync } from 'glob';
import Taqwim from '@taqwim/index';

type RuleData = {
	name: string;
	meta: any;
	tests: {
		fullFilePath: string;
		file: string;
		data: any;
		group: string,
	}[];
};

type JsonData = {
	description: string;
	expected: number;
	expectedCallback?: (result: any) => void;
};

const rulesFiles = globSync('**/*.ts', {
	absolute: false,
	ignore: ['**/index.ts'],
	cwd: 'src/rules',
});

const currentDirectory = fileURLToPath(new URL('.', import.meta.url)).replaceAll('\\', '/');

/**
 * Loop through rule files in rules folder
 * and compare to files in test folder.
 * Match by dir/file name. If found, load the test data
 * and return an array of rules with test data
 *
 * @return {any[]} Array of rules with test data
 */
const getRulesWithData = async () => {
	const accumulator: RuleData[] = [];

	// Get test data for each rule
	for (const ruleFile of rulesFiles) {
		const filePath = path.posix.join('..', 'src', 'rules', ruleFile);
		const rule = await import(filePath);
		const { meta, name } = rule.default();

		// Construct the rule name
		const ruleName = `${meta.preset.toLowerCase()}/${name.toLowerCase()}`;
		const ruleTestDirectory = path.posix.join(currentDirectory, 'rules', name.toLowerCase());

		if (!fse.pathExistsSync(ruleTestDirectory)) {
			throw new Error(`No test directory found for ${ruleName}`);
		}

		// Get all php files in the test directory
		const phpFiles = globSync('*.php', {
			absolute: false,
			cwd: ruleTestDirectory,
		});

		// Load meta data from json in same directory
		const metaFileJS = path.posix.join(ruleTestDirectory, 'data.js');
		const metaFileJson = path.posix.join(ruleTestDirectory, 'data.json');

		const metaFileJSExists = fse.pathExistsSync(metaFileJS);
		if (!metaFileJSExists && !fse.pathExistsSync(metaFileJson)) {
			throw new Error(`No data.js or data.json files found for ${ruleName}`);
		}

		let metaFileData: Record<string, JsonData>;
		if (metaFileJSExists) {
			const importJs = await import(metaFileJS);
			metaFileData = importJs.default;
		} else {
			metaFileData = await fse.readJSON(metaFileJson);
		}

		const ruleData: RuleData = {
			name: ruleName,
			meta,
			tests: [],
		};

		// Accumulate meta file since each key contains the test data
		// for a specific group. For example, there is default that
		// contains the test data for the default options. Then each
		// rule can have a group of tests for each option
		Object.entries(metaFileData)
			.forEach(([group, currentValue]) => {
				// Loop through metadata and get the relevant php file
				// and test data
				Object.entries(currentValue).forEach(([key, value]) => {
					const phpFile = `${key}.php`;
					const phpFilePath = path.posix.join(ruleTestDirectory, phpFile);

					if (!phpFiles.includes(phpFile)) {
						throw new Error(`No php file found for ${phpFilePath}`);
					}

					ruleData.tests.push({
						fullFilePath: phpFilePath,
						file: phpFile,
						data: value,
						group,
					});
				});
			});
		accumulator.push(ruleData);
	}

	return accumulator;
};

const data = await getRulesWithData();

const taqwim = new Taqwim();
await taqwim.loadConfig();

// Run tests for each rule
const foreachRule = describe.each(data);
foreachRule('Testing $name rule', ({ name, tests }) => {
	const foreachTest = test.each(tests);

	// Run tests for each rule file (correct, incorrect)
	foreachTest('$group - Testing $data.description', ({ data, group, fullFilePath }) => {
		const lintOptions = {
			cwd: currentDirectory,
			source: [
				{
					path: fullFilePath,
				},
			],
			rule: name,
		};

		if (data.throwError) {
			return expect(() => {
				taqwim.lint(lintOptions);
			}).toThrow();
		}

		const lintResult = taqwim.lint(lintOptions);

		if (data.expectedCallback) {
			return data.expectedCallback(expect, lintResult);
		}

		const topLintResult = lintResult.shift();
		if (topLintResult === undefined && data.expected === 0) {
			return expect(true).toBe(true);
		}

		if (topLintResult === undefined) {
			throw new Error('No lint result');
		}

		const { reports } = topLintResult;

		const message = [
			`\n\n\nExpected ${data.expected} reports, got ${reports.length} for ${data.description}`,
			`File: ${fullFilePath}`,
			'\n\n\n',
		].join('\n');

		return expect(reports, message).toHaveLength(data.expected);
	});
});

// Test each rule with empty string
const foreachRuleEmptyString = test.each(data);
foreachRuleEmptyString('Testing $name rule with empty string', ({ name }) => {
	const lintOptions = {
		cwd: currentDirectory,
		source: [
			{
				path: '',
				content: '',
			},
		],
		rule: name,
	};
	const lintResult = taqwim.lint(lintOptions);

	return expect(lintResult).toHaveLength(0);
});