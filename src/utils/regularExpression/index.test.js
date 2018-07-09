// regularExpression/index.test.js
// LayerRenamer
//
// created by Leonard Pauli, 26 jun 2018
// copyright © Leonard Pauli 2018

import sfo, {log} from 'string-from-object'

import {
	testTokenizeStr, logAstValue, testManyGet,
} from '../parser/testUtils'
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

	describe.only('simple', ()=> testMany({
		
		'1': {
			type: root,
			astValue: void 0,
		},
		
		'/1/': {
			type: root,
			astValue: {
				step: { astValue: {
					matches: [
						{ type: echar, astValue: '1'.charCodeAt(0) },
					],
				}},
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
	describe('usingOr', ()=> testMany({
		
		'/ab/': stepAstValueW({
			usingOr: false,
			matches: [
				{ type: echar, astValue: 'a'.charCodeAt(0) },
				{ type: echar, astValue: 'b'.charCodeAt(0) },
			],
		}),
		
		'/a|b/': stepAstValueW({
			usingOr: true,
			matches: [
				{ type: echar, astValue: 'a'.charCodeAt(0) },
				{ type: echar, astValue: 'b'.charCodeAt(0) },
			],
		}),

	}))

	describe('at', ()=> testMany({

		'/a/': stepAstValueW({
			at: { start: false, end: false },
		}),

		'/^a/': stepAstValueW({
			at: { start: true, end: false },
		}),

		'/^a$/': stepAstValueW({
			at: { start: true, end: true },
		}),

		'/^ac|b$/': stepAstValueW({
			at: { start: false, end: false },
			usingOr: true,
			matches: [
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
			],
		}),

	}))

	/*

	describe('escapedchar', ()=> testMany({
	}))

	describe('backref', ()=> testMany({
	}))

	describe('characterset', ()=> testMany({
	}))

	describe('capture groups', ()=> testMany({
	}))

	describe('matchstep modifier', ()=> testMany({
	}))


	describe('full on', ()=> testMany({
		// '/^1+|2|3/': [],
		'/1/': {
			type: root,
			astValue: {
				flags: {
					ignoreCase: true,
					multiline: true,
				},
				step: { astValue: {
					capture: false,
					at: { start: true, end: false },
					usingOr: false,
					matches: [
						{ type: echar, astValue: 5 },
						{ type: matchstep, astValue: {
							match: { type: echar, astValue: 5 },
							modifier: {
								min: 1,
								max: 3,
								greedy: false,
								lookahead: {
									enabled: false,
									negated: false,
									// step:,
									// 	capture: ...,
									// 	...,
								},
							},
						}},
						{ type: characterset, astValue: {
							negated: false,
							ranges: [{start: 5, end: 8}],
							chars: [4],
						}},
						{ type: backref, astValue: 5 },
					],
				}},
			},
		},
	}))
	*/

})
