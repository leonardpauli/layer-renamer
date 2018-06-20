// utils/object.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018
//
// based on rim / towards rim

import {log} from 'string-from-object'

const P = (o, state = {}, depth=0)=> (
	state.depthMax = Math.max(state.depthMax || 0, depth),
	new Proxy(o, {get: (o, k)=>
			o[k]!==void 0 || typeof k !== 'string' ? o[k]
		: P({}, state, depth+1),
	}))

// TODO: detect real dependencies using proxies + only re-evaluate relevant subtreees
// 	efficience + deprecates "guessing" of n (+ makes it less "stupid")
const objr = (fn, {o = {}, n=null} = {})=> {
	const state = {}
	const p = P(o, state)
	const r = fn(p)
	if (n===null) n = state.depthMax
	// it's not how many x.y.z there is (depthMax) (if z is set, only 1 iteration necessary),
	// 	but how many step dependencies go, eg. a -> b -> c (two dependencies + base = 3 iterations necessary)
	return n>0? objr(fn, {o: r, n: --n}): r
}

export const stupidIterativeObjectDependencyResolve = objr
