import * as levn from 'levn';

import type { AstComment, AstNode, Loc, ReportData } from '@taqwim/types';

type InlineConfigSingle = {
	start: number;
	end: number;
	type: string;
};

type InlineConfigRule = {
	[key: string]: InlineConfigSingle[];
};

type InlineRule = {
	start: number;
	ruleName: string;
	config: {
		[key: string]: unknown;
	}
};

/**
 * This class will handle the inline rules.
 * For example, if a comment is present at the beginning of a file
 * with the following content: taqwim-disable, it will disable all rules
 * for that file.
 */
class InlineConfig {
	/**
	 * The AST of the file
	 */
	ast: any;

	/**
	 * Outcome of parsed inline comments
	 */
	outcome: InlineConfigRule = {};

	/**
	 * List of inline rules
	 */
	inlineRules: InlineRule[] = [];

	/**
	 * Constructor function
	 *
	 * @param {AstNode} ast The AST of the file
	 */
	constructor(ast: AstNode) {
		this.ast = ast;

		const { comments } = this.ast;

		// Loop through all comments to process
		comments.forEach((comment: AstComment) => {
			const clonedComment = JSON.parse(JSON.stringify(comment));

			if (this.shouldProcess(clonedComment.value) === false) {
				return;
			}
			const cleanedComment = this.cleanComment(clonedComment.value);
			clonedComment.value = cleanedComment;
			this.processComment(clonedComment);
		});
	}

	/**
	 * Process a comment to extract the rules
	 *
	 * @param {AstComment} comment The comment data
	 */
	processComment(comment: AstComment) {
		const { value: commentString } = comment;

		const isDisable = /^taqwim-disable\s*.*/u.test(commentString);
		const isEnable = /^taqwim-enable\s*.*/u.test(commentString);
		const isDisableNextLine = commentString.startsWith('taqwim-disable-next-line');
		const isRule = commentString.startsWith('taqwim ');

		if (isDisableNextLine || isDisable) {
			this.processDisableComment(comment, isDisableNextLine ? 'line' : 'block');
		}

		if (isEnable) {
			this.processEnableComment(comment);
		}

		if (isRule) {
			this.processRuleComment(comment);
		}
	}

	/**
	 * Process a comment that contains a rule
	 *
	 * @param {AstComment} comment The comment data
	 */
	processRuleComment(comment: AstComment) {
		const { value: commentString, loc } = comment;
		const {
			start: commentStart,
		} = loc;

		const config = commentString
			.replace(/^taqwim\s/u, '')
			.trim();

		try {
			const inlineRules = levn.parse('Object', `{${config}}`);

			Object.entries(inlineRules).forEach(([ruleName, ruleConfig]) => {
				const updatedRuleConfig = typeof ruleConfig === 'string' ? { severity: ruleConfig } : ruleConfig;
				this.inlineRules.push({
					start: commentStart.line,
					config: updatedRuleConfig as {
						[key: string]: unknown;
					},
					ruleName,
				});
			});
		} catch {
			// Error will be handled by the rule
		}
	}

	/**
	 * Get the updated rule
	 *
	 * @param  {string} ruleName The name of the rule
	 * @param  {Loc}    loc      The location of the rule
	 * @return {any}             The updated rule
	 */
	getUpdatedRule(ruleName: string, loc: Loc | number): any {
		if (typeof loc === 'number') {
			return false;
		}

		const { start } = loc;

		const rule = this.inlineRules.find((rule) => {
			const { start: ruleStart } = rule;
			return ruleName === rule.ruleName && start.line >= ruleStart;
		});

		if (rule) {
			return rule.config;
		}

		return false;
	}

	/**
	 * Process comment that disables a rule (using taqwim-disable)
	 *
	 * @param {AstComment} comment     The comment data
	 * @param {string}     disableType The type of disable (block or line)
	 */
	private processDisableComment(comment: AstComment, disableType: string) {
		const { value: commentString, loc } = comment;
		const {
			start: commentStart,
		} = loc;

		// Extract rules from comment
		let rules = commentString
			.replace(/^taqwim-disable(?:-next-line)?/u, '')
			.trim();

		if (rules.length === 0) {
			rules = '*';
		}

		rules.split(',')
			.forEach((rule) => {
				const ruleName = rule.trim().toLowerCase();

				// Make sure rule exists in outcome
				this.outcome[ruleName] = this.outcome[ruleName] || [];

				this.outcome[ruleName].push({
					start: commentStart.line + 1,
					end: disableType === 'line' ? commentStart.line + 1 : -1,
					type: disableType,
				});
			});
	}

	/**
	 * Process comment that enables a rule (using taqwim-enable)
	 *
	 * @param {AstComment} comment The comment data
	 */
	private processEnableComment(comment: AstComment) {
		const { value: commentString, loc } = comment;
		const {
			start: commentStart,
			end: commentEnd,
		} = loc;

		// Extract rules from comment
		const rules = commentString
			.replace(/^taqwim-enable/u, '')
			.trim();

		// If no rules are specified, enable all rules
		if (rules.length > 0) {
			// Enable only the specified rules
			rules.split(',').forEach((rule) => {
				const ruleName = rule.trim().toLowerCase();

				// Make sure rule exists in outcome
				this.outcome[ruleName] = this.outcome[ruleName] || [];

				this.outcome[ruleName].forEach((ruleData) => {
					// Change only if rule has been disabled before the comment
					if (ruleData.start <= commentStart.line) {
						ruleData.end = commentEnd.line;
					}
				});
			});

			return;
		}

		this.outcome =
			Object.entries(this.outcome)
				.reduce((accumulator: InlineConfigRule, [ruleName, ruleData]) => {
					accumulator[ruleName] = ruleData.map((rule) => {
						// Change only if rule has been disabled before the comment
						if (rule.start <= commentStart.line) {
							rule.end = commentEnd.line;
						}
						return rule;
					});

					return accumulator;
				}, {});
	}

	/**
	 * Check if a rule should be disabled
	 *
	 * @param  {ReportData} ruleReport The rule report
	 * @return {boolean}               True if the rule should be disabled, false otherwise
	 */
	isRuleDisabled(ruleReport: ReportData): boolean {
		const { position, ruleName } = ruleReport;
		const { start } = position;

		if (!this.outcome || !ruleName) {
			return false;
		}

		const { outcome } = this;

		// Create a variable to build an array of rules data to check against
		let ruleOutcome: InlineConfigSingle[] = [];

		// If there is a global disable, add it to the array
		if (outcome['*']) {
			ruleOutcome = outcome['*'];
		}

		// If there is a rule disable, add it to the array
		if (outcome[ruleName]) {
			ruleOutcome = [...ruleOutcome, ...outcome[ruleName]];
		}

		// Check if ruleReport should be disabled
		const matchDisable = ruleOutcome.find((ruleData) => {
			const { start: ruleStart, end: ruleEnd } = ruleData;

			// -1 means that the rule should be disabled for the rest of the file
			if (ruleEnd === -1) {
				return start.line >= ruleStart;
			}
			return start.line >= ruleStart && start.line <= ruleEnd;
		});

		// If match is found then the rule should be disabled, otherwise it should be enabled
		return matchDisable !== undefined;
	}

	/**
	 * Check if the comment should be processed.
	 * A comment will be processed if it starts with /* taqwim[-*]
	 *
	 * @param  {string}  comment Comment to be processed
	 * @return {boolean}         True if the comment should be processed, false otherwise
	 */
	shouldProcess(comment: string): boolean {
		return /^\/\*\s*taqwim.*/u.test(comment);
	}

	/**
	 * Remove leading asterisks from each line of a comment
	 *
	 * @param  {string} comment Comment to be cleaned
	 * @return {string}         Cleaned comment
	 */
	cleanComment(comment: string): string {
		return comment
			.replace(/^\/\*/u, '')
			.replace(/\*\/$/u, '')
			.trim();
	}
}

export default InlineConfig;