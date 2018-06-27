// utils/parser/testUtils.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

/* global expect it */

import sfo, {log, custom} from 'string-from-object'
import {tokenizeNext} from '../parser/tokenizer'


export const testTokenizeStr = (ctx, str, tasexp)=> it(str, ()=> {
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


const logAstValuePlain = custom({
 	indentation: '  ', colors: true,
	depth: 10,
	filter: ({key, value, parent})=> value !== void 0
		&& !(parent.key === 'type')
		&& !(parent.key === 'astId')
		&& !'optional,repeat,tokens,lexems,location,match,matched,astTokens'.split(',').includes(key),
})
export const logAstValue = (...args)=> console.log(logAstValuePlain(...args))

const astValueToPlain = v=>
		!v ? v
	: v.type ? [v.type.name, astValueToPlain(v.astValue)]
	: Array.isArray(v) ? v.map(astValueToPlain)
	: v

export const testManyGet = (evaluateStr, {testAst = false} = {})=> tests=> Object.keys(tests).forEach(k=> it(k, ()=> {
	const ctx = evaluateStr(k, void 0, {stopAfterAstify: testAst})
	if (!Array.isArray(tests[k])) {
		const {toerror} = tests[k]
		expect(ctx.errors).toHaveLength(1)
		expect(ctx.errors[0].message).toMatch(toerror)
		return
	}
	if (testAst) {
		// TODO
		logAstValue(ctx.lexem, 8)
		log(astValueToPlain(ctx.lexem), 8)
		// ctx.lexem.m
		// tests[k]
		return
	}
	const {value, restStr} = ctx
	const [valuet, restStrt] = tests[k]
	if (ctx.errors.length) {
		log(ctx.errors, 5)
		logAstValue(ctx.lexem, 8)
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
