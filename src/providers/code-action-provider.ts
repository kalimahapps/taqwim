import { posixPath } from '@extension/util';
import type {
	CodeActionProvider as BaseProvider,
	TextDocument,
	Selection,
	Range,
	CodeAction
} from 'vscode';
import { CodeActionKind } from 'vscode';
import config from '@extension/config';
import { diagnosticProvider } from '@extension/providers/';

/**
 * Provides code actions corresponding to diagnostic problems.
 */
export class CodeActionProvider implements BaseProvider<CodeAction> {
	public static readonly providedCodeActionKinds = [CodeActionKind.QuickFix];

	provideCodeActions(
		document: TextDocument,
		range: Range | Selection
	): CodeAction[] {
		const path = posixPath(document.uri.fsPath);
		const documentActions = diagnosticProvider.codeActionCollection[path];
		if (!documentActions || documentActions.length === 0) {
			return [];
		}

		// Get all the actions for the given range
		const actions = documentActions
			.filter((action) => {
				const { diagnostics } = action;
				const [diagnostic] = diagnostics;

				return diagnostic.source === config.namespace
					&& diagnostic.range.start.line === range.start.line
					&& diagnostic.range.end.line === range.end.line
					&& diagnostic.range.start.character === range.start.character
					&& diagnostic.range.end.character === range.end.character;
			});

		return actions;
	}
}