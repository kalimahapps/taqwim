import { pathToFileURL } from 'node:url';
import * as fs from 'node:fs';
import * as path from 'node:path';

import DefaultConfig from '@taqwim/default-config.js';
import type { TaqwimConfig } from '@taqwim/types';

/**
 * Load the config file from the current working directory
 * Config file can be either .taqwim.json or .taqwim.js.
 * Merge with the default config
 *
 * @param  {string} directory      Directory to load the config from
 * @param  {string} configFileName Config file name. If supplied, it will be
 *                                 used instead of the default config file names
 * @return {object}                The config object
 */
const loadConfig = async (directory: string, configFileName?: string): Promise<TaqwimConfig> => {
	// Load config in this order .json, .js
	const files = ['.taqwim.json', 'taqwim.config.js'];

	// If custom config file name is supplied, add to the 
	// beginning of the array so it will be loaded first (if exists)
	if (configFileName) {
		files.unshift(configFileName);
	}

	let customConfig = {};

	for (const file of files) {
		const configPath = path.posix.join(directory, file);

		if (!fs.existsSync(configPath)) {
			continue;
		}

		if (file.endsWith('.js')) {
			const fileContent = await import(/**@vite-ignore */ pathToFileURL(configPath).href);
			customConfig = fileContent.default;
			break;
		}

		const readFile = fs.readFileSync(configPath).toString();

		customConfig = JSON.parse(readFile);
	}

	// Deep merge with the default config
	const finalConfig = {
		...DefaultConfig,
		...customConfig,
	};

	const { runs, presets } = finalConfig;

	// Make sure runs is between 1 and 10
	finalConfig.runs = Math.max(1, Math.min(10, runs));

	// Make sure the presets are lowercase for easier comparison
	finalConfig.presets = presets.map((preset: string) => {
		return preset.toLowerCase();
	});

	return finalConfig;
};

export {
	loadConfig
};