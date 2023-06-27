import Bin from '@taqwim/cli/bin';
import chalk from 'chalk';

try {
	console.time('taqwim-cli');
	new Bin();
	console.timeEnd('taqwim-cli');
} catch (error: unknown) {
	console.log(chalk.red('\n\n---- An error has occurred ---'));
	if (error instanceof Error) {
		console.log(chalk.red(error.message), '\n\n');
	} else {
		console.log(error);
	}
}
