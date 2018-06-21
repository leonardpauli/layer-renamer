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
	return !n? o: objr(fn, {o, n: --n})
}

export const stupidIterativeObjectDependencyResolve = objr
