import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import cliOptions from '@taqwim/cli/options';

export default yargs(hideBin(process.argv))
	.help(false)
	.version(false)
	.options(cliOptions)
	.parseSync();