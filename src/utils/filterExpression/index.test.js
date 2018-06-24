// filterExpression.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import sfo, {log} from 'string-from-object'

import {testTokenizeStr, logAstValue} from '../parser/testUtils'
import {expand} from '../parser/lexemUtils'

import {evaluateStr, exprCtxDefaultGet} from '.'
import lexems from './lexems'


describe('tokenize', ()=> {
	describe('minor', ()=> {
		const {id, text} = lexems

		const l1 = {lexems: [id.strip]}; expand(l1)
		testTokenizeStr({lexem: l1}, 'haa', [['haa', '@.id']])
		testTokenizeStr(exprCtxDefaultGet(), 'haa', [['haa', '@.id']])
		const l2 = {lexems: [text.raw]}; expand(l2)
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

const testManyGet = evaluateStr=> tests=> Object.keys(tests).forEach(k=> it(k, ()=> {
	const ctx = evaluateStr(k)
	if (!Array.isArray(tests[k])) {
		const {toerror} = tests[k]
		expect(ctx.errors).toHaveLength(1)
		expect(ctx.errors[0].message).toMatch(toerror)
		return
	}
	const {value, restStr} = ctx
	const [valuet, restStrt] = tests[k]
	if (ctx.errors.length) {
		log(ctx.errors, 5)
		logAstValue(ctx.lexem)
		expect(ctx.errors.length*1).toBe(0)
	}
	try {
		expect(value).toEqual(valuet)
		restStrt !== void 0 && expect(restStr).toBe(restStrt)
	} catch (err) {
		// log({k, ctx}, 3)
		throw err
	}
}))

describe('evaluate', ()=> {
	const testMany = testManyGet(s=> {
		const ctx = exprCtxDefaultGet()
		ctx.vars.name = 'Leo'
		ctx.vars.a = {b: {c: 'itsa c'}}
		return evaluateStr(s, ctx)
	})
	// tokenizeNextCore(ctx, '"hel\\(add (55, 3, 7) rr)lo"')
	// ctx.vars.str = 'hello'
	// ctx.vars.add = '+++'
	describe('simple math', ()=> testMany({
		'1': [1],
		' 2 + 3': [void 0, ' 2 + 3'],
		'( (3 * ((4) + 2) - 1) )': [17],
	}))

	describe('simple text', ()=> testMany({
		'"1"': ['1'],
		'"hello"': ['hello'],
		'(33)': [33],
		'()': [[]],
		'"\\()"': [''],
		'"\\(33)"': ['33'],
		'"he\\(33)llo"': ['he33llo'],
		'"he\\(33+7)llo" + "hi"': ['he40llohi'],
		'"he\\(33+7)llo" + "hi" = "he40llohi"': [true],
		'"he\\(33+7)llo" + "hi" = "he40llohio"': [false],
		'"Hi \\(name)!"': ['Hi Leo!'],
		'"Hi \\(namea)!"': {toerror: /undefined.*namea/},
		'a.b.c': ['itsa c'],
		'a.c.d': {toerror: /undefined.*c/}, // or d?
		// 'name in ("a", "b", "c")': ['Hi Leo!'],
	}))
})
