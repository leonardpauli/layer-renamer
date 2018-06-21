// filterExpression.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import filterExpression, {exprCtxDefaultGet} from '.'
import {tokenizeNext} from './tokenizer'
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
		expect(tas).toEqual(tasexp)
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
				['a'], ['.'], ['aa'], [' ', '@.spo'], ['+', '@.id'], [' ', '@.spo'], ['y', '@.id'],
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
	})

	// it.skip('.text', ()=> {
	// 	const tokens = tokenizeNext(exprCtxDefaultGet(), '"a')
	// 	log(tokens)
	// 	expect(tokens).toHaveLength(1)
	// 	expect(tokens[0].lexem.name).toBe('.text')
	// 	expect(tokens[0].match[0]).toBe('haa')
	// })
	// it('.paren', ()=> {
	// 	const tokens = tokenizeNext(exprCtxDefaultGet(), '(haa)')
	// 	log(tokens)
	// 	expect(tokens).toHaveLength(1)
	// 	expect(tokens[0].lexem.name).toBe('.paren')
	// 	expect(tokens[0].match[0]).toBe('haa')
	// })
})
