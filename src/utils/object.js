// utils/object.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018
//
// based on rim / towards rim

import {log} from 'string-from-object'

// OBS: mutating + custom logic for pSymbol
export const deepAssign = (target, source, taken = new Set())=> {
	Object.keys(source).forEach(k=> {
		const v = source[k]
		if (v === target[k]) return
		if (v && typeof v === 'object' && !taken.has(v)) {
			
			// const r = [...taken]
			// log({k, l: taken.size, v: r[r.length-1]}, {nameExtractor: ()=> void 0})
			// if (taken.size > 100) return null

			if (v[pSymbol]) target[k] = P.unwrapRecursive(v)
			else { taken.add(v); deepAssign(target[k] = target[k] || {}, v, taken) }
		} else target[k] = v
	})
	return source
}


const rndstr = ()=> Math.random().toString(32).substr(2)


const pSymbol = Symbol('objr-p')
const blacklistKeyToSet = new Set([
	'asymmetricMatch', '$$typeof', '@@__IMMUTABLE_ITERABLE__@@',
	'@@__IMMUTABLE_RECORD__@@', 'nodeType', 'toJSON', 'constructor']) // TODO: warn if use? workaround all together?

export const P = o=> new Proxy(o, {get: (o, k)=>
		k === pSymbol ? o
	: (typeof k !== 'string' && typeof k !== 'number') || blacklistKeyToSet.has(k) ? o[k]
	: o[k] && typeof o[k] === 'object' && !o[k][pSymbol]? P(o[k])
	: k in o ? o[k]
	: P(o[k] = {}),
})

P.unwrap = p=> p && p[pSymbol] || p
// OBS: mutating
P.unwrapRecursiveSub = (o, taken = new Set())=> {
	taken.add(o)
	Object.keys(o).forEach(k=> {
		let v = o[k]
		if (v && v[pSymbol]) v = o[k] = v[pSymbol]
		if (v && typeof v === 'object' && !taken.has(v)) P.unwrapRecursiveSub(v, taken)
	})
}
P.unwrapRecursive = (p, ...opt)=> {
	const o = P.unwrap(p)
	P.unwrapRecursiveSub(o, ...opt)
	return o
}

// TODO: detect real dependencies using proxies + only re-evaluate relevant subtreees
// 	efficience + deprecates "guessing" of n (+ makes it less "stupid")
const objr = (fn, {o=null, n=null} = {})=> {
	if (n===null) n = 0 // state.depthMax
	if (o===null) o = P.unwrapRecursive(fn(P({})))
	
	const p = P(o)
	const r = fn(p)
	// P.unwrapRecursiveSub(o)

	deepAssign(o, r)

	// it's not how many x.y.z there is (depthMax) (if z is set, only 1 iteration necessary),
	// 	but how many step dependencies go, eg. a -> b -> c (two dependencies + base = 3 iterations necessary)
	// 	"maximum nr of branching on longest branch" in the dependency tree
	return !n? o: objr(fn, {o, n: --n})
}

export const stupidIterativeObjectDependencyResolve = objr


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

export const arrayAppend = (target, ...xss)=> (xss.forEach(xs=> target.push(...xs)), target)

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
