import * as assert from 'node:assert';
import * as fs from 'node:fs';
import { posixPath } from '@extension/util';
import * as vscode from 'vscode';
import { diagnosticProvider } from '@extension/providers/lint-diagnostic-provider';
import { logger } from '@extension/services/logger';
import { CodeActionProvider } from '@extension/providers';
import { getFileFullPath, wait } from '@extension/test/utils';
import { taqwim } from '@extension/services/taqwim';

// eslint-disable-next-line max-lines-per-function
describe('Extension Test Suite', function () {
	vscode.window.showInformationMessage('Start all tests.');

	it('Should be able to log various types of data', () => {
		// Log object
		logger.log({ hello: 'world' });

		// Log string
		logger.log('Hello World!');

		// Log number
		logger.log(123);

		// Log boolean
		logger.log(true);

		// Log array
		logger.log([1, 2, 3]);

		// Log undefined
		logger.log();

		// Log errors
		logger.logError('Hello World!');
		logger.logError({ hello: 'world' });

		// No assertion, just make sure it doesn't throw
		assert.ok(true);
	});

	it('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('KalimahApps.taqwim'));
	});

	it('should activate', async function () {
		// activate() function will resolve when the extension is activated.
		await vscode.extensions.getExtension('KalimahApps.taqwim').activate();
		assert.ok(true);
	});

	it('should get diagnostics', async function () {
		await taqwim.loadConfig();
		const uri = vscode.Uri.file(getFileFullPath('code/file.php'));
		await vscode.workspace.openTextDocument(uri);

		// no need to call update, openTextDocument will trigger it
		const diagnostics = vscode.languages.getDiagnostics(uri);

		// Wait for diagnostics to be ready (otherwise the test will fail)
		await wait(1500);

		assert.strictEqual(diagnostics.length, 3);
	});

	it('Should save the document with the correct formatting', async () => {
		const temporaryFileUri = vscode.Uri.file(getFileFullPath('code/temp.php'));
		const unformattedUri = vscode.Uri.file(getFileFullPath('code/unformatted.php'));

		// Open a file
		const temporaryDocument = await vscode.workspace.openTextDocument(temporaryFileUri);
		const unformattedDocument = await vscode.workspace.openTextDocument(unformattedUri);

		// Show files
		await vscode.window.showTextDocument(unformattedDocument);
		await vscode.window.showTextDocument(temporaryDocument, vscode.ViewColumn.Beside);

		// Copy the contents of the unformatted document to the temp document
		vscode.workspace.fs.writeFile(
			temporaryFileUri,
			new Uint8Array(Buffer.from(unformattedDocument.getText()))
		);

		// format on save
		await vscode.commands.executeCommand('workbench.action.files.save');

		// Get formatted document contents
		const foramttedPath = getFileFullPath('code/formatted.php');
		const formattedDocument = fs.readFileSync(foramttedPath, 'utf8');

		assert.strictEqual(temporaryDocument.getText(), formattedDocument);

		// close documents
		await vscode.commands.executeCommand('workbench.action.closeActiveEditor', temporaryDocument);
		await vscode.commands.executeCommand('workbench.action.closeActiveEditor', unformattedDocument);

		// Remove content causes an issue with the test.
		// @todo Fix this
		// vscode.workspace.fs.writeFile(temporaryFileUri, new Uint8Array(Buffer.from('')));
	});

	it('Code actions should be available', async () => {
		vscode.languages.registerCodeActionsProvider(
			{ language: 'php' },
			new CodeActionProvider()
		);

		const uri = vscode.Uri.file(getFileFullPath('code/unformatted.php'));

		// Open a file
		const document = await vscode.workspace.openTextDocument(uri);
		vscode.window.showTextDocument(document);
		await taqwim.loadConfig();
		diagnosticProvider.update(document);

		// Get codeactioncollection
		const { codeActionCollection } = diagnosticProvider;

		const path = posixPath(document.uri.fsPath);

		const documentActions = codeActionCollection[path];
		assert.strictEqual(documentActions.length, 14);

		// Close the document
		await vscode.commands.executeCommand('workbench.action.closeActiveEditor', document);

		// Test with formatted document
		const formattedUri = vscode.Uri.file(getFileFullPath('code/formatted.php'));
		const formattedDocument = await vscode.workspace.openTextDocument(formattedUri);
		vscode.window.showTextDocument(formattedDocument);

		// Update the diagnostic provider to get the code actions
		diagnosticProvider.update(formattedDocument);

		const foramttedDocumentPath = posixPath(formattedDocument.uri.fsPath);
		const formattedDocumentActions = codeActionCollection[foramttedDocumentPath];

		assert.strictEqual(formattedDocumentActions.length, 0);
		await vscode.commands.executeCommand('workbench.action.closeActiveEditor', formattedDocument);
	});
});
