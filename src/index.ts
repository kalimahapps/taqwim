import { FixLintCommand } from '@extension/commands/fix-lint';
import { logger } from '@extension/services/logger';
import { workspace, languages, window } from 'vscode';
import { FormattingProvider, diagnosticProvider, CodeActionProvider } from '@extension/providers/';
import type { ExtensionContext } from 'vscode';
import { taqwim } from '@extension/services/taqwim';
import { handleError } from '@extension/util/error-handler';
import { WorkspaceListener } from '@extension/workspace-listeners';

/**
 * Entry point for the extension when activated.
 *
 * @param {ExtensionContext} context The extension context.
 */
const activate = async function (context: ExtensionContext) {
	window.showInformationMessage('PHP Taqwim is active');

	try {
		await taqwim.loadConfig(workspace.workspaceFolders?.[0].uri.fsPath);

		// Log that the extension has been activated.
		logger.log('Taqwim extension activated.');

		// Formatting provider.
		const formattingProvider = new FormattingProvider();

		// Workspace listener.
		const workspaceListener = new WorkspaceListener();

		context.subscriptions.push(
			workspaceListener,
			languages.registerCodeActionsProvider(
				{ language: 'php' },
				new CodeActionProvider()
			),
			languages.registerDocumentFormattingEditProvider(
				{ language: 'php' },
				formattingProvider
			),
			new FixLintCommand(),
			diagnosticProvider.diagnosticCollection
		);

		workspaceListener.start(workspace, window);
	} catch (error) {
		handleError(error);
	}
};

export { activate };