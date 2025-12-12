import fs from 'node:fs';
import path from 'node:path';
import container from 'markdown-it-container';
import markdownItAttrs from 'markdown-it-attrs';

const getChildrenRules = (directoryName) => {
	const rules = fs.readdirSync(path.resolve(__dirname, `../rules/${directoryName}`));
	const items = [];
	for (const rule of rules) {
		const ruleName = rule.replace('.md', '');
		items.push({
			text: ruleName,
			link: `/rules/${directoryName}/${ruleName}`,
		});
	}
	return items;
};

const getRules = () => {
	const rulesFolderContent = fs.readdirSync(path.resolve(__dirname, '../rules'));

	const items = [];
	for (const item of rulesFolderContent) {
		// Process directories only
		if (!fs.lstatSync(path.resolve(__dirname, `../rules/${item}`)).isDirectory()) {
			continue;
		}

		items.push({
			text: item,
			link: `/rules/${item}`,
			items: getChildrenRules(item),
		});
	}
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
					text: 'Developing locally',
					link: 'developers/developing-locally',
				},
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
				},
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

		socialLinks: [
			{
				icon: 'github',
				link: 'https://github.com/kalimahapps/taqwim',
			},
			{
				icon: 'npm',
				link: 'https://www.npmjs.com/package/@kalimahapps/vue-icons',
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
		search: {
			provider: 'algolia',
			options: {
				appId: 'AW5IGMKN2Y',
				apiKey: '508ba02994bccd7de89c7c36eae9e154',
				indexName: 'taqwim-kalimah-apps',
			},
		},
	},
	head: [
		[
			'script',
			{
				async: true,
				src: 'https://www.googletagmanager.com/gtag/js?id=G-46RF8EW4VV',
			},
		],
		[
			'script',
			{},
			"window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-46RF8EW4VV');",
		],
	],
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