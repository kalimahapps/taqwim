/*eslint max-lines-per-function: ["warn", 120], complexity: ["warn", 9]*/
import fs from 'node:fs';
import InlineConfig from '@taqwim/inline-config.js';
import { parseFile, parseString, parseFileContent } from '@taqwim/parser.js';
import Fixer from '@taqwim/fixer.js';
import Traverse from '@taqwim/traverse.js';
import { walk } from '@taqwim/walker.js';
import { minimatch } from 'minimatch';

import type {
	Report,
	ReportData,
	LintOptions,
	RuleFix,
	AstNode,
	RuleDataStrict,
	TaqwimConfig
} from '@taqwim/types';
import { globSync } from 'glob';

type FileSource = {
	path?: string;
	content?: string;
};

class ProcessFiles {
	/**
	 * The source code of the file.
	 */
	sourceCode = '';

	/**
	 * The source code of the file represented as an array of lines.
	 */
	sourceLines: string[] = [];

	/**
	 * List of rules to be applied to the file
	 */
	rules: Record<string, any>;

	/**
	 * File object
	 */
	file: {
		content: string;
		ast: any;
	} = {
			content: '',
			ast: {},
		};

	/**
	 * List of errors and warnings found in the file
	 */
	reports: ReportData[] = [];

	/**
	 * List of reports from all files
	 */
	fullReport: Report[] = [];

	/**
	 * Match the kind that the rule is looking for
	 */
	matchKind: string[] = [''];

	/**
	 * The current rule name being processed
	 */
	currentRuleName = '';

	/**
	 * List of fixes to be applied to the file
	 */
	fixes: RuleFix[] = [];

	/**
	 * Payload object to be passed to the rule and can be
	 * accessed by the rule during different stages of
	 * the process (pre, post, etc.)
	 */
	payload: any = {};

	/**
	 * Main script options
	 */
	options: LintOptions;

	/**
	 * Parsed config from inline comments
	 */
	inlineConfig: InlineConfig | undefined;

	/**
	 * Traverse object
	 */
	traverse: Traverse;

	/**
	 * Loaded Taqwim config
	 */
	taqwimConfig: TaqwimConfig;

	/**
	 * Constructor function
	 *
	 * @param {Record<string, any>} rules        Rules object
	 * @param {LintOptions}         options      Main script options
	 * @param {TaqwimConfig}        taqwimConfig Loaded config
	 */
	constructor(rules: Record<string, any>, options: LintOptions, taqwimConfig: TaqwimConfig) {
		this.options = options;
		this.rules = rules;
		this.taqwimConfig = taqwimConfig;
		this.traverse = new Traverse();
	}

	/**
	 * Parse file based on either path or content
	 *
	 * @param {FileSource} file File source (path or content)
	 * @throws {Error}                If the file does not exist
	 */
	parseFile(file: FileSource) {
		const { path, content } = file;

		if (content) {
			this.file = parseFileContent(content);
		}

		if (path && !content) {
			this.file = parseFile(path);
		}

		if (!path && !content) {
			throw new Error('No file path or content provided');
		}

		this.sourceCode = this.file.content;
		this.fixes = [];

		// Update values before running the rules
		this.sourceLines = this.sourceCode.split(/\r?\n/u);
		this.traverse.setSourceCode(this.sourceCode);
		this.traverse.setAst(this.file.ast);
		this.traverse.setSourceLines(this.sourceLines);
		this.traverse.updateAst(this.file.ast);

		const maxRuns = this.options.fix ? this.taqwimConfig.runs : 1;

		// Loop through all rules and run the process function
		for (let index = 0; index < maxRuns; index++) {
			Object.entries(this.rules).forEach(this.rulesCallback.bind(this));
		}

		if (this.reports.length > 0) {
			this.fullReport.push({
				file: path,
				reports: this.getReport(),
				sourceCode: this.sourceCode,
			});
		}
	}

	/**
	 * Check if report should be included in final result
	 * based on the line and column number provided in CLI arguments
	 *
	 * @param  {ReportData} reportData Report data
	 * @return {boolean}               Whether the report should be reported
	 */
	shouldReport(reportData: ReportData): boolean {
		const { line: cliLine, column: cliColumn } = this.options;
		const { position } = reportData as ReportData;

		const {
			start: { line, column },
		} = position;

		const isLineDisabled = this.isLineDisabled(reportData);
		if (isLineDisabled) {
			return false;
		}

		const cliLines = cliLine ? cliLine.split(',').map(Number) : undefined;
		const cliColumns = cliColumn ? cliColumn.split(',').map(Number) : undefined;

		let shouldReport = true;

		// If line or column number is provided in CLI arguments,
		// only report if the line or column number matches
		if (cliLines !== undefined && !cliLines.includes(line)) {
			shouldReport = false;
		}

		if (cliColumns !== undefined && !cliColumns.includes(column)) {
			shouldReport = false;
		}

		return shouldReport;
	}

	/**
	 * Check if the line is disabled for the current rule
	 *
	 * @param  {ReportData} reportData Report data
	 * @return {boolean}               Whether the line is disabled
	 */
	isLineDisabled(reportData: ReportData): boolean {
		if (!this.inlineConfig) {
			return false;
		}
		return this.inlineConfig.isRuleDisabled(reportData);
	}

	/**
	 * Check if the rule has been reported before
	 * this will prevent duplicate reports when running
	 * the fixer multiple times
	 *
	 * @param  {ReportData} reportData Report data
	 * @return {boolean}               Whether the rule has been reported
	 */
	hasBeenReported(reportData: ReportData): boolean {
		const {
			position,
			message: reportMessage,
			ruleName: reportRule,
		} = reportData as ReportData;

		const {
			start: { line: startLine, column: startColumn },
			end: { line: endLine, column: endColumn },
		} = position;

		const { reports } = this;
		let hasBeenReported = false;

		reports.forEach((report) => {
			const {
				position: { start, end },
				message,
				ruleName,
			} = report;

			if (hasBeenReported || reportRule !== ruleName) {
				return;
			}

			if (
				start.line === startLine &&
				start.column === startColumn &&
				end.line === endLine &&
				end.column === endColumn &&
				message === reportMessage
			) {
				hasBeenReported = true;
			}
		});
		return hasBeenReported;
	}

	/**
	 * Report data from rule to be displayed in the report.
	 *
	 * @param {ReportData} reportData The data to report
	 */
	report(reportData: ReportData) {
		const { message, position, fix } = reportData as ReportData;
		const { severity } = this.rules[this.currentRuleName];

		const reportDataWithRuleName = {
			...reportData,
			ruleName: this.currentRuleName,
		};

		if (severity === 'off' || this.shouldReport(reportDataWithRuleName) === false) {
			return;
		}

		const hasBeenReported = this.hasBeenReported(reportDataWithRuleName);
		if (!hasBeenReported) {
			this.reports.push({
				message,
				position,
				severity,
				ruleName: this.currentRuleName,
				hasFix: fix !== undefined,
			});
		}

		if (!fix) {
			return;
		}

		// Add fix to fixes array with the position
		// so it can be sorted later
		this.fixes.push({
			fix,
			position,
		});
	}

	/**
	 * Get the report data
	 *
	 * @return {ReportData[]} The report data
	 */
	getReport(): ReportData[] {
		// Sort reports by line number
		this.reports.sort((a: ReportData, b: ReportData) => {
			const { start: aStart } = a.position;
			const { start: bStart } = b.position;

			// Sort by column number if on the same line
			if (aStart.line === bStart.line) {
				return aStart.column - bStart.column;
			}
			return aStart.line - bStart.line;
		});

		return this.reports;
	}

	/**
	 * Callback for the traverse class
	 *
	 * @param {AstNode} node The node to be processed
	 */
	walkAstCallback(node: AstNode) {
		const { kind, loc } = node;

		if (!this.matchKind.includes(kind)) {
			return;
		}

		const currentRuleData = this.rules[this.currentRuleName];

		/*
		* Check if inline config has is provided for this rule.
		* It applies to all rules, but only partially to 'program'.
		* If 'program' is the current rule, then only top level comments
		* will be checked for inline config. To check for inline config
		* inside 'program', context.inlineConfig should be used.
		 */
		if (this.inlineConfig) {
			/*
			 * Typically 'program' loc will start from line 0, and
			 * end at the last line of the file. Inline config can not
			 * be applied to it because it starts after the first line
			 * This is why we need to change loc start if it is 'program'
			 */
			if (kind === 'program') {
				loc.start.line = 1;
			}

			const newData = this.inlineConfig.getUpdatedRule(this.currentRuleName, loc);

			if (newData) {
				// merge newData with currentRuleData.options
				currentRuleData.options = {
					...currentRuleData.options,
					...newData,
				};
			}
		}

		currentRuleData.process({
			node,
			report: this.report.bind(this),
			options: currentRuleData.options,
			ast: this.traverse.getAst(),
			payload: this.payload,
			ruleName: this.currentRuleName,
			walk: walk.bind(this.traverse),
			sourceLines: this.sourceLines,
			sourceCode: this.sourceCode,
			inlineConfig: this.inlineConfig,
			config: this.taqwimConfig,
		});
	}

	/**
	 * Sort fixes by line number and then column number
	 * in descending order so they can be run sequentially
	 * and in reverse order to avoid offset changes
	 *
	 * @param  {RuleFix} a The first fix
	 * @param  {RuleFix} b The second fix
	 * @return {number}    The sort order
	 */
	sortFixesCallback(a: RuleFix, b: RuleFix): number {
		const { start: aStart, end: aEnd } = a.position;
		const { start: bStart, end: bEnd } = b.position;

		// If there is an outer and inner control,
		// the outer control is the one that is executed first
		const isInner = aStart.line > bStart.line && aEnd.line < bEnd.line;
		if (isInner) {
			a.isInner = true;
			return 0;
		}

		// if on the same line, sort by column number
		if (aStart.line === bStart.line) {
			return bStart.column - aStart.column;
		}

		return bStart.line - aStart.line;
	}

	/**
	 * Callback function to loop trough all rules
	 * and run fixes if needed
	 *
	 * @param {any} ruleEntry The rule entry
	 */
	rulesCallback(ruleEntry: [string, RuleDataStrict]) {
		const { fix } = this.options;

		const [ruleName, ruleData] = ruleEntry;
		this.matchKind = ruleData.register as string[];
		if (typeof ruleData.register === 'function') {
			this.matchKind = ruleData.register();
		}

		// Set current rule name
		this.currentRuleName = ruleName;

		this.sourceLines = this.sourceCode.split(/\r?\n/u);

		// Get fresh AST and update source lines
		const freshAst = this.traverse.getAst();

		// Check for inline config
		const { comments } = freshAst;
		if (comments && comments.length > 0) {
			this.inlineConfig = new InlineConfig(freshAst);
		}

		// Clear fixes array for each rule
		this.fixes = [];

		// Call pre function if it exists
		if (ruleData.pre) {
			ruleData.pre({
				ast: freshAst,
				report: this.report.bind(this),
				options: ruleData.options,
				payload: this.payload,
				walk,
				ruleName: this.currentRuleName,
				sourceLines: this.sourceLines,
				sourceCode: this.sourceCode,
				inlineConfig: this.inlineConfig,
				config: this.taqwimConfig,
			});
		}

		// Loop through all nodes in the AST
		walk(
			freshAst,
			this.walkAstCallback.bind(this)
		);

		// Call post function if it exists
		if (ruleData.post) {
			ruleData.post({
				ast: freshAst,
				report: this.report.bind(this),
				options: ruleData.options,
				payload: this.payload,
				fixes: this.fixes,
				walk,
				ruleName: this.currentRuleName,
				sourceLines: this.sourceLines,
				sourceCode: this.sourceCode,
				inlineConfig: this.inlineConfig,
				config: this.taqwimConfig,
			});
		}

		// Only proceed if fixes are enabled and there are fixes
		// This will make the process faster
		if (fix !== true || this.fixes.length === 0) {
			return;
		}

		// Sort fixes by line and column number
		this.fixes.sort(this.sortFixesCallback.bind(this));

		// Filter inner fixes (fixes inside other fixes)
		const innerFixes = this.fixes.filter((fixData) => {
			return fixData.isInner === true;
		});

		// Filter outer fixes
		const outerFixes = this.fixes.filter((fixData) => {
			return fixData.isInner !== true;
		});

		// If there are inner fixes, fix them in next run
		if (innerFixes.length > 0) {
			outerFixes.forEach((fixData) => {
				this.sourceCode = fixData.fix(new Fixer(this.sourceCode));
			});

			// update AST for callback
			this.file.ast = parseString(this.sourceCode);
			this.traverse.updateAst(this.file.ast);

			// Run callback again to fix inner fixes
			this.rulesCallback(ruleEntry);
			return;
		}

		// This will run all fixes if there are no inner fixes
		// or just the inner fixes if the outer fixes are done in
		// the previous run
		this.fixes.forEach((fixData) => {
			this.sourceCode = fixData.fix(new Fixer(this.sourceCode));
		});

		// update AST for next run (if any)
		this.file.ast = parseString(this.sourceCode);
		this.traverse.updateAst(this.file.ast);
	}

	/**
	 * Start the process
	 *
	 * @return {Report[]} Full report
	 * @throws {Error}     If no source is provided
	 */
	start(): Report[] {
		const { source, cwd } = this.options;

		if (!source) {
			throw new Error('No source provided');
		}

		source.forEach((sourceData) => {
			const { path, content } = sourceData;

			if (content && !path) {
				this.parseFile({
					content,
				});
				return;
			}

			if (!path) {
				return;
			}

			let normalizedPath = path.replaceAll('\\', '/');
			const isDirectory = fs.statSync(normalizedPath).isDirectory();

			if (isDirectory) {
				normalizedPath += '/**/*.php';
			}

			// globSync has an issue with ignore patterns
			// minimatch is used here to check if the path should be ignored
			const isIgnored = this.taqwimConfig.ignore.some((ignorePath) => {
				return minimatch(normalizedPath, ignorePath);
			});

			if (isIgnored) {
				return;
			}

			// Get the list of files to be processed
			const paths = globSync(normalizedPath, {
				absolute: true,
				cwd: cwd ?? process.cwd(),

			});

			if (paths.length === 1 && path.endsWith('.php')) {
				this.parseFile({
					path: paths[0],
					content,
				});
				return;
			}

			paths.forEach((filePath) => {
				this.parseFile({ path: filePath });
			});
		});

		return this.fullReport;
	}
}

export default ProcessFiles;