// utils/parser/testUtils.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

/* global expect it */

import sfo, {log, custom} from 'string-from-object'

import {objectMapRecursive} from '../object'
import {expectDeepSubsetMatch} from '../testUtils'

import {lexemSimplifyForView, lexemAstValueToPlain} from './lexemUtils'
import {tokenizeNext} from './tokenizer'


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


export const testManyGet = (evaluateStr, {testAst = false} = {})=> tests=> Object.keys(tests).forEach(k=> it(k, ()=> {
	const ctx = evaluateStr(k, void 0, {stopAfterAstify: testAst})
	
	if (tests[k] && tests[k].toerror) {
		const {toerror} = tests[k]
		expect(ctx.errors).toHaveLength(1)
		expect(ctx.errors[0].message).toMatch(toerror)
		return
	}

	if (testAst) {
		try {
			expectDeepSubsetMatch(
				lexemSimplifyForView(ctx.lexem),
				lexemSimplifyForView(tests[k]))
		} catch (err) {
			if (tests[k].astValue) {
				log(lexemAstValueToPlain(tests[k]), 10)
				log(lexemAstValueToPlain(ctx.lexem), 10)
			}
			throw err
		}
		return
	}

	if (!Array.isArray(tests[k])) throw new Error(`Expected tests[k] to be array, got ${tests[k]}`)
	const {value, restStr} = ctx
	const [valuet, restStrt] = tests[k]
	if (ctx.errors.length) {
		log(ctx.errors, 5)
		log(lexemAstValueToPlain(ctx.lexem), 8)
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
