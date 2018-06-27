// regularExpression/index.test.js
// LayerRenamer
//
// created by Leonard Pauli, 26 jun 2018
// copyright © Leonard Pauli 2018

import sfo, {log} from 'string-from-object'

import {testTokenizeStr, logAstValue, testManyGet} from '../parser/testUtils'
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
	testTokenizeStrC(root.matchable, '(?:a)', [
		['(', 'regexp.matchgroup.opennormal'], ['?:', 'regexp.matchgroup.grouptype'], ['a', 'regexp.achar'], [')', 'regexp.matchgroup.close']])

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

describe.skip('astify', ()=> {
	const testMany = testManyGet((s, _, opt)=> {
		const ctx = exprCtxDefaultGet()
		// ctx.vars.name = 'Leo'
		// ctx.vars.a = {b: {c: 'itsa c'}}
		return evaluateStr(s, ctx, opt)
	}, {testAst: true})

	// TODO
	describe('simple', ()=> testMany({
		'1': void 0,
		'/1/': ['regexp', [
			['achar', '1'],
		]],
		'/^1+|2|3/': [],
	}))
})
