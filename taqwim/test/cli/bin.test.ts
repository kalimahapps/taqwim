import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';

import { fileURLToPath } from 'node:url';
import { expect, test, vi, beforeEach } from 'vitest';

const { spyOn, resetModules } = vi;

const testDirectory = fileURLToPath(new URL('..', import.meta.url)).replaceAll('\\', '/');
const sourcePath = `${testDirectory}/inline-config/source.php`;

/**
 * Programmatically set arguments and execute the CLI script
 * Arguments to be set
 *
 * @param {...string[]} processArguments Arguments to be set
 */
const runCommand = async function (...processArguments: string[]) {
	process.argv = [
		'node',
		'bin.js',
		...processArguments,
	];

	const Bin = await import('@taqwim/cli/bin');

	new Bin.default();
};

beforeEach(() => {
	resetModules();
});

test('Version is displaying correctly', async () => {
	const consoleSpy = spyOn(console, 'log');
	const packageInfo = readFileSync(`${testDirectory}/../package.json`, 'utf8');
	const { version: packageVersion } = JSON.parse(packageInfo);

	await runCommand('-v');

	expect(consoleSpy).toHaveBeenCalledWith(packageVersion);
});

test('Help is displaying correctly', async () => {
	const consoleSpy = spyOn(console, 'log');

	await runCommand('-h');

	expect(consoleSpy).toHaveBeenCalledWith(
		expect.stringContaining('======== Taqwim Cli Options ========')
	);
});

test('Path is set correctly', async () => {
	const consoleSpy = spyOn(console, 'log');

	await runCommand('-p', sourcePath);

	expect(consoleSpy).toHaveBeenCalledWith(
		expect.stringContaining('🎉🎉 No errors 🎉🎉')
	);
});

test('Throw error if mixing files and directories in path argument', async () => {
	expect(async () => {
		await runCommand('-p', `${sourcePath},${testDirectory}/inline-config`);
	}).rejects.toThrow('Mixing files and directories is not allowed in path argument');
});

test("Report style to 'none' is working correctly", async () => {
	const consoleSpy = spyOn(console, 'log');
	const path = `${testDirectory}/rules/array.comma-dangle/incorrect-1.php`;
	await runCommand('-p', path, '--report-style', 'none');

	// No output
	expect(consoleSpy).not.toHaveBeenCalled();
});

test('Throw error if report style is set but report file is not set', async () => {
	// expect(async () => {
	const consoleSpy = spyOn(console, 'log');

	await runCommand('-p', sourcePath, '--report-style', 'json');

	expect(consoleSpy).toHaveBeenCalledWith(
		expect.stringContaining('\n\n--------- An error has occurred ---------')
	);

	expect(consoleSpy).toHaveBeenCalledWith(
		expect.stringContaining('Report file is required when using json report style')
	);
});

test("Report style to 'json' is working correctly", async () => {
	// const consoleSpy = spyOn(console, 'log');
	const path = `${testDirectory}/rules/array.comma-dangle/incorrect-1.php`;

	const reportFile = `${testDirectory}/cli/report.json`;
	await runCommand('-p', path, '--report-style', 'json', '--report-file', reportFile);

	// Check if the report file exists
	expect(readFileSync(reportFile, 'utf8')).toBeTruthy();

	// Read the report file
	const report = JSON.parse(readFileSync(reportFile, 'utf8'));

	// Check if the report is correct
	expect(report[0].reports.length).toBe(18);

	// Remove the file
	unlinkSync(reportFile);
});

test('Write report to file is working correctly', async () => {
	const path = `${testDirectory}/rules/array.comma-dangle/incorrect-1.php`;
	const reportFile = `${testDirectory}/report.txt`;
	await runCommand('-p', path, '--report-file', reportFile);

	// Check if the report file exists
	expect(readFileSync(reportFile, 'utf8')).toBeTruthy();

	// Remove report file
	unlinkSync(reportFile);
});

test('Group rules is working correctly', async () => {
	const consoleSpy = spyOn(console, 'log');
	const path = `${testDirectory}/rules/brace-style/incorrect-1.php`;
	await runCommand('-p', path, '--group-rules');

	expect(consoleSpy).toHaveBeenCalledWith(
		expect.stringContaining('- psr/brace-style')
	);
});

test('Show column and rule name is working correctly', async () => {
	const consoleSpy = spyOn(console, 'log');
	const path = `${testDirectory}/rules/brace-style/incorrect-1.php`;
	await runCommand('-p', path, '--vv');

	expect(consoleSpy).toHaveBeenCalledWith(
		expect.stringContaining('2:22 | warning | Opening brace must be on a line by itself (psr/brace-style)')
	);
});

test('Show summary is working correctly', async () => {
	const consoleSpy = spyOn(console, 'log');
	const path = `${testDirectory}/rules/brace-style/incorrect-1.php`;
	await runCommand('-p', path, '--summary');

	expect(consoleSpy).toHaveBeenCalledWith(
		expect.stringContaining('Found 0 errors and 51 warnings')
	);
});

test("Shows syntax error if the file can't be parsed", async () => {
	const consoleSpy = spyOn(console, 'log');
	const path = `${testDirectory}/cli/syntax-error.php`;
	await runCommand('-p', path);

	expect(consoleSpy).toHaveBeenCalledWith(
		expect.stringContaining('\n\n----------------- Exception (SyntaxError) -------------------')
	);

	// @todo: Check log messages agains the expected messages
	expect(consoleSpy).toBeCalledTimes(3);
});

test('Fixing the file is working correctly', async () => {
	const consoleSpy = spyOn(console, 'log');
	const path = `${testDirectory}/cli/fix.php`;

	const fileContent = readFileSync(path, 'utf8');

	await runCommand('-p', path, '--fix');

	expect(consoleSpy).toHaveBeenCalledWith(
		expect.stringContaining('FOUND 1 issues')
	);

	expect(consoleSpy).toHaveBeenCalledWith(
		expect.stringContaining('3 | warning | Use long syntax for arrays')
	);

	// Reset the file content
	writeFileSync(path, fileContent);
});

test('Throws rule option error if the rule option is not correct', async () => {
	const consoleSpy = spyOn(console, 'log');
	const path = `${testDirectory}/cli/rule-error.php`;

	await runCommand('-p', path);

	expect(consoleSpy).toHaveBeenCalledWith(
		expect.stringContaining('Limit must be a number.'),
		expect.stringContaining('\nRule: taqwim/max-lines'),
		expect.stringContaining('\nOption: file'),
		expect.stringContaining('\nValue: 5')
	);
});