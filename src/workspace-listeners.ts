import type {
	Disposable,
	window as vsCodeWindow,
	workspace as vsCodeWorkspace,
	TextDocument
} from 'vscode';
import { logger } from '@extension/services/logger';
import { diagnosticProvider } from './providers/lint-diagnostic-provider';
export class WorkspaceListener implements Disposable {
	private subscriptions: Disposable[];
	private readonly trackedDocuments: any[];

	constructor() {
		this.subscriptions = [];
		this.trackedDocuments = [];
	}

	/**
	 * Disposes of the class' resources.
	 */
	public dispose(): void {
		for (const sub of this.subscriptions) {
			sub.dispose();
		}

		logger.dispose();
		this.subscriptions.splice(0, this.subscriptions.length);
	}

	/**
	 * Starts listening to events.
	 *
	 * @param {workspace} workspace The VS Code workspace to start listening on.
	 * @param {window}    window    The VS Code window.
	 */
	public start(
		workspace: typeof vsCodeWorkspace,
		window: typeof vsCodeWindow
	): void {
		this.subscriptions.push(
			workspace.onDidOpenTextDocument((event) => {
				return this.onOpen(event);
			}),

			workspace.onDidCloseTextDocument((event) => {
				return this.onClose(event);
			}),

			workspace.onDidChangeTextDocument((event) => {
				if (event.contentChanges.length === 0) {
					return;
				}

				this.onUpdate(event.document);
			}),

			workspace.onDidSaveTextDocument((event) => {
				this.onUpdate(event);
			})
		);

		// Make sure that the current editor is considered open.
		if (window.activeTextEditor) {
			this.onOpen(window.activeTextEditor.document);
		}
	}

	/**
	 * A callback for documents being opened.
	 *
	 * @param {TextDocument} document The affected document.
	 */
	private onOpen(document: TextDocument): void {
		// We only care about files with schemes we are able to handle.
		switch (document.uri.scheme) {
			case 'file':
			case 'untitled': {
				break;
			}

			default: {
				return;
			}
		}

		// We only care about PHP documents.
		if (document.languageId !== 'php') {
			return;
		}

		// Mark that we should be tracking the document.
		this.trackedDocuments.push(document.uri);

		// Trigger an update so that the document will gather diagnostics.
		this.onUpdate(document);
	}

	/**
	 * A callback for documents being closed.
	 *
	 * @param {TextDocument} document The affected document.
	 */
	private onClose(document: TextDocument): void {
		// remove document from tracked documents
		this.trackedDocuments.splice(this.trackedDocuments.indexOf(document.uri), 1);
	}

	/**
	 * A callback for documents being changed.
	 *
	 * @param {TextDocument} document The affected document.
	 */
	private onUpdate(document: TextDocument): void {
		if (!this.trackedDocuments.includes(document.uri)) {
			return;
		}
		diagnosticProvider.update(document);
	}
}