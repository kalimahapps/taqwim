/**
 * Check that rules are performing fixes correctly
 */

import * as path from 'node:path';
import fse from 'fs-extra';
import { expect, describe, test } from 'vitest';
import { globSync } from 'glob';
import Taqwim from '@taqwim/index';

type PairFile = {
	name: string;
	tests: {
		from: string;
		to: string;
		index: number;
	}[];
};

class TestFixer {
	folderPath: string;
	testFolderPath: string;

	constructor(folderPath: string, testFolderPath: string) {
		this.folderPath = folderPath;
		this.testFolderPath = testFolderPath;
	}

	/**
	 * Loop through rule files in rules folder
	 * and get corresponding fixer test files from
	 * the test folder.
	 *
	 * @return {PairFile[]} Array of rules with test data
	 */
	async getFixerComapreFiles(): Promise<PairFile[]> {
		const pairFiles = [];

		const rulesFiles = globSync('**/*.ts', {
			absolute: false,
			ignore: ['**/index.ts'],
			cwd: this.folderPath,
		});

		for (const ruleFile of rulesFiles) {
			const filePath = path.posix.join(this.folderPath, ruleFile);
			const rule = await import(filePath);
			const { meta, name } = rule.default();

			// Construct the rule name
			const ruleName = `${meta.preset.toLowerCase()}/${name.toLowerCase()}`;

			const testDirectory = path.posix.join(this.testFolderPath, name, 'fixer');

			if (!fse.pathExistsSync(testDirectory)) {
				continue;
			}

			// Get all php files that have "from" in the name
			const phpFromFiles = globSync('**/*from.php', {
				absolute: false,
				cwd: testDirectory,
			});

			const ruleTests = [];

			// Loop through each "from" file and find the matching "to" file
			for (const phpFromFile of phpFromFiles) {
				const from = path.posix.join(testDirectory, phpFromFile);
				const to = path.posix.join(testDirectory, phpFromFile.replace('from', 'to'));

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
	}

	async start() {
		const data = await this.getFixerComapreFiles();

		const taqwim = new Taqwim();
		await taqwim.loadConfig();

		// Run tests for each rule
		const foreachRule = describe.each(data);
		foreachRule('Testing $name rule', ({ name, tests }) => {
			const foreachTest = test.each(tests);

			// Run tests for each rule file (correct, incorrect)
			foreachTest('Testing fixer $index', ({ from, to, index }) => {
				const lintOptions = {
					cwd: this.testFolderPath,
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

				const message = `\n\nError in file ${from} \n\n`;
				return expect(toFileContent, message).toBe(sourceCode);
			});
		});
	}
}

export default TestFixer;