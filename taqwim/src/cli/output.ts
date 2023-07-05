/* eslint complexity : ["warn", 9] */
import * as fs from 'node:fs';
import chalk from 'chalk';
import figlet from 'figlet';
import type { ReportData, Report } from '@taqwim/types';
import argv from '@taqwim/cli/command.js';

export default class {
	fullReport: Report[] = [];
	constructor(fullReport: Report[]) {
		// Hide chalk colors during testing because it messes up the test output
		chalk.level = process.env.VITEST ? 0 : 3;

		this.fullReport = fullReport;

		const { reportFile, reportStyle } = argv;

		if ((reportFile === undefined || reportFile === '') && reportStyle === 'json') {
			throw new Error('Report file is required when using json report style');
		}

		if (reportStyle === 'none') {
			return;
		}

		if (this.fullReport.length === 0) {
			console.log(this.getLogo());
			console.log('\n\n\t\t\t🎉🎉 No errors 🎉🎉\n\n\n');
			return;
		}

		if (!reportFile) {
			const report = this.formatReport();
			console.log(report);
			return;
		}

		// Disable chalk
		chalk.level = 0;

		fs.writeFileSync(reportFile, this.formatReport());
	}

	/**
	 * Get Taqwim ascii logo
	 *
	 * @return {string} Logo or empty string if the logo is disabled in the cli arguments
	 */
	getLogo = (): string => {
		let logo = '\n';
		logo += chalk.green(figlet.textSync('Taqwim!', {
			horizontalLayout: 'default',
			verticalLayout: 'default',
			width: 80,
			whitespaceBreak: true,
		}));
		logo += '\n';

		return logo;
	};

	/**
	 * Format the report based on the report style provided in the command line
	 *
	 * @return {string} Formatted report
	 */
	formatReport = (): string => {
		const { reportStyle, summary, v: showColumnNo, vv: showColumnAndRule, groupRules } = argv;

		if (reportStyle === 'json') {
			return JSON.stringify(this.fullReport, undefined, 2);
		}

		let report = '\n\n';
		report += this.getLogo();

		this.fullReport.forEach((fileReports: Report) => {
			let { file, reports } = fileReports;
			report += '\n\n';
			report += chalk.hex('#14cf5b')(''.padEnd(60, '-'));
			report += `\nFILE: ${file}`;

			if (summary) {
				const errors = reports.filter((report: ReportData) => {
					return report.severity === 'error';
				});
				const warnings = reports.filter((report: ReportData) => {
					return report.severity === 'warning';
				});

				const errorText = chalk.red(`${errors.length} errors`);
				const warningText = chalk.yellow(`${warnings.length} warnings`);
				report += `\nFound ${errorText} and ${warningText}`;

				return;
			}

			report += `\nFOUND ${reports.length} issues\n`;

			if (groupRules) {
				reports = reports.sort((a: ReportData, b: ReportData) => {
					if (a.ruleName === undefined || b.ruleName === undefined) {
						return 0;
					}

					if (a.ruleName < b.ruleName) {
						return -1;
					}

					if (a.ruleName > b.ruleName) {
						return 1;
					}
					return 0;
				});
			}

			// Nicely format the reports with line numbers and file name
			let previousRuleName: string;
			reports.forEach((fileReport: ReportData) => {
				const { message, position, ruleName, severity = 'error' } = fileReport;

				const { start } = position;

				let lineNumber = `${start.line + 1}`;
				if (showColumnNo || showColumnAndRule) {
					lineNumber += `:${start.column + 1}`;
				}

				lineNumber = lineNumber.padStart(7, ' ');

				if (previousRuleName !== ruleName && groupRules) {
					report += `\n\n${chalk.cyan(`  - ${ruleName}`)}`;
				}

				previousRuleName = ruleName ?? '';

				const severityColor = (severity === 'error') ? chalk.red : chalk.yellow;
				report += `\n${lineNumber} | ${severityColor(severity.padEnd(7, ' '))} | ${message}`;

				if (showColumnAndRule && groupRules === false) {
					report += chalk.gray(` (${ruleName})`);
				}
			});
		});

		return report;
	};
}