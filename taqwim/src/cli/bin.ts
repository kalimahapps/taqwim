#!/usr/bin/env node

import { writeFileSync, readFileSync } from 'node:fs';
import { join as joinPath } from 'node:path';
import chalk from 'chalk';
import { RuleOptionError } from '@taqwim/throws/rule-error';
import ProcessFiles from '@taqwim/process-files';
import argv from '@taqwim/cli/command';
import OutputReport from '@taqwim/cli/output';
import Rules from '@taqwim/process-rules.js';
import { loadConfig } from '@taqwim/utils/index';
import type { LintOptions, ParserSyntaxError, Report } from '@taqwim/types/';
import cliOptions from '@taqwim/cli/options';
import { getBaseDirectory } from '@taqwim/utils';

type Option = {
	alias?: string;
	type?: string;
	description?: string;
	default?: string;
	choices?: string[];
};

class Main {
	/**
	 * Rules object
	 */
	private rules: any;

	/**
	 * List of files to be processed
	 */
	paths: { path: string }[] | undefined;

	/**
	 * Source code to be processed
	 */
	sourceCode = '';

	/**
	 * List of reports from all files
	 */
	fullReport: Report[] = [];

	/**
	 * Constructor function
	 */
	constructor() {
		const { help, h, version, v } = argv;
		if (help || h) {
			this.showHelp();

			process.exitCode = 0;
			return;
		}

		if (version || v) {
			const taqwimDirectory = getBaseDirectory('.');
			const packageInfo = readFileSync(joinPath(taqwimDirectory, 'package.json'), 'utf8');
			const { version: packageVersion } = JSON.parse(packageInfo);
			console.log(packageVersion);

			process.exitCode = 0;
			return;
		}

		this.getPaths();
		this.init();
	}

	/**
	 * Show custom help
	 */
	/* eslint complexity: ["warn", 7] */
	showHelp() {
		const lines = ['\n', chalk.green.bold('======== Taqwim Cli Options ========')];

		Object.keys(cliOptions).forEach((option: any) => {
			const config: Option = cliOptions[option as keyof typeof cliOptions] as Option;
			const { alias, type, description, default: defaultValue, choices } = config;
			const aliasString = alias ? `-${alias}` : '';
			const typeString = type !== undefined && type !== 'boolean' ? ` (${type})` : '';
			const defaultString = defaultValue ? ` [default: ${defaultValue}]` : '';

			const formatOption = chalk.cyan.bold(`--${option}`);
			const formatAlias = chalk.cyan.bold(`${aliasString}`);
			const formatType = chalk.gray(`${typeString}`);
			const formatDefault = chalk.gray(`${defaultString}`);
			const flags = [formatOption];

			if (aliasString) {
				flags.push(formatAlias);
			}

			lines.push(`${flags.join(', ')}${formatType}${formatDefault}`);

			if (choices) {
				const choicesString = `[choices: ${choices.join('|')}]`;
				lines.push(`${choicesString}`);
			}

			lines.push(`${description}`, '\n');
		});

		console.log(lines.join('\n'));
	}

	/**
	 * Get list of paths to be processed
	 * Paths will be either generated from the path argument
	 * from CLI command or the current working directory
	 */
	getPaths() {
		const cliPaths = argv.path.split(',');

		const hasFiles = cliPaths.some((cliPath) => {
			return cliPath.endsWith('.php');
		});

		const hasDirectories = cliPaths.some((cliPath) => {
			return !cliPath.endsWith('.php');
		});

		if (hasFiles && hasDirectories) {
			throw new Error('Mixing files and directories is not allowed in path argument');
		}

		this.paths = cliPaths.map((cliPath) => {
			return { path: cliPath };
		});
	}

	fixFiles() {
		for (const report of this.fullReport) {
			if (report.file === undefined) {
				throw new Error('File path is undefined');
			}

			writeFileSync(report.file, report.sourceCode);
		}
	}

	/**
	 * Start processing all files
	 */
	async init() {
		const taqwimConfig = await loadConfig(argv.cwd ?? process.cwd(), argv.configFileName);

		const lintOption: LintOptions = {
			source: this.paths ?? [],
			reportStyle: argv.reportStyle,
			reportFile: argv.reportFile,
			cwd: argv.cwd,
			rule: argv.rule,
			line: argv.line,
			column: argv.column,
			fix: argv.fix,
			configFile: argv.configFileName,
		};

		this.rules = new Rules(taqwimConfig, lintOption);
		this.rules.registerRules();

		try {
			const process = new ProcessFiles(this.rules.getSortedRules(), lintOption, taqwimConfig);
			this.fullReport = process.start();

			// If fix is enabled, fix all the errors
			if (argv.fix) {
				this.fixFiles();
			}

			new OutputReport(this.fullReport);
		} catch (error: unknown) {
			if (error instanceof RuleOptionError) {
				console.log(
					chalk.red(error.message),
					`\n${chalk.yellow(`Rule: ${error.ruleName}`)}`,
					`\n${chalk.yellow(`Option: ${error.optionName}`)}`,
					`\n${chalk.yellow(`Value: ${error.optionValue}`)}`
				);
			} else if (error instanceof SyntaxError) {
				const errorData = error as ParserSyntaxError;
				console.log(`\n\n----------------- Exception (${error.name}) -------------------`);
				console.log('\n>> Excerpt start <<\n', errorData.excerpt, '\n>> Excerpt end <<\n');
				console.log(error.stack, '\n\n');
			} else {
				console.log(chalk.red('\n\n--------- An error has occurred ---------'));
				console.log((error as Error).message);
			}
		}
	}
}

export default Main;