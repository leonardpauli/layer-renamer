// filterExpression/objectUtils.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018
//
// based on rim / towards rim

/* eslint consistent-this:0 */

import {log} from 'string-from-object'

const deepAssign = (a, b)=> {
	const ok = a && b && typeof a === 'object' && typeof b === 'object'
	if (!ok) return a
	Object.keys(a)
}

// OBS: mutating
export const objectSelfDependenciesResolve = (o, {parent, key, taken = new Set()} = {})=> {
	if (taken.has(o)) return o
	taken.add(o)

	if (typeof o === 'function') {
		const {bindedSelf} = o
		if (parent && bindedSelf) parent[key] = bindedSelf
		const self = (parent && parent[key]) || bindedSelf || {}
		const res = o(self)
		if (parent) parent[key] = res
		return res
	} else if (Array.isArray(o)) {
		o.forEach((v, i)=> objectSelfDependenciesResolve(v, {taken, parent: o, key: i}))
		return o
	} else if (o && typeof o === 'object') {
		Object.keys(o).forEach(k=> objectSelfDependenciesResolve(o[k], {taken, parent: o, key: k}))
		return o
	}
	return o

	// const blacklist = ['@@__IMMUTABLE_ITERABLE__@@', '@@__IMMUTABLE_RECORD__@@', '$$typeof', 'nodeType', 'toJSON', 'asymmetricMatch']
	// const selfProxy = new Proxy(self, {
	// 	get: (o, k)=>
	// 			k in o? o[k]
	// 		: typeof k !== 'string' ? void 0
	// 		: k === 'self' ? self
	// 		: blacklist.includes(k) ? void 0
	// 		: (o[k] = {}),
	// })
	// const res = o(selfProxy)
}

objectSelfDependenciesResolve.bindSelf = (self, fn)=> (fn.bindedSelf = self, fn)
