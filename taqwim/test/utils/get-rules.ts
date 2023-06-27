import { globSync } from 'glob';

const getRules = function (glob = '**/*.ts') {
	return globSync(glob, {
		absolute: false,
		ignore: ['**/index.ts'],
		cwd: 'src/rules',
	});
};

export {
	getRules
};