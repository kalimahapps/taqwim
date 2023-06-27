import fs from 'node:fs';
import path from 'node:path';
import container from 'markdown-it-container';
import markdownItAttrs from 'markdown-it-attrs';

const getChildrenRules = (directoryName) => {
	const rules = fs.readdirSync(path.resolve(__dirname, `../rules/${directoryName}`));
	const items = [];
	rules.forEach((rule) => {
		const ruleName = rule.replace('.md', '');
		items.push({
			text: ruleName,
			link: `/rules/${directoryName}/${ruleName}`,
		});
	});
	return items;
};

const getRules = () => {
	const rulesFolderContent = fs.readdirSync(path.resolve(__dirname, '../rules'));

	const items = [];
	rulesFolderContent.forEach((item) => {
		// Process directories only
		if (!fs.lstatSync(path.resolve(__dirname, `../rules/${item}`)).isDirectory()) {
			return;
		}

		items.push({
			text: item,
			link: `/rules/${item}`,
			items: getChildrenRules(item),
		});
	});
	return items;
};

const createRuleContainer = function (klass, defaultTitle, md) {
	return [
		container,
		klass,
		{
			render(tokens, index) {
				const token = tokens[index];
				const info = token.info
					.trim()
					.slice(klass.length)
					.trim();
				if (token.nesting === 1) {
					const title = md.renderInline(info || defaultTitle);
					return `<div class="${klass} rule-container custom-block"><p class="rule-block-title">${title}</p>\n`;
				}
				return '</div>\n';
			},
			marker: '>',
		},
	];
};

const createExampleContainer = function (klass, defaultTitle, md) {
	return [
		container,
		klass,
		{
			render(tokens, index) {
				const token = tokens[index];
				const info = token.info
					.trim()
					.slice(klass.length)
					.trim();
				if (token.nesting === 1) {
					const title = md.renderInline(info || defaultTitle);
					return `<div class="${klass} custom-block"><p class="custom-block-title">${title}</p>\n`;
				}
				return '</div>\n';
			},
		},
	];
};

const getSidebarData = () => {
	return [
		{
			text: 'Getting started',
			collapsible: true,
			items: [
				{
					text: 'Introduction',
					link: '/introduction',
				},
				{
					text: 'Usage',
					link: 'usage',
				},
				{
					text: 'CLI',
					link: 'cli',
				},
				{
					text: 'Config',
					link: 'configuration',
				},
			],
		},
		{
			text: 'Rules',
			collapsible: true,
			collapsed: true,
			items: getRules(),
		},
		{
			text: 'Developers',
			collapsible: true,
			collapsed: true,
			items: [
				{
					text: 'Parser',
					link: 'developers/parser',
				},
				{
					text: 'Rule Anatomy',
					link: '/developers/rule-anatomy',
				},
				{
					text: 'Testing',
					link: '/developers/testing',
				}
			],
		},
	];
};

export default {
	title: 'Documentation',
	description: 'Documentation for PHPTaqwim',
	base: '/docs/',
	themeConfig: {
		siteTitle: 'PHPTaqwim',
		logo: './logo.png',
		outline: [2, 4],
		lastUpdated: true,
		cleanUrls: 'without-subfolders',
		editLink: {
			pattern: 'https://github.com/kalimah-apps/taqwim/edit/master/docs/:path',
			text: 'Edit this page on GitHub',
		},
		socialLinks: [
			{
				icon: 'github',
				link: 'https://github.com/kalimahapps/taqwim',
			},
			{
				icon: 'twitter',
				link: 'https://twitter.com/KalimahApps',
			},
		],
		sidebar: getSidebarData(),
		footer: {
			message: 'Released under the MIT License.',
		},
	},
	markdown: {
		// Configure the Markdown-it instance.
		config: (md) => {
			md.use(...createExampleContainer('correct', 'Correct', md))
				.use(...createExampleContainer('incorrect', 'Incorrect', md))
				.use(...createRuleContainer('rule', 'Rule', md))
				.use(markdownItAttrs);
		},
	},
};