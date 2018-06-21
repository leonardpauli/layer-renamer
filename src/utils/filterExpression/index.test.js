// filterExpression.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import filterExpression, {parseStrNext, exprCtxDefaultGet} from '.'
import lexems from './lexems'
import {flags} from './lexemUtils'

// describe('filterExpression', ()=> {
// 	it('add', ()=> {
// 		expect(1+1).toBe(2)
// 	})
// })

describe('parseStrNext', ()=> {
	it('.num', ()=> {
		const tokens = parseStrNext(exprCtxDefaultGet(), '66')
		// log(tokens)
		expect(tokens).toHaveLength(1)
		expect(tokens[0].lexem.name).toBe('@.num')
		expect(tokens[0].match[0]).toBe('66')
	})
	describe('.id', ()=> {
		const simpleCheck = tokens=> {
			expect(tokens).toHaveLength(1)
			expect(tokens[0].lexem.name).toBe('@.id')
			expect(tokens[0].match[0]).toBe('haa')
		}
		it('directly', ()=> {
			const tokens = parseStrNext({lexem: {lexems: [lexems.id.strip]}}, 'haa'); simpleCheck(tokens)
		})
		it('using .expr', ()=> {
			const ctx = exprCtxDefaultGet()
			const tokens = parseStrNext(ctx, 'haa')
			// log({tokens, ctx})
			simpleCheck(tokens)
		})
	})
	describe('.text', ()=> {
		it('.raw', ()=> {
			const tokens = parseStrNext({lexem: {lexems: [lexems.text.raw]}}, 'haa')
			expect(tokens).toHaveLength(1)
			expect(tokens[0].lexem.name).toBe('@.text.raw')
			expect(tokens[0].match[0]).toBe('haa')
		})
		// text.expr.lexems = [text.expr.open, expr]
		// text.inner.lexems = [{repeat, optional, usingOr, lexems: [text.raw, text.expr]}]
		// text.lexems = [text.open, text.inner, {...text.close, autoInsertIfNeeded}]
		it('.raw .inner ex', ()=> {
			const {autoInsertIfNeeded, optional, repeat, usingOr} = flags
			const inner = {name: '.inner.ex'}
			// repeat, optional, usingOr,
			inner.lexems = [{lexems: [lexems.text.raw]}] // , lexems.text.expr
			const tokens = parseStrNext({lexem: inner}, 'haa')
			expect(tokens).toHaveLength(1)
			expect(tokens[0].lexem.name).toBe('@.text.raw')
			expect(tokens[0].match[0]).toBe('haa')
		})
	})
	// it.skip('.text', ()=> {
	// 	const tokens = parseStrNext(exprCtxDefaultGet(), '"a')
	// 	log(tokens)
	// 	expect(tokens).toHaveLength(1)
	// 	expect(tokens[0].lexem.name).toBe('.text')
	// 	expect(tokens[0].match[0]).toBe('haa')
	// })
	// it('.paren', ()=> {
	// 	const tokens = parseStrNext(exprCtxDefaultGet(), '(haa)')
	// 	log(tokens)
	// 	expect(tokens).toHaveLength(1)
	// 	expect(tokens[0].lexem.name).toBe('.paren')
	// 	expect(tokens[0].match[0]).toBe('haa')
	// })
})
