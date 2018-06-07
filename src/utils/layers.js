// layer.js
// LayerRenamer
//
// created by Leonard Pauli, jan 2017 + jun 2018
// copyright © Leonard Pauli 2017-2018

/* globals NSStringFromClass */


const layerKindGet = obj=> {
	const objClass = obj.class()
	if (objClass == MSLayerGroup)
		return 'Group'

	let str = NSStringFromClass(objClass)
	if (str.substr(0, 2)=='MS') str = str.substr(2)
	if (str.substr(-5)=='Group' || str.substr(-5)=='Layer')
		str = str.substr(0, str.length-5)

	if (str=='SymbolInstance') return 'Symbol'
	if (str.length>5 && (str.substr(-5)=='Shape' || str=='ShapePath')) return 'Path'

	return str
}


const layersSelect = ({layers, mode = layersSelect.modes.change, context})=> {
	if (mode === layersSelect.modes.change)
		context.api().selectedDocument.selectedLayers.clear()
	else throw new Error(`layersSelect mode ${mode} not yet supported, see code`)

	const kindFreqs = {}
	const addLayerKindToFreqs = layerKindName=> kindFreqs[layerKindName] = (kindFreqs[layerKindName] || 0) + 1

	;[].forEach.call(layers, layer=> {
		if (layer.isSelected()) return
		addLayerKindToFreqs(layerKindGet(layer))
		const r = layer.select_byExtendingSelection_(true, true)
		// log(r)
		// log(layer.select_byExtendingSelection_)
		// layer.addToSelection()
	})

	return {kindFreqs}
}
layersSelect.modes = {set: 0, add: 1, remove: 2, intersection: 2, difference: 3 }


export {
	layerKindGet,
	layersSelect,
}
