/**
 * Run all rules for each php file in the test directory
 */
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import fse from 'fs-extra';
import { expect, test } from 'vitest';
import { globSync } from 'glob';
import Taqwim from '@taqwim/index';

const rulesFiles = globSync('**/*.php', {
	absolute: false,
	cwd: './test/rules',
});

const taqwim = new Taqwim();
await taqwim.loadConfig();

const currentDirectory = fileURLToPath(new URL('.', import.meta.url)).replaceAll('\\', '/');

// Test all files with all rules
const foreachRuleEmptyString = test.each(rulesFiles);
foreachRuleEmptyString('Testing `%s` file with all rules', (fileName) => {
	const filePath = path.posix.join(currentDirectory, 'rules', fileName);

	// Get file content
	const content = fse.readFileSync(filePath, 'utf8');
	const lintOptions = {
		cwd: currentDirectory,
		source: [
			{
				content,
			},
		],
	};

	return expect(() => {
		taqwim.lint(lintOptions);
	}).not.toThrow(SyntaxError);
});