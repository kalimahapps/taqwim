import path from 'node:path';
import { workspace } from 'vscode';
import type {
	Disposable,
	window as vsCodeWindow,
	workspace as vsCodeWorkspace,
	TextDocument
} from 'vscode';
import { logger } from '@extension/services/logger';
import { taqwim } from '@extension/services/taqwim';
import { diagnosticProvider } from '@extension/providers/lint-diagnostic-provider';
import { posixPath } from '@extension/util/';

export class WorkspaceListener implements Disposable {
	private subscriptions: Disposable[];
	private trackedDocuments: TextDocument[];

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

				this.onUpdateDebounce(event.document);
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
		this.trackedDocuments.push(document);

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
		this.trackedDocuments = this.trackedDocuments.filter((document_) => {
			const mainDocument = posixPath(document.uri.fsPath);
			const checkAgainst = posixPath(document_.uri.fsPath);
			return mainDocument !== checkAgainst;
		});
	}

	/**
	 * Call onUpdate after a delay.
	 * if Copilot is enabled, it causes a lot of updates to
	 * the document, so we need to debounce
	 *
	 * @param  {TextDocument} document The affected document.
	 * @return {Function}              Arrow function that calls onUpdate
	 */
	onUpdateDebounce(document: TextDocument): () => void {
		let debounceTimer: string | number | NodeJS.Timeout;
		return () => {
			clearTimeout(debounceTimer);
			debounceTimer
				= setTimeout(() => {
					return this.onUpdate(document);
				}, 3000);
		};
	}

	/**
	 * A callback for documents being changed.
	 *
	 * @param {TextDocument} document The affected document.
	 */
	private async onUpdate(document: TextDocument): Promise<void> {
		const documentPath = posixPath(document.uri.fsPath);
		const documentParentPath = posixPath(path.dirname(document.uri.fsPath));
		const configPath = posixPath(workspace.workspaceFolders?.[0].uri.fsPath);

		const fileName = path.basename(documentPath);
		const configFileNames = ['.taqwim.json', 'taqwim.config.js'];

		// If the document is a config file, reload the config
		if (configFileNames.includes(fileName) && documentParentPath === configPath) {
			await taqwim.loadConfig(configPath);

			// Refresh diagnostics for all tracked documents
			this.trackedDocuments.forEach((document_) => {
				diagnosticProvider.update(document_);
			});
			return;
		}

		if (!this.isTrackedDocument(document)) {
			return;
		}
		diagnosticProvider.update(document);
	}

	/**
	 * Check if the given document is being tracked
	 *
	 * @param  {TextDocument} document The affected document.
	 * @return {boolean}               True if the document is being tracked
	 */
	isTrackedDocument(document: TextDocument): boolean {
		return this.trackedDocuments.some((document_) => {
			const mainDocument = posixPath(document.uri.fsPath);
			const checkAgainst = posixPath(document_.uri.fsPath);
			return mainDocument === checkAgainst;
		});
	}
}