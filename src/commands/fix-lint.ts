import type { TextDocument } from 'vscode';
import {
	Range,
	commands,
	WorkspaceEdit,
	workspace,
	window,
	ProgressLocation
} from 'vscode';
import { taqwim } from '@extension/services/taqwim';
import type { LintOptions } from '@taqwim/types';
import { logger } from '@extension/services/logger';

type LintData = {
	cwd: string;
	filePath: string;
	ruleName: string;
	line: number;
};

class FixLintCommand {
	/**
	 * Command name
	 */
	public static command = 'taqwim.fix';

	/**
	 * Constructor function
	 */
	constructor() {
		commands.registerCommand(FixLintCommand.command, this.commandHandler.bind(this));
	}

	dispose() {
		// Empty
	}

	/**
	 * Command handler
	 *
	 * @param  {TextDocument}     document The document to fix.
	 * @param  {LintData}         lintData Lint information, such as path, cwd, rule name, etc.
	 * @return {string|undefined}          The updated source code, if any.
	 */
	public commandHandler(document: TextDocument, lintData: LintData): string | undefined {
		let updatedSourceCode: string;

		try {
			window.withProgress({
				title: 'Fixing errors ...',
				location: ProgressLocation.Notification,
			}, async (progress) => {
				const lintOptions: LintOptions = {
					source: [{ content: document.getText() }],
					rule: lintData.ruleName,
					fix: true,
				};

				if (lintData.line !== undefined) {
					lintOptions.line = `${lintData.line}`;
				}

				const processData = taqwim.lint(lintOptions);

				updatedSourceCode = processData[0].sourceCode;
				const { lineCount, uri } = document;

				const fullRange = new Range(0, 0, lineCount, 0);
				const edit = new WorkspaceEdit();

				edit.replace(uri, fullRange, updatedSourceCode);
				await workspace.applyEdit(edit);
			});
		} catch (error) {
			logger.logError('Error occurred while formatting', error);
			window.showErrorMessage('Taqwim: Error parsing report', error.message);
		}
		return updatedSourceCode;
	}
}

export { FixLintCommand };