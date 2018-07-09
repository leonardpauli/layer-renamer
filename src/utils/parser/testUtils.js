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
export const objectFilterRecursiveToMatchStructure = (obj, structure, {
	taken = new Set(),
	takenSkip = false, takenReturnStructure = false,
} = {})=>
		typeof obj !== 'object' || typeof structure !== 'object'
		|| obj===null || structure===null
		|| obj===structure ? obj
	: taken.has(structure)? takenSkip
		? void 0
		: takenReturnStructure? structure: obj
	: (taken.add(structure), Object.keys(structure).reduce((o, k)=> (o[k] =
		objectFilterRecursiveToMatchStructure(obj[k], structure[k], {
			taken, takenSkip, takenReturnStructure}), o), {}))

const arrayAppend = (target, ...xss)=> (xss.forEach(xs=> target.push(...xs)), target)

export const objectMap = fn=> obj=> Object.keys(obj)
	.reduce((o, k)=> (o[k] = fn(obj[k], k), o), {})

export const objectMapRecursive = (obj, fn, {
	// filter = ({})
	taken = [], takenMapCache = [],
	key = null,
} = {})=> typeof obj !== 'object' || obj===null
	? fn(obj, key, {recurse: null})
	: taken.indexOf(obj)>=0
		? takenMapCache[taken.indexOf(obj)]
		: (taken.push(obj), Array.isArray(obj)
			// TODO: also do object properties on arrays (non integer keys)
			? arrayAppend(takenMapCache[takenMapCache.length] = [],
				obj.map((v, k)=> fn(v, k, {
					recurse: ()=> objectMapRecursive(v, fn, {
						taken, takenMapCache, key: k,
					}),
				})))
			: Object.assign(takenMapCache[takenMapCache.length] = {},
				objectMap((v, k)=> fn(v, k, {
					recurse: ()=> objectMapRecursive(v, fn, {
						taken, takenMapCache, key: k,
					}),
				}))(obj))
		)


export const lexemSimplifyForView = o=> objectMapRecursive(o, (v, k, {recurse})=>
		v && v.type && v.type === v? `${v.type.name}`
	: v && typeof v==='object' && !(v.constructor===Object || Array.isArray(v))? v
	: recurse? recurse()
	: v)

export const expectDeepSubsetMatch = (source, target)=>
	expect(objectFilterRecursiveToMatchStructure(
		source, target, { takenReturnStructure: true },
	)).toEqual(target)


export const testManyGet = (evaluateStr, {testAst = false} = {})=> tests=> Object.keys(tests).forEach(k=> it(k, ()=> {
	const ctx = evaluateStr(k, void 0, {stopAfterAstify: testAst})
	
	if (tests[k] && tests[k].toerror) {
		const {toerror} = tests[k]
		expect(ctx.errors).toHaveLength(1)
		expect(ctx.errors[0].message).toMatch(toerror)
		return
	}

	if (testAst) {
		// log(lexemSimplifyForView(ctx.lexem), 2)
		// log(lexemSimplifyForView(tests[k]), 2)
		// throw new Error('alalla')
		expectDeepSubsetMatch(
			lexemSimplifyForView(ctx.lexem),
			lexemSimplifyForView(tests[k]))
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
