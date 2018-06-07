// findLayersUsingRelativePath.js
// LayerRenamer
//
// created by Leonard Pauli, jan 2017 + jun 2018
// copyright © Leonard Pauli 2017-2018


const findLayersUsingRelativePath = (baseLayers, path)=> {
	const layers = []
	const direction = path.match(/^:?(([<>])|((\d+n)?(([+-])?\d+)?))/)
	if (!direction) throw new Error(`Path "${path}" isn't valid`)
	const [
		directionWhole,
		,
		directionUpDown,
		directionNr,
		directionModulusK,
		directionModulusM,
		directionRelative,
	] = direction
	const restPath = path.substr(directionWhole.length)

	if (directionUpDown=='<') {
		baseLayers.forEach(layer=> {
			if (layer.parentGroup) {
				const parent = layer.parentGroup()
				if (layers.indexOf(parent) < 0)
					layers.push(parent)
			}
		})
	} else if (directionUpDown=='>') {
		baseLayers.forEach(layer=> {
			if (layer.layers) layer.layers()
				.forEach(l=> { layers.push(l) })
		})
	} else if (!directionNr || !directionNr.length) { // containing group
		throw new Error(`Path "${path}" isn't valid`)
	} else {
		const usingModulus = !!directionModulusK
		const k = usingModulus? parseInt(directionModulusK, 10) : 1
		const m = directionModulusM? parseInt(directionModulusM, 10) : 0
		const doRelative = directionRelative

		baseLayers.forEach((layer, idx)=> {
			const index = baseLayers.length-idx-1
			if (usingModulus) {
				if ((index+m)%k == 0)
					layers.push(layer)
			} else {
				if (!layer.parentGroup) return
				const parent = layer.parentGroup()
				const siblings = parent.layers()

				let targetIdx = !doRelative? siblings.length-1-m : siblings.indexOf(layer) - m
				if (targetIdx < 0) targetIdx += siblings.length
				if (targetIdx >= 0 && targetIdx < siblings.length)
					layers.push(siblings[targetIdx])
			}
		})
	}

	return !restPath.length? layers:
		findLayersUsingRelativePath(layers, restPath)
}

export default findLayersUsingRelativePath
