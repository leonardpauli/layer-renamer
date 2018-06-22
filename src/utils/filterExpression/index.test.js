// filterExpression.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import sfo, {log} from 'string-from-object'
import filterExpression, {exprCtxDefaultGet} from '.'
import {tokenizeNext, tokenizeNextCore} from './tokenizer'
import {astify} from './aster'
import lexems from './lexems'
import {flags} from './lexemUtils'

const {autoInsertIfNeeded, optional, repeat, usingOr} = flags


const testTokenizeStr = (ctx, str, tasexp)=> it(str, ()=> {
	const tokens = tokenizeNext(ctx, str)
	const tas = tokens.map(t=> [t.match[0], t.lexem.name])
	try {
		expect(tas).toHaveLength(tasexp.length)
		tas.some((t, i)=> {
			const [s, name] = tasexp[i]
			s && expect(t[0]).toBe(s)
			name && expect(t[1]).toBe(name)
			return false
		})
	} catch (err) { log(tas); throw err }
})


describe('tokenize', ()=> {
	describe('minor', ()=> {
		testTokenizeStr(exprCtxDefaultGet(), '66', [['66', '@.num']])
		testTokenizeStr({lexem: {lexems: [lexems.id.strip]}}, 'haa', [['haa', '@.id']])
		testTokenizeStr(exprCtxDefaultGet(), 'haa', [['haa', '@.id']])
		testTokenizeStr({lexem: {lexems: [lexems.text.raw]}}, 'haa', [['haa', '@.text.raw']])
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
	it('some', ()=> {
		const ctx = exprCtxDefaultGet()
		tokenizeNextCore(ctx, '"hel\\(add (55, 3, 7) rr)lo"')
		// tokenizeNextCore(ctx, 'a 44 c')
		// tokenizeNextCore(ctx, '(1 + 3) * 2')
		ctx.vars.str = 'hello'
		ctx.vars.add = '+++'
		if (ctx.lexem.tokens.length > 1) throw new Error(`ctx.lexem.tokens.length > 1`)
		log(astify(ctx, ctx.lexem.tokens[0]), 10)
		// log(evaluate(ctx, tokens[0]))
	})
})
