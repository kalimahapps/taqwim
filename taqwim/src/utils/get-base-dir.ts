import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';

/**
 * Helper method to get the base directory of a project
 *
 * @param  {string} directory The directory to start searching from
 * @return {string}           The base directory
 */
const getBaseDirectory = (directory: string): string => {
	const packageJsonPath = join(directory, 'package.json');

	if (existsSync(packageJsonPath)) {
		return directory;
	}

	const parent = dirname(directory);
	if (parent === directory) {
		throw new Error('Unable to find package.json.');
	}

	return getBaseDirectory(parent);
};

export {
	getBaseDirectory
};