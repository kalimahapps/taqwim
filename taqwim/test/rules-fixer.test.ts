/**
 * Check that rules are performing fixes correctly
 */

import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import fse from 'fs-extra';
import { expect, describe, test } from 'vitest';
import { globSync } from 'glob';
import { getRules } from '@taqwim-test/utils/';
import Taqwim from '@taqwim/index';

type PairFile = {
	name: string;
	tests: {
		from: string;
		to: string;
		index: number;
	}[];
};

const currentDirectory = fileURLToPath(new URL('.', import.meta.url)).replaceAll('\\', '/');

const rulesFiles = getRules();

/**
 * Loop through rule files in rules folder
 * and get corresponding fixer test files from
 * the test folder.
 *
 * @return {PairFile[]} Array of rules with test data
 */
const getFixerComapreFiles = async (): Promise<PairFile[]> => {
	const pairFiles = [];

	for (const ruleFile of rulesFiles) {
		const filePath = path.posix.join('..', 'src', 'rules', ruleFile);
		const rule = await import(filePath);
		const { meta, name } = rule.default();

		// Construct the rule name
		const ruleName = `${meta.preset.toLowerCase()}/${name.toLowerCase()}`;

		const ruleTestDirectory = path.posix.join(currentDirectory, 'rules', name, 'fixer');

		if (!fse.pathExistsSync(ruleTestDirectory)) {
			continue;
		}

		// Get all php files that have "from" in the name
		const phpFromFiles = globSync('**/*from.php', {
			absolute: false,
			cwd: ruleTestDirectory,
		});

		const ruleTests = [];

		// Loop through each "from" file and find the matching "to" file
		for (const phpFromFile of phpFromFiles) {
			const from = path.posix.join(ruleTestDirectory, phpFromFile);
			const to = path.posix.join(ruleTestDirectory, phpFromFile.replace('from', 'to'));

			if (!fse.pathExistsSync(to)) {
				throw new Error(`Missing "to" file for "${from}"`);
			}

			ruleTests.push({
				index: phpFromFiles.indexOf(phpFromFile) + 1,
				from,
				to,
			});
		}

		pairFiles.push({
			name: ruleName,
			tests: ruleTests,
		});
	}

	return pairFiles;
};

const data = await getFixerComapreFiles();

const taqwim = new Taqwim();
await taqwim.loadConfig();

// Run tests for each rule
const foreachRule = describe.each(data);
foreachRule('Testing $name rule', ({ name, tests }) => {
	const foreachTest = test.each(tests);

	// Run tests for each rule file (correct, incorrect)
	foreachTest('Testing fixer $index', ({ from, to, index }) => {
		const lintOptions = {
			cwd: currentDirectory,
			source: [
				{
					path: from,
				},
			],
			rule: name,
			fix: true,
		};

		const lintResult = taqwim.lint(lintOptions);
		const firstReport = lintResult.shift();

		if (firstReport === undefined) {
			throw new Error('Missing report');
		}

		const { sourceCode } = firstReport;

		const toFileContent = fse.readFileSync(to, 'utf8');

		return expect(sourceCode).toBe(toFileContent);
	});
});