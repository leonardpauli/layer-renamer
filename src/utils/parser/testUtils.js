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

// eg. obj = {a: 2, b: 3, c: {some: 'more', even: 'more'}, g: {bla: 5}}
// 	structure = {a:1, c: {some:8}, g: '..', y: 9}
// (obj, structure) -> {a: 2, c: {some: 'more'}, g: {bla: 5}, y: undefined}
// TODO: rename to subset..? + fix array to be subset based; not key/index-based
export const objectFilterRecursiveToMatchStructure = (obj, structure)=>
	typeof obj !== 'object' || typeof structure !== 'object' || obj===null || structure===null
		? obj
		: Object.keys(structure).reduce((o, k)=> (o[k] =
			objectFilterRecursiveToMatchStructure(obj[k], structure[k]), o), {})

export const expectDeepSubsetMatch = (source, target)=>
	expect(objectFilterRecursiveToMatchStructure(source, target)).toEqual(target)


export const testManyGet = (evaluateStr, {testAst = false} = {})=> tests=> Object.keys(tests).forEach(k=> it(k, ()=> {
	const ctx = evaluateStr(k, void 0, {stopAfterAstify: testAst})
	
	if (tests[k] && tests[k].toerror) {
		const {toerror} = tests[k]
		expect(ctx.errors).toHaveLength(1)
		expect(ctx.errors[0].message).toMatch(toerror)
		return
	}

	if (testAst) {
		expectDeepSubsetMatch(ctx.lexem, tests[k])
		// TODO
		// logAstValue(ctx.lexem, 8)
		// log(astValueToPlain(ctx.lexem), 8)
		// ctx.lexem.m
		// tests[k]
		return
	}

	if (!Array.isArray(tests[k])) throw new Error(`Expected tests[k] to be array, got ${tests[k]}`)
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
