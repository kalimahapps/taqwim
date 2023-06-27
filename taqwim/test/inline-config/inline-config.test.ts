import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import Taqwim from '@taqwim/index';
import InlineConfig from '@taqwim/inline-config';
import { parseFile } from '@taqwim/parser';

// Load source file
const currentDirectory = fileURLToPath(new URL('.', import.meta.url)).replaceAll('\\', '/');
const sourceFile = path.posix.join(currentDirectory, 'source.php');
const lintOptions = {
	cwd: currentDirectory,
	source: [{ path: sourceFile }],
};

const parser = parseFile(sourceFile);
const inlineConfig = new InlineConfig(parser.ast);

it('should lint source files without errors using inline config', async () => {
	const taqwim = new Taqwim();
	await taqwim.loadConfig();
	const lintResult = taqwim.lint(lintOptions);

	expect(lintResult.length).toBe(0);
});

it('should return false when check if rule is enabled', () => {
	const checkRule = inlineConfig.isRuleDisabled({
		message: '',
		position: {
			start: {
				line: 1,
				column: 1,
				offset: -1,
			},
			end: {
				line: 1,
				column: 1,
				offset: -1,
			},
		},
	});
	expect(checkRule).toBe(false);
});

it('it should return false when calling getUpdatedRule', () => {
	const ruleData = inlineConfig.getUpdatedRule('psr/indent', 5);
	expect(ruleData).toBe(false);
});