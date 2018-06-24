// nodesAtRelativePath.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018
import {log} from 'string-from-object'

// TODO: if path: [some, null, some...] is provided, it will stop at null

const concat = xxs=> xxs.reduce((a, xs)=> (a.push(...xs), a), [])

// nodesAtRelativePathStep :: [n] -> [n]
const nodesAtRelativePathStep = ({
	roots, path,
	parentGet, childrenGet,
})=> {
	if (!path) return roots
	const xs = []

	if (path.up || path.down) {
		const addL = l=> l && !xs.includes(l) && xs.push(l)
		path.up
			? roots.map(parentGet).forEach(addL)
			: roots.map(childrenGet).forEach(ls=> ls && ls.forEach(addL))
	} else if (path.modulus) {
		const {k, m = 0} = path
		roots.forEach((node, i)=> (i+m)%k == 0 && xs.push(node))
	} else if (path.sideways) {
		const {relative, m} = path
		!relative
			? roots.forEach((node, i)=> i===m && xs.push(node))
			: roots.forEach((node, i)=> {
				const parent = parentGet(node); if (!parent) return
				const siblings = childrenGet(parent)
				const targetIdx = siblings.indexOf(node) + m
				const targetIdxMod = targetIdx%siblings.length
				const targetIdxShifted = targetIdxMod
					+ (targetIdxMod < 0 ? siblings.length : 0)
					- (targetIdxMod >= siblings.length ? siblings.length : 0)
				xs.push(siblings[targetIdxShifted])
			})
	} else throw new Error(`Path "${path}" isn't valid`)

	return xs
}

// nodesAtRelativePathGrouped :: [n] -> [[n]]
const nodesAtRelativePathGrouped = ({
	roots, path,
	parentGet, childrenGet,
})=> {
	let gs = [roots] // [n] -> [[n]]
	
	const unique = xs=> [...new Set(xs)]
	const regroupByParents = ()=> {
		const attachParents = ns=> ns.map(n=> [parentGet(n), n]) // [[n]] -> [[(parent, n)]]
		const os = concat(gs.map(unique).map(attachParents))
		const parents = []
		// log({gs}, 3, {singlelineLengthMax: 130, nameExtractor: o=> o && o.title})
		gs = []
		os.forEach(([parent, n])=> {
			// log({parent}, 2)
			const idx = parents.indexOf(parent)
			if (idx==-1) {
				parents.push(parent)
				gs.push([n])
				return
			}
			gs[idx].push(n)
		})
		gs = gs.map(unique)
		// log({gs}, 3, {singlelineLengthMax: 130, nameExtractor: o=> o && o.title})
	}

	let step; let restPath = path
	while ([step, ...restPath] = restPath, step) {
		const individually = step.down
		// const singleGroup = step.up
		// [[n]] -> [[n]]
		// gs = singleGroup ? [concat(gs)] : gs
		gs = individually ? concat(gs).map(n=> [n]) : gs
		// eslint-disable-next-line no-loop-func
		gs = gs.map(ns=> nodesAtRelativePathStep({
			roots: ns, path: step,
			parentGet, childrenGet,
		}))
		step.up && regroupByParents()
		// log({step, gs}, 3, {singlelineLengthMax: 130, nameExtractor: o=> o && o.title})
	}
	return gs
}

// nodesAtRelativePath :: [n] -> [n]
const nodesAtRelativePath = opt=> {
	const res = nodesAtRelativePathGrouped(opt)
	return [...new Set(concat(res))] // get unique
}

export default nodesAtRelativePath


// path parsing

export const parseRelativePathStrPart = str=> {
	const state = {}
	const path = [...parseRelativePathStr(str, state)]; const {restStr} = state
	// if (restStr===str) throw new Error(`Path "${restStr}" isn't valid path`)
	return {path, restStr}
}

export const parseRelativePathStr = function* parseRelativePathStr (str, state = {}) {
	state.restStr = str; let item
	while (state.restStr && ({item, restStr: state.restStr} =
		parseRelativePathStrNext(state.restStr), item)) yield item
	return state.restStr
}

export const relativePathTokenRegex = /^(([<>])|((\d+n)([+-]?\d+)?)|(([+-])?\d+))/
const parseRelativePathStrNext = str=> {
	const match = str.match(relativePathTokenRegex)
	if (!match) return {item: null, restStr: str}
	const [
		whole,
		, 					// or:
		upDown, 		// 	- upDown: [<>]
		modulus, 		// 	- modulus: modulusK modulusM
		modulusK, 	// 		- \d+n
		modulusM, 	// 		- ([+-]?\d+)?
		nr, 				// 	- nr: nrRelative \d+
		nrRelative, // 		- ([+-])?
	] = match
	
	const item =
			upDown ? upDown=='<'? {up: true}: {down: true}
		: modulus ? {modulus: true, k: parseInt(modulusK, 10), m: parseInt(modulusM, 10) || 0}
		: nr ? {sideways: true, relative: !!nrRelative, m: parseInt(nr, 10)}
		: null

	return {item, restStr: str.substr(whole.length)}
}
