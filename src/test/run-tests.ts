import * as path from 'node:path';
import { runTests } from '@vscode/test-electron';
import { getExtensionRoot } from './utils';

const main = async function () {
	try {
		const extensionRoot = getExtensionRoot();

		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(extensionRoot, '.');

		// The path to test runner 
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index.js');

		const workspaceFolder = path.resolve(extensionRoot, 'src', 'test', 'code');

		// Download VS Code, unzip it and run the integration test
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: ['--disable-extensions', workspaceFolder],
			extensionTestsEnv: {
				COVERAGE: 'true',
			},
		});

		console.log('Tests completed successfully');
	} catch (error) {
		console.error('Failed to run tests', error);
		process.exit(1);
	}
};

main();

export default main;
