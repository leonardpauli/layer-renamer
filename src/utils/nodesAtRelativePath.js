// nodesAtRelativePath.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018
import {log} from 'string-from-object'

const nodesAtRelativePath = ({
	roots,
	path: [path, ...restPath],
	parentGet,
	childrenGet,
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

	return !restPath.length? xs: nodesAtRelativePath({
		roots: xs, path: restPath, parentGet, childrenGet})
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

const parseRelativePathStrNext = str=> {
	const match = str.match(/^(([<>])|((\d+n)([+-]?\d+)?)|(([+-])?\d+))/)
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
