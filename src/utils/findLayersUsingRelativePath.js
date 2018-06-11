// findLayersUsingRelativePath.js
// LayerRenamer
//
// created by Leonard Pauli, jan 2017 + jun 2018
// copyright © Leonard Pauli 2017-2018


export const parseRelativePathStrPart = str=> {
	const state = {}
	const path = [...parseRelativePathStr(str, state)]; const {restStr} = state
	// if (restStr===str) throw new Error(`Path "${restStr}" isn't valid path`)
	return {path, restStr}
}

export const parseRelativePathStr = function* parseRelativePathStr (str, state = {}) {
	state.restStr = str; let item
	while ({item, restStr: state.restStr} = parseRelativePathStrNext(state.restStr), item) yield item
	return state.restStr
}

const parseRelativePathStrNext = str=> {
	const match = str.match(/^(([<>])|((\d+n)?(([+-])?\d+)?))/)
	if (!match) return {item: null, restStr: str}
	const [
		whole,
		, // (...
		upDown, // [<>]
		// |
		nr, //      (                    )
		modulusK, // (\d+n)?
		modulusM, //        (([+-])?\d+)?
		relative, //         ([+-])?
	] = match

	const usingModulus = !!modulusK
	const item = upDown ? upDown=='<'? {up: true}: {down: true}
		: {sideways: true, relative: !!relative, usingModulus,
			k: usingModulus? parseInt(modulusK, 10) : 1,
			m: modulusM? parseInt(modulusM, 10) : 0,
		} // nr ?

	return {item, restStr: str.substr(whole.length)}
}


const nodesAtRelativePath = ({
	roots,
	path: [path, ...restPath],
	parentGet,
	childrenGet,
})=> {
	const xs = []

	if (path.up || path.down) {
		roots.map(path.up? parentGet: childrenGet)
			.forEach(l=> l && !xs.includes(l) && xs.push(l))
	} else if (path.sideways) {
		const {usingModulus, relative, k, m} = path
		roots.forEach((node, idx)=> {
			const index = roots.length-idx-1
			if (usingModulus) return (index+m)%k == 0 && xs.push(node)

			const parent = parentGet(node); if (!parent) return
			const siblings = childrenGet(parent)
			const targetIdx = relative? siblings.indexOf(node) - m: siblings.length-1-m
			const targetIdxShifted = targetIdx + (targetIdx < 0 ? siblings.length : 0)
			if (targetIdxShifted >= 0 && targetIdxShifted < siblings.length)
				xs.push(siblings[targetIdxShifted])
		})
	} else throw new Error(`Path "${path}" isn't valid`)

	return !restPath.length? xs: nodesAtRelativePath({
		roots: xs, path: restPath, parentGet, childrenGet})
}


const findLayersUsingRelativePath = (baseLayers, path, {
	parentGet = l=> l.parentGroup && l.parentGroup(),
	childrenGet = l=> l.layers && l.layers(),
} = {})=> nodesAtRelativePath({
	roots: baseLayers, path, parentGet, childrenGet,
})


export default findLayersUsingRelativePath
