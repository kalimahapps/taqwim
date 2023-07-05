/* eslint-disable max-lines-per-function */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import Traverse from '@taqwim/traverse';
import type { AstAttributeGroup, AstNode } from '@taqwim/types';
import Taqwim from '@taqwim/index';
const testDirectory = fileURLToPath(new URL('.', import.meta.url));

const TraverseTest = new Traverse();

const range = {
	start: {
		line: 1,
		column: 1,
	},
	end: {
		line: 1,
		column: 1,
	},
};

test('Test updateAttrGroup', () => {
	const node = {};
	expect(
		TraverseTest.updateAttrGroup(node as AstNode)
	).toBe(false);

	const node2 = {
		attrs: [
			{
				loc: range,
			},
		],
	};
	expect(
		TraverseTest.updateAttrGroup(node2 as unknown as AstNode)
	).toBe(false);
});

test('Test updateAttr', () => {
	TraverseTest.sourceLines = ['line1', 'line2'];
	const attribute = {
		loc: range,
		name: 'test',
	};
	expect(
		TraverseTest.updateAttr(attribute as AstNode)
	).toBe(false);
});

test('Test updateAst', () => {
	const ast = {};
	expect(
		TraverseTest.updateAst(ast as AstNode)
	).toBe(false);

	const ast2 = {
		comments: [
			{
				test: 'test',
			},
		],
	} as unknown as AstNode;
	expect(
		TraverseTest.updateAst(ast2)
	).toBe(true);
});

test('Test findByNodeName', () => {
	const ast = {
		comments: [
			{
				test: 'test',
			},
		],
	} as unknown as AstNode;
	expect(
		TraverseTest.findByNodeName(ast, 'test')
	).toEqual([]);
});

test('Test getSibling', () => {
	const node = {
		path: [],
	} as unknown as AstNode;

	expect(
		TraverseTest.getSibling(node, 'next')
	).toBe(false);

	const child = {
		kind: 'test',
		path: ['children-|test'],
	} as unknown as AstNode;

	expect(
		TraverseTest.getSibling(child, 'next')
	).toBe(false);

	const child2 = {
		kind: 'variable',
		path: [
			'expression|assign',
			'left|variable',
		],
	};

	const ast = {
		expression: {
			kind: 'assign',
			path: ['expression|assign'],
			left: child2,
			traverse: {},
			right: {
				kind: 'variable',
				path: [
					'expression|assign',
					'right|variable',
				],
			},
		},
	} as unknown as AstNode;
	TraverseTest.setAst(ast);

	expect(
		TraverseTest.getSibling(child2 as AstNode, 'next')
	).toBe(false);

	expect(
		TraverseTest.getSibling(child2 as AstNode, 'previous')
	).toBe(false);
});

test('Test siblings', () => {
	const child = {
		kind: 'variable',
		path: [
			'expression|assign',
			'left|variable',
		],
	};

	const ast = {
		expression: {
			kind: 'assign',
			path: ['expression|assign'],
			left: child,
			traverse: {},
			right: {
				kind: 'variable',
				path: [
					'expression|assign',
					'right|variable',
				],
			},
		},
	} as unknown as AstNode;
	TraverseTest.setAst(ast);

	expect(
		TraverseTest.siblings(child as AstNode)
	).toHaveLength(5);
});