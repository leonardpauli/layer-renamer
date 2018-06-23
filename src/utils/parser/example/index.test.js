// utils/parser/example/index.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import sfo, {log} from 'string-from-object'

import {tokenizeNextCore} from '../tokenizer'
import {testTokenizeStr, logAstValue} from '../testUtils'
import {astify} from '../aster'
import {flags, expand, lexemIs} from '../lexemUtils'

import {exprCtxDefaultGet} from '.'
import lexems from './lexems'
import './lexemsAstExt'

const {optional, repeat, usingOr} = flags


describe('tokenize', ()=> {
	describe('minor', ()=> {
		testTokenizeStr(exprCtxDefaultGet(), '66', [['66', '@.num']])
	})
})

describe('evaluate', ()=> {
	it('some asta', ()=> {
		const ctx = exprCtxDefaultGet()
		// TODO: only astValue OR astTokens
		tokenizeNextCore(ctx, '(1 + 3) * 2')
		// tokenizeNextCore(ctx, '1 + 3 * 2')
		ctx.vars.str = 'hello'
		ctx.vars.add = '+++'
		const r = astify(ctx, ctx.lexem)
		logAstValue(r, 15)
		// log(evaluate(ctx, tokens[0]))
	})
})
