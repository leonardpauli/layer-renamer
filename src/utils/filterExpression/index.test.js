// filterExpression.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import sfo, {log} from 'string-from-object'

import {tokenizeNextCore} from '../parser/tokenizer'
import {testTokenizeStr, logAstValue} from '../parser/testUtils'
import {astify} from '../parser/aster'
import {flags, expand, lexemIs} from '../parser/lexemUtils'

import {exprCtxDefaultGet} from '.'
import lexems from './lexems'
import './lexemsAstExt'

const {optional, repeat, usingOr} = flags


describe('tokenize', ()=> {
	describe('minor', ()=> {
		const l1 = {lexems: [lexems.id.strip]}; expand(l1)
		testTokenizeStr({lexem: l1}, 'haa', [['haa', '@.id']])
		testTokenizeStr(exprCtxDefaultGet(), 'haa', [['haa', '@.id']])
		const l2 = {lexems: [lexems.text.raw]}; expand(l2)
		testTokenizeStr({lexem: l2}, 'haa', [['haa', '@.text.raw']])
	})

	describe('more', ()=> {
		testTokenizeStr(exprCtxDefaultGet(), 'a.aa', [['a', '@.id'], ['.', '@.dot'], ['aa', '@.id']])
		testTokenizeStr(exprCtxDefaultGet(), '(a.aa + y)', [
			['(', '@.paren.open'], ...[
				['a'], ['.'], ['aa'], [' ', '@.sp'], ['+', '@.id.special'], [' ', '@.sp'], ['y', '@.id'],
			], [')', '@.paren.close'],
		])
		testTokenizeStr(exprCtxDefaultGet(), '"hello\\(d + "y") there"', [
			['"', '@.text.open'], ...[
				['hello', '@.text.raw'], ['\\(', '@.text.expr.open'], ['(', '@.paren.open'], ...[
					['d', '@.id'], [' '], ['+'], [' '],
					['"', '@.text.open'], ['y'], ['"', '@.text.close'],
				], [')', '@.paren.close'], [' there'],
			], ['"', '@.text.close'],
		])
		testTokenizeStr(exprCtxDefaultGet(), 'a+', [['a', '@.id'], ['+', '@.id.special']])
	})
})

describe('evaluate', ()=> {
	it('some asta', ()=> {
		const ctx = exprCtxDefaultGet()
		tokenizeNextCore(ctx, '"hel\\(add (55, 3, 7) rr)lo"')
		ctx.vars.str = 'hello'
		ctx.vars.add = '+++'
		const r = astify(ctx, ctx.lexem)
		// logAstValue(r)
		// log(evaluate(ctx, tokens[0]))
	})
})
