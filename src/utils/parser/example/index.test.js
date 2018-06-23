// utils/parser/example/index.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import sfo, {log} from 'string-from-object'

import {tokenizeNextCore} from '../tokenizer'
import {testTokenizeStr, logAstValue} from '../testUtils'
import {astify} from '../aster'

import {evaluate, exprCtxDefaultGet} from '.'


describe('tokenize', ()=> {
	describe('minor', ()=> {
		testTokenizeStr(exprCtxDefaultGet(), '66', [['66', '@.num']])
	})
})

describe('evaluate', ()=> {
	it('some asta', ()=> {
		const ctx = exprCtxDefaultGet()
		// tokenizeNextCore(ctx, '(1 + 3) * 2')
		tokenizeNextCore(ctx, '( (3 * (4) + 2) )')
		// tokenizeNextCore(ctx, '1 + 3 * 2')
		ctx.vars.str = 'hello'
		ctx.vars.add = '+++'
		const r = astify(ctx, ctx.lexem)
		logAstValue(r, 15)
		log(evaluate(ctx, ctx.lexem))
		// log(evaluate(ctx, tokens[0]))
	})
})
