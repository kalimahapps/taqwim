import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';

const getExtensionRoot = (dir = __dirname) => {
	const packageJsonPath = path.join(dir, 'package.json');

	if (fs.existsSync(packageJsonPath)) {
		return dir;
	}

	const parent = path.dirname(dir);
	if (parent === dir) {
		throw new Error('Unable to find package.json.');
	}

	return getExtensionRoot(parent);
};

const getFileFullPath = (fileName: string): string => {
	const testFile = path.join(getExtensionRoot(), 'src', 'test', fileName);
	return testFile;
};

const wait = function (ms: number) {
	return new Promise((resolve) => {
		return setTimeout(resolve, ms);
	});
};

export {
	getExtensionRoot,
	getFileFullPath,
	wait
};