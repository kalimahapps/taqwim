import * as path from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { join as joinPath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import Fixer from '@taqwim/fixer';
import Taqwim from '@taqwim/index';
import { findAhead, getBaseDirectory } from '@taqwim/utils';
import { WithCallMapping } from '@taqwim/decorators';
import Traverse from '@taqwim/traverse';
import type { AstNode, LintOptions, Loc } from '@taqwim/types';

const testDirectory = fileURLToPath(new URL('.', import.meta.url));

type CallbacksMap = {
	[key: string]: string[];
};

test('Taqwim should throws a syntax error', async () => {
	const content = `<?php
		$foo 'bar';
		$bar = 'baz'
		$baz = 'foo';
	`;
	const taqwim = new Taqwim();
	await taqwim.loadConfig();
	const lintOptions = {
		fix: true,
		source: [
			{
				content,
			},
		],
	};

	expect(() => {
		taqwim.lint(lintOptions);
	}).toThrow('Error : syntax error, unexpected');
});

test('Fixer returns the same source code if location data is not complete', () => {
	const sourceCode = '<?php echo "Hello World";';

	const locData = {
		wrongKey: false,
	};

	const fixer = new Fixer(sourceCode);

	// @ts-ignore - LocData is intentionally incomplete
	const fixedWithBefore = fixer.before(locData, 'foo');

	// @ts-ignore - LocData is intentionally incomplete
	const fixedWithAfter = fixer.after(locData, 'foo');

	// @ts-ignore - LocData is intentionally incomplete
	const fixedWithReplace = fixer.replaceRange(locData, 'foo');

	expect(fixedWithBefore).toBe(sourceCode);
	expect(fixedWithAfter).toBe(sourceCode);
	expect(fixedWithReplace).toBe(sourceCode);
});

test('Process AST with line and column number', async () => {
	const filePath = path.posix.join(testDirectory, 'rules', 'method.complexity', 'incorrect-1.php');

	if (!existsSync(filePath)) {
		throw new Error('Test file not found');
	}

	const lintOptions = {
		source: [{ path: filePath }],
		line: '1,10,50',
		column: '5,10',
	};

	const taqwim = new Taqwim();
	await taqwim.loadConfig();
	const lintResult = taqwim.lint(lintOptions);

	expect(lintResult[0].reports.length).toBe(1);
});

test('Should process plainText successfully', async () => {
	const taqwim = new Taqwim();
	await taqwim.loadConfig();
	const lintOptions = {
		source: [{ content: '<?php IF(true){echo "Hello!!"; }?>' }],
	};

	const lintResult = taqwim.lint(lintOptions);

	expect(lintResult[0].reports.length).toBe(6);
});

test('Should throw source not found error', async () => {
	const taqwim = new Taqwim();
	await taqwim.loadConfig();
	const lintOptions = {} as LintOptions;

	expect(() => {
		taqwim.lint(lintOptions);
	}).toThrow('No source provided');
});

test('Override rule options using a config file', async () => {
	const filePath = path.posix.join(testDirectory, 'rules', 'method.complexity', 'incorrect-1.php');
	if (!existsSync(filePath)) {
		throw new Error('Test file not found');
	}
	const lintOptions = {
		source: [{ path: filePath }],
	};

	const taqwim = new Taqwim();
	await taqwim.loadConfig(testDirectory, 'taqwim.test.json');

	const lintResult = taqwim.lint(lintOptions);
	expect(lintResult.length).toBe(1);

	// Try with js file
	const taqwimWithJS = new Taqwim();
	await taqwimWithJS.loadConfig(testDirectory, 'taqwim.test.js');

	const lintResultWithJS = taqwimWithJS.lint(lintOptions);
	expect(lintResultWithJS.length).toBe(1);
});

test('findAhead returns false if the needle is not found', () => {
	const lines = ['foo', 'bar', 'baz'];
	const nodeLoc = {
		start: {
			line: 1,
			column: 1,
			offset: 0,
		},
		end: {
			line: 1,
			column: 3,
			offset: 2,
		},
	};
	const needle = 'qux';

	const result = findAhead(lines, nodeLoc, needle);

	expect(result).toBe(false);
});

test('callbackMap decorator', () => {
	// Test callback property is not defined
	class Test {
		node: any;

		@WithCallMapping
		public process() {
			this.node = {
				foo: 'bar',
			};
		}
	}

	expect(() => {
		const test = new Test();
		test.process();
	}).toThrow('callbacksMap property is not defined');

	// Test callback property is empty
	class Test2 {
		node: any;

		callbacksMap: CallbacksMap = {};

		@WithCallMapping
		public process() {
			this.node = {
				kind: 'testing',
			};
		}
	}

	expect(() => {
		const test = new Test2();
		test.process();
	}).toThrow('callbacksMap property is empty');

	// Test callback property does not have a callback for the node kind
	class Test3 {
		node: any;

		callbacksMap: CallbacksMap = {
			foo: ['bar'],
		};

		@WithCallMapping
		public process() {
			this.node = {
				kind: 'testing',
			};
		}
	}

	expect(() => {
		const test = new Test3();
		test.process();
	}).toThrow('callbacksMap does not have a callback for `testing` kind in Test3 class');

	// Test callback property does not have a callback for the node kind
	class Test4 {
		node: any;

		callbacksMap: CallbacksMap = {
			foo: ['testing'],
		};

		@WithCallMapping
		public process() {
			this.node = {
				kind: 'testing',
			};
		}
	}

	expect(() => {
		const test = new Test4();
		test.process();
	}).toThrow('Test4 class does not have a `foo` method');

	// Test node does not exist
	class Test5 {
		@WithCallMapping
		public process() {
			// nothing here
		}
	}

	expect(() => {
		const test = new Test5();
		test.process();
	}).toThrow('node property is not defined');
});

test('Traverse location change', () => {
	const traverse = new Traverse();
	const location = {};

	expect(traverse.changeLineToZeroBased(location as Loc)).toBe(location);
});

test('Traverse leading and trailing comments are always an array', () => {
	const traverse = new Traverse();

	const node = {
		leadingComments: [],
		trailingComments: undefined,
	};
	const results = traverse.updateNodes(node as unknown as AstNode, 'testing');
	expect(results.leadingComments).toEqual([]);
	expect(results.trailingComments).toEqual([]);
});

test("Cli version should be the same as the extension's version", () => {
	// Get taqwim directory and read package.json
	const taqwimDirectory = getBaseDirectory(testDirectory);
	const packageJson = readFileSync(joinPath(taqwimDirectory, 'package.json'), 'utf8');
	const { version } = JSON.parse(packageJson);

	// Get extension directory and read package.json
	const extensionDirectory = getBaseDirectory(path.join(taqwimDirectory, '..'));
	const cliPackageJson = readFileSync(path.join(extensionDirectory, 'package.json'), 'utf8');
	const { version: cliVersion } = JSON.parse(cliPackageJson);

	// Compare versions
	expect(version, 'Version mismatch between cli and extension').toBe(cliVersion);
});