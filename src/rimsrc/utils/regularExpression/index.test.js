// regularExpression/index.test.js
// LayerRenamer
//
// created by Leonard Pauli, 26 jun 2018
// copyright © Leonard Pauli 2018

import sfo, {log} from 'string-from-object'

import {testTokenizeStr, testManyGet} from '../parser/testUtils'
import {expand} from '../parser/lexemUtils'

import {evaluateStr, exprCtxDefaultGet} from '.'
import root from './lexems'

const testTokenizeStrC = (l, ...args)=> {
	const lexem = {lexems: [l]}; expand(lexem)
	return testTokenizeStr({lexem}, ...args)
}



describe('tokenize', ()=> {
	testTokenizeStrC(root.orchar, '|', [['|', 'regexp.orchar']])
	testTokenizeStrC(root.matchable, 'a', [['a', 'regexp.achar']])
	
	testTokenizeStrC(root.matchable, '[]', [['[', 'regexp.characterset.opennormal'], [']', 'regexp.characterset.close']])
	testTokenizeStrC(root.characterset, '[^a\\]0-9\\b-]', [
		['[^', 'regexp.characterset.opennegated'],
		['a', 'regexp.characterset.achar'],
		['\\', 'regexp.backslash'],
		[']', 'regexp.escapedchar.achar'],
		['0', 'regexp.characterset.achar'],
		['-', 'regexp.characterset.dash'],
		['9', 'regexp.characterset.achar'],
		['\\', 'regexp.backslash'],
		['b', 'regexp.escapedchar.achar'],
		['-', 'regexp.characterset.achar'],
		[']', 'regexp.characterset.close'],
	])
	testTokenizeStrC(root.matchgroup, '(?:a)', [
		['(?:', 'regexp.matchgroup.opennoncapture'], ['a', 'regexp.achar'], [')', 'regexp.matchgroup.close']])

	testTokenizeStrC(root.matchstep, 'a*', [['a', 'regexp.achar'], ['*', 'regexp.modifierchar']])
	testTokenizeStrC(root.step, 'a*', [['a', 'regexp.achar'], ['*', 'regexp.modifierchar']])
	testTokenizeStrC(root.step, '^a*$', [['^', 'regexp.matchstart'], ['a', 'regexp.achar'], ['*', 'regexp.modifierchar'], ['$', 'regexp.matchend']])
	testTokenizeStrC(root.orlist, '^a*$', [['^', 'regexp.matchstart'], ['a', 'regexp.achar'], ['*', 'regexp.modifierchar'], ['$', 'regexp.matchend']])
	testTokenizeStrC(root.orlist, '^a*$|b?|d+', [
		['^', 'regexp.matchstart'], ['a', 'regexp.achar'], ['*', 'regexp.modifierchar'], ['$', 'regexp.matchend'],
		['|', 'regexp.orchar'], ['b', 'regexp.achar'], ['?', 'regexp.modifierchar'],
		['|', 'regexp.orchar'], ['d', 'regexp.achar'], ['+', 'regexp.modifierchar'],
	])
	testTokenizeStrC(root, '/a|b/', [
		['/', 'regexp.open'], ['a', 'regexp.achar'], ['|', 'regexp.orchar'], ['b', 'regexp.achar'], ['/', 'regexp.close'],
	])
	testTokenizeStr(exprCtxDefaultGet(), '/a/', [['/', 'regexp.open'], ['a', 'regexp.achar'], ['/', 'regexp.close']])
	testTokenizeStr(exprCtxDefaultGet(), 'haa', [])

	testTokenizeStr(exprCtxDefaultGet(), '/(a)/', [
		['/', 'regexp.open'],
		['(', 'regexp.matchgroup.opennormal'], ['a', 'regexp.achar'], [')', 'regexp.matchgroup.close'],
		['/', 'regexp.close']])
})


describe('astify', ()=> {
	const testMany = testManyGet((s, _, opt)=> {
		const ctx = exprCtxDefaultGet()
		// ctx.vars.name = 'Leo'
		// ctx.vars.a = {b: {c: 'itsa c'}}
		return evaluateStr(s, ctx, opt)
	}, {testAst: true})

	const {echar, step, matchstep, characterset, backref} = root

	describe('simple', ()=> testMany({
		
		'1': {
			type: root,
			astValue: void 0,
		},
		
		'/1/': {
			type: root,
			astValue: {
				step: { type: echar, astValue: '1'.charCodeAt(0) },
			},
		},

	}))

	describe('flags', ()=> testMany({

		'/1/': {
			astValue: {
				flags: {
					ignoreCase: false,
					multiline: false,
				},
			},
		},

		'/1/i': {
			astValue: {
				flags: {
					ignoreCase: true,
					multiline: false,
				},
			},
		},

		'/1/im': {
			astValue: {
				flags: {
					ignoreCase: true,
					multiline: true,
				},
			},
		},

	}))

	const stepAstValueW = o=> ({astValue: {step: { astValue: o }}})
	const stepAstValueWOr = o=> ({astValue: {step: { type: root.orlist, astValue: o }}})
	describe('usingOr', ()=> testMany({
		
		'/ab/': stepAstValueW({
			matches: [
				{ type: echar, astValue: 'a'.charCodeAt(0) },
				{ type: echar, astValue: 'b'.charCodeAt(0) },
			],
		}),
		
		'/a|b/': stepAstValueWOr([
			{ type: echar, astValue: 'a'.charCodeAt(0) },
			{ type: echar, astValue: 'b'.charCodeAt(0) },
		]),
		
		'/a|||b|c||/': stepAstValueWOr([
			{ type: echar, astValue: 'a'.charCodeAt(0) },
			{ type: echar, astValue: 'b'.charCodeAt(0) },
		]),
		
		'/|b/': {astValue: void 0},
		// stepAstValueW({ // TODO: errors?
		// 	usingOr: false,
		// 	matches: [
		// 		{ type: echar, astValue: 'b'.charCodeAt(0) },
		// 	],
		// }),

	}))

	describe('at', ()=> testMany({

		'/ab/': stepAstValueW({
			at: { start: false, end: false },
		}),

		'/^a/': stepAstValueW({
			at: { start: true, end: false },
		}),

		'/^a$/': stepAstValueW({
			at: { start: true, end: true },
		}),

		'/^ac|b$/': stepAstValueWOr([
			{ type: step, astValue: {
				at: { start: true, end: false },
				usingOr: false,
				matches: [
					{ type: echar, astValue: 'a'.charCodeAt(0) },
					{ type: echar, astValue: 'c'.charCodeAt(0) },
				],
			}},
			{ type: step, astValue: {
				at: { start: false, end: true },
				matches: [
					{ type: echar, astValue: 'b'.charCodeAt(0) },
				],
			}},
		]),
	}))

	describe.skip('escapedchar', ()=> testMany({
		'/\\0/': 'TODO',
		'/\\u45/': 'TODO',
		'/\\b/': 'TODO',
		'/\\./': 'TODO',
		'/\\\\/': 'TODO',
		'/\\[/': 'TODO',
		'/\\(/': 'TODO',
		'/\\//': 'TODO',
	}))

	describe.skip('backref', ()=> testMany({
		// { type: backref, astValue: 5 },
		'/(a)\\1/': 'TODO',
		'/\\5/': 'TODO', // unavailable backref -> error?
	}))

	describe.skip('characterset', ()=> testMany({
		'/[a]/': 'TODO',
		'/[^a]/': 'TODO',
		'/[^]/': 'TODO',
		'/[A-z0-9]/': 'TODO',
		'/[a-]/': 'TODO',
		'/[\\b\\[c\\]\\u45]/': 'TODO', // backref in charset -> error?

		// { type: characterset, astValue: {
		// 	negated: false,
		// 	ranges: [{start: 5, end: 8}],
		// 	chars: [4],
		// }},
	}))

	describe.skip('capture groups', ()=> testMany({
		'/(a)/': 'TODO',
		'/(a|b)/': 'TODO',
		'/(?:a)/': 'TODO',
		'/(a(b(c)d))/': 'TODO',
	}))

	const stepAstValueWMatchStep = modifier=> ({ astValue: { step: { type: root.matchstep, astValue: {
		match: { type: echar, astValue: 'a'.charCodeAt(0) },
		modifier,
	}}}})
	describe('matchstep modifier simple', ()=> testMany({
		'/a?/': stepAstValueWMatchStep({ min: 0, max: 1 }),
		'/a+/': stepAstValueWMatchStep({ min: 1, max: Infinity, greedy: true }),
		'/a*/': stepAstValueWMatchStep({ min: 0, max: Infinity, greedy: true }),

		// '/a??/': 'TODO', // invalid? -> error
		'/a+?/': stepAstValueWMatchStep({ min: 1, max: Infinity, greedy: false }),
		'/a*?/': stepAstValueWMatchStep({ min: 0, max: Infinity, greedy: false }),

		'/a{2,4}/': stepAstValueWMatchStep({ min: 2, max: 4, greedy: true }),
		'/a{2,}/': stepAstValueWMatchStep({ min: 2, max: Infinity, greedy: true }),
		'/a{,4}/': stepAstValueWMatchStep({ min: 0, max: 4, greedy: true }),
	}))
	describe.skip('matchstep modifier lookahead', ()=> testMany({
		'/a(?!b)/': 'TODO',
		'/a(?=b)/': 'TODO',

		// '/a(?!b)(?!c)/': 'TODO multiple?', // -> /a(?!b|c)/
		// '/a{2,3}?+(?=b)/': 'TODO multiple?',
	}))

	describe('full on', ()=> testMany({

		'/^1+|2|3/ig': { astValue: {
			step: { type: root.orlist, astValue: [
				{ type: root.step, astValue: {
					at: { start: true, end: false },
					matches: [{ type: root.matchstep, astValue: {
						match: { type: echar, astValue: '1'.charCodeAt(0) },
						modifier: { min: 1, max: Infinity },
					}}],
				}},
				{ type: echar, astValue: '2'.charCodeAt(0) },
				{ type: echar, astValue: '3'.charCodeAt(0) },
			]},
			flags: {
				ignoreCase: true,
				global: true,
				multiline: false,
			},
		}},

	}))

})
