// filterExpression.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import sfo, {log} from 'string-from-object'
import filterExpression, {exprCtxDefaultGet} from '.'
import {tokenizeNext, tokenizeNextCore} from '../parser/tokenizer'
import {astify} from '../parser/aster'
import lexems from './lexems'
import './lexemsAstExt'
import {flags, expand, lexemIs} from '../parser/lexemUtils'

const {autoInsertIfNeeded, optional, repeat, usingOr} = flags


const testTokenizeStr = (ctx, str, tasexp)=> it(str, ()=> {
	const tokens = tokenizeNext(ctx, str)
	const tas = tokens.filter(t=> t.match).map(t=> [t.match[0], t.type.name])
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
		// tokenizeNextCore(ctx, '"hel\\(add (55, 3, 7) rr)lo"')
		// tokenizeNextCore(ctx, 'a')
		// TODO: only astValue OR astTokens
		tokenizeNextCore(ctx, '(1 + 3) * 2')
		// tokenizeNextCore(ctx, '1 + 3 * 2')
		ctx.vars.str = 'hello'
		ctx.vars.add = '+++'
		const r = astify(ctx, ctx.lexem)
		log(r, 10, {filter: ({key, value, parent})=> value !== void 0
			&& !(parent.key === 'type')
			&& !(parent.key === 'astId')
			&& !'optional,repeat,tokens,lexems,location,match,matched'.split(',').includes(key)})
		// log(evaluate(ctx, tokens[0]))
	})
})
