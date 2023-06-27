import { logger } from '@extension/services/logger';
import { window } from 'vscode';
import type { ParserSyntaxError } from '@taqwim/types';

/**
 * Handle error by showing a message and logging it.
 * Also, add a button to open the output channel.
 *
 * @param {Error} error The error to handle.
 */
const handleError = async (error: Error) => {
	const choice = await window.showErrorMessage(
		error.message,
		'Open Output Channel'
	);

	if (choice === 'Open Output Channel') {
		logger.getOutputChannel().show();
	}

	if (error instanceof SyntaxError) {
		// Add parser syntax type error
		const errorData = error as ParserSyntaxError;

		logger.log(`\n\n----------------- Exception (${errorData.name}) -------------------`);
		logger.log('\n>> Start Excerpt <<\n', errorData.excerpt, '\n>> End Excerpt <<\n');
		logger.log(error.stack, '\n\n');
		return;
	}

	// Log the rest types
	console.log(error);
	logger.logError(error.message, error);
};

export { handleError };