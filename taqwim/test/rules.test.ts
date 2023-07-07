import { fileURLToPath } from 'node:url';
import TestFolder from '@taqwim-test/utils/test-folder.js';
import TestFixer from './utils/test-fixer';

// Rules folder test
const rulesFolderPath = fileURLToPath(new URL('../src/rules', import.meta.url)).replaceAll('\\', '/');
const rulesTestFolderPath = fileURLToPath(new URL('rules', import.meta.url)).replaceAll('\\', '/');
await new TestFolder(rulesFolderPath, rulesTestFolderPath).start();
await new TestFixer(rulesFolderPath, rulesTestFolderPath).start();

// Plugins folder test
const pluginsFolderPath = fileURLToPath(new URL('../src/plugins', import.meta.url)).replaceAll('\\', '/');
const pluginsTestFolderPath = fileURLToPath(new URL('plugins', import.meta.url)).replaceAll('\\', '/');

await new TestFolder(pluginsFolderPath, pluginsTestFolderPath).start();
await new TestFixer(pluginsFolderPath, pluginsTestFolderPath).start();