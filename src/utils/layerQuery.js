// layerQuery.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import {layerKindGet} from './layers'


const layerQuery = (context, layersLookupTable)=> (id, query)=> {
	const {layer, json, err} = layersLookupTable[id]
		|| {err: `layer ${id} not found in lookup table`}
	if (err) return {err}

	// eslint-disable-next-line guard-for-in
	for (const key in query) {
		if (!query[key]) continue
		if (key==='title') json.title = layer.name()
		if (key==='children') json.children = [].map.call(layer.layers(),
			l=> layersLookupTable[layersLookupTable.add(l)].json)
	}

	return json
}

// layersLookupTable[id].json = {
// 	id,
// 	title: '',
// 	children: [{id}, {id}, {id}],
// }


export default layerQuery
