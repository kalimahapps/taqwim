/* eslint complexity: ["warn", 7] */
import { posixPath } from '@extension/util';
import {
	Range,
	Diagnostic,
	DiagnosticSeverity,
	CodeActionKind,
	CodeAction,
	languages,
	Uri
} from 'vscode';
import config from '@extension/config';
import { FixLintCommand } from '@extension/commands/fix-lint';
import { logger } from '@extension/services/logger';
import { taqwim } from '@extension/services/taqwim';
import type { DiagnosticCollection, TextDocument } from 'vscode';
import type { CodeActionCollection } from '@extension/types/code-action';
import type { LintOptions } from '@taqwim/types';
export class DiagnosticProvider {
	private static instance: DiagnosticProvider;

	/**
	 * The report data for the current document.
	 */
	reportData: any = [];

	/**
	 * The current working directory.
	 */
	cwd = '';

	/**
	 * The diagnostic collection instance.
	 */
	diagnosticCollection: DiagnosticCollection;

	/**
	 * Code action collection instance.
	 */
	codeActionCollection: CodeActionCollection;

	/**
	 * The current document.
	 */
	document: TextDocument;

	/**
	 * The code actions for the current document.
	 */
	documentCodeActions: CodeAction[] = [];

	/**
	 * The file path for the current document.
	 */
	filePath: string;

	/**
	 * Constructor function
	 *
	 * @param {DiagnosticCollection} diagnosticCollection The diagnostic collection.
	 * @param {CodeActionCollection} codeActionCollection The code action collection.
	 */
	constructor(
		diagnosticCollection: DiagnosticCollection,
		codeActionCollection: CodeActionCollection
	) {
		if (DiagnosticProvider.instance) {
			throw new Error('This class is a singleton. Use getInstance() instead.');
		}

		this.codeActionCollection = codeActionCollection;
		this.diagnosticCollection = diagnosticCollection;
	}

	/**
	 * Gets the singleton instance.
	 *
	 * @return {DiagnosticProvider} The singleton instance.
	 */
	static getInstance(): DiagnosticProvider {
		const diagnosticCollection = languages.createDiagnosticCollection('taqwim');
		const codeActionCollection: CodeActionCollection = {};
		const providerInstance = new DiagnosticProvider(diagnosticCollection, codeActionCollection);
		const instance = DiagnosticProvider.instance || providerInstance;
		this.instance = instance;
		return instance;
	}

	/**
	 * Helper function to set the diagnostic collection.
	 *
	 * @param  {DiagnosticCollection} diagnosticCollection The diagnostic collection.
	 * @return {DiagnosticProvider}                        The diagnostic provider instance.
	 */
	setDiagnosticCollection(diagnosticCollection: DiagnosticCollection): DiagnosticProvider {
		this.diagnosticCollection = diagnosticCollection;
		return this;
	}

	/**
	 * Helper function to set the code action collection.
	 *
	 * @param  {CodeActionCollection} codeActionCollection The code action collection.
	 * @return {DiagnosticProvider}                        The diagnostic provider instance.
	 */
	setCodeActionCollection(codeActionCollection: CodeActionCollection): DiagnosticProvider {
		this.codeActionCollection = codeActionCollection;
		return this;
	}

	/**
	 * Update the diagnostics for the given document.
	 *
	 * @param {TextDocument} document The document to update.
	 */
	update(document: TextDocument) {
		this.document = document;

		// Update PHP files only
		if (document.languageId !== 'php') {
			return;
		}

		this.filePath = posixPath(document.uri.fsPath).replace(this.cwd, '');

		const lintOptions: LintOptions = {
			cwd: this.cwd,
			source: [
				{
					path: this.filePath,
					content: document.getText(),
				},
			],
		};

		const reportData = taqwim.lint(lintOptions);

		if (reportData.length === 0) {
			this.diagnosticCollection.clear();
			return;
		}

		this.reportData = reportData[0].reports;

		this.refreshDiagnostics();
	}

	/**
	 * Create a diagnostic from the report data.
	 *
	 * @param  {any}        reportData The report data.
	 * @return {Diagnostic}            The created diagnostic.
	 */
	createDiagnostic = function (
		reportData: any
	): Diagnostic {
		const { position, message, severity, ruleName } = reportData;
		const { start, end } = position;

		if (start.line < 0 || start.column < 0 || end.line < 0 || end.column < 0) {
			logger.log('Taqwim: Invalid position', reportData);
		}
		const range = new Range(start.line, start.column, end.line, end.column);

		const { debug } = taqwim.taqwimConfig;

		let diagnosticMessage = message;
		if (debug) {
			diagnosticMessage += ` (L${start.line}:C${start.column})`;
		}

		const diagnostic = new Diagnostic(
			range,
			diagnosticMessage,
			severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning
		);

		diagnostic.code = {
			value: ruleName,
			target: Uri.parse(`${config.rulesDocsUrl}${ruleName}.html`),
		};
		diagnostic.source = config.namespace;

		return diagnostic;
	};

	/**
	 * Create a code action for a single line.
	 *
	 * @param {Diagnostic} diagnostic The diagnostic to create the action for.
	 */
	private createSingleLineCommandAction(diagnostic: Diagnostic) {
		if (typeof diagnostic.code !== 'object') {
			return;
		}

		const action = new CodeAction(`Fix ${diagnostic.code.value} for this line`, CodeActionKind.QuickFix);

		action.command = {
			title: 'Fix a linting error for a single line',
			command: FixLintCommand.command,
			arguments: [
				this.document,
				{
					ruleName: diagnostic.code.value,
					line: diagnostic.range.start.line,
				},
			],
		};

		action.diagnostics = [diagnostic];
		this.documentCodeActions.push(action);
	}

	/**
	 * Create a code action for the entire document.
	 *
	 * @param {Diagnostic} diagnostic The diagnostic to create the action for.
	 */
	private createFullDocumentCommandAction(diagnostic: Diagnostic) {
		if (typeof diagnostic.code !== 'object') {
			return;
		}
		const action = new CodeAction(`Fix ${diagnostic.code.value} for the entire document`, CodeActionKind.QuickFix);

		action.command = {
			title: 'Fix a linting error for the whole document',
			command: FixLintCommand.command,
			arguments: [
				this.document,
				{
					ruleName: diagnostic.code.value,
				},
			],
		};

		action.diagnostics = [diagnostic];
		action.isPreferred = true;
		this.documentCodeActions.push(action);
	}

	/**
	 * Clear old diagnostics and create new ones.
	 */
	refreshDiagnostics = (): void => {
		const { uri } = this.document;

		if (!this.diagnosticCollection) {
			return;
		}

		// Clear diagnostics and actions
		this.diagnosticCollection.clear();
		this.documentCodeActions = [];

		const diagnostics: Diagnostic[] = [];
		for (const report of this.reportData) {
			const diagnostic = this.createDiagnostic(report);
			diagnostics.push(diagnostic);
			if (report.hasFix) {
				this.createSingleLineCommandAction(diagnostic);
				this.createFullDocumentCommandAction(diagnostic);
			}
		}

		this.diagnosticCollection.set(uri, diagnostics);

		const path = posixPath(uri.fsPath);
		this.codeActionCollection[path] = this.documentCodeActions;

		logger.log('Diagnostics updated');
	};
}

export const diagnosticProvider = DiagnosticProvider.getInstance();