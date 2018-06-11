// layerQuery.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import {layerKindGet} from './layers'
import layerQuery from './layerQuery'
import arrayDeltaActions from './arrayDeltaActions'

const rndstr = ()=> Math.random().toString(32).substr(2, 8)

/*
it('rndstr', ()=> {
	Array(100).fill().map(rndstr).each(v=> expect(v).toMatch(/^[A-z0-9]{8}$/))
	expect(rndstr()).not.toBe(rndstr())
})
*/

const layersLookupTableGet = ()=> Object.create({}, {
	add: {
		enumerable: false,
		value (layer, {id = rndstr(), json = {id}} = {}) {
			return this[id] = {layer, json}, id
		},
	},
})

/*
it('layersLookupTable', ()=> {
	const myLayer = {name: ()=> 'my'}
	const table = layersLookupTableGet()
	const id = table.add(myLayer)
	expect(table[id].layer).toBe(myLayer)
	expect(table[id].json.id).toBe(id)
	expect(JSON.parse(JSON.stringify(table[id].json))).toMatch(table[id].json)
	expect(Object.keys(table)).toMatch([id])
})
*/

const layerUpdate = (context, layersLookupTable)=> (id, fields)=> {
	const updateDelta = layerUpdateDelta(context)

	const {layer, json, err} = layersLookupTable[id]
		|| {err: `layer ${id} not found in lookup table`}
	if (err) return {err}

	layerQuery(context, layersLookupTable)(id, { // populates json
		...Object.keys(fields).reduce((o, k)=> (o[k] = true, o), {}),
	})


	// eslint-disable-next-line guard-for-in
	for (const key in fields) {
		const primitiveKeys = 'hidden,locked'.split(',')

		let action = 'set'
		let value = fields[key]
		if (key==='children') {
			const diff = [...arrayDeltaActions(json[key], value)]
				.map(({add, x, move, fr: f, at: i})=>
					add? {action: 'add', at: i.rel, value: x.x}
						: move? {action: 'move', at: i.rel, from: f.rel}
							: {action: 'remove', at: i.rel}
				)

			for (let i = 0; i < diff.length; i++) {
				const {err} = updateDelta({id, key, ...diff[i]})
				if (err) return {err}
			}
		} else if (primitiveKeys.includes(key)) {
			if (json[key] === fields[key]) continue
			action = 'set', value = fields[key]
		} else return {err: `layerUpdate: unknown key '${key}'`}
		
		const {err} = updateDelta({id, key, action, value})
		if (err) return {err}
	}

	return {ok: true}
}

const layerUpdateDelta = (context, layersLookupTable)=> ({
	id,
	key,
	action,
	...rest // eg. value
})=> {

	const {layer, json, err} = layersLookupTable[id]
		|| {err: `layer ${id} not found in lookup table`}
	if (err) return {err}

	const fieldUpdater = {
		hidden: {set: ({layer, json, value})=> layer.setHidden(json.hidden = value)},
		locked: {set: ({layer, json, value})=> layer.setLocked(json.locked = value)},
	}[key]; if (!fieldUpdater) return {
		err: `layerUpdateDelta: layer key '${key}' not yet supported`}

	const fieldUpdaterAction = fieldUpdater[action]; if (!fieldUpdaterAction) return {
		err: `layerUpdateDelta: action '${action}' on key '${key}' not yet supported`}

	return fieldUpdaterAction({layer, json, ...rest})
}


export default layerUpdate
export {
	layerUpdateDelta,
}
