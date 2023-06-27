import { handleError } from '@extension/util/error-handler';
import { diagnosticProvider } from '@extension/providers/';
import { taqwim } from '@extension/services/taqwim';
import { Range, TextEdit, window, ProgressLocation } from 'vscode';
import type { LintOptions } from '@taqwim/types';
import type {
	DocumentFormattingEditProvider,
	CancellationToken,
	FormattingOptions,
	TextDocument
} from 'vscode';

export class FormattingProvider implements
	DocumentFormattingEditProvider {
	async provideDocumentFormattingEdits(
		document: TextDocument,
		options: FormattingOptions,
		token: CancellationToken
	): Promise<TextEdit[]> {
		const edits: TextEdit[] = [];

		try {
			await window.withProgress({
				title: 'Formatting document ...',
				location: ProgressLocation.Notification,
			}, async (progress) => {
				const { cwd, filePath } = diagnosticProvider;
				const lintOptions: LintOptions = {
					cwd,
					fix: true,
					source: [
						{
							path: filePath,
							content: document.getText(),
						},
					],
				};

				const processData = taqwim.lint(lintOptions);

				if (processData.length === 0) {
					return;
				}

				// Since we have only one file, we can safely assume that the first
				const newSourceCode = processData[0].sourceCode;

				const { lineCount } = document;
				const fullRange = new Range(0, 0, lineCount, 0);

				// Replace the whole document with the new source code
				edits.push(
					new TextEdit(
						fullRange,
						newSourceCode
					)
				);

				diagnosticProvider.refreshDiagnostics();
			});
		} catch (error) {
			handleError(error);
		}
		return edits;
	}
}