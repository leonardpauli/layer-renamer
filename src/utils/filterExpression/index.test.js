// filterExpression.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import filterExpression, {parseStrNext, exprCtxDefault} from '.'

// describe('filterExpression', ()=> {
// 	it('add', ()=> {
// 		expect(1+1).toBe(2)
// 	})
// })

describe('parseStrNext', ()=> {
	it('.num', ()=> {
		const tokens = parseStrNext(exprCtxDefault, '66')
		log(tokens)
		expect(tokens).toHaveLength(1)
		expect(tokens[0].lexem.name).toBe('.num')
		expect(tokens[0].match[0]).toBe('66')
	})
	it('.id', ()=> {
		const tokens = parseStrNext(exprCtxDefault, 'h')
		log(tokens)
		expect(tokens).toHaveLength(1)
		expect(tokens[0].lexem.name).toBe('.id')
		expect(tokens[0].match[0]).toBe('h')
	})
})
