import * as path from 'node:path';
import Jasmine from 'jasmine';
import { globSync } from 'glob';

const run = function (): Promise<void> {
	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((resolve, reject) => {
		const files = globSync('**/**.test.js', {
			cwd: testsRoot,
			absolute: true,
		});

		const jasmine = new Jasmine();
		jasmine.exitOnCompletion = false;
		jasmine.loadConfig({
			random: false,
		});

		jasmine.execute(files).then((passed) => {
			if (passed) {
				return resolve();
			}
			return reject(new Error('Tests failed.'));
		})
			.catch((error) => {
				console.error(error);
				reject(error);
			});
	});
};

export { run };