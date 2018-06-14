// outlineFromSelectionAsString.js
// LayerRenamer
//
// created by Leonard Pauli, jan 2017 + jun 2018
// copyright © Leonard Pauli 2017-2018

import {layerKindGet} from '../utils-sketch/layer/misc'


/*
const alert = showAlert({
	title: 'Copy '+(selectionIsPage?'page':'selection')+' as outline',
	message: 'Protip: Use ⌘-⎇-F to filter first. Some options are available; status (ie. include locked and hidden status), !path, kind, !textContent, pug',
	fields: {_flags: [defaultFlagsStr, 'Optionally list onptions, like: kind status !path']},
	buttons: ['Copy', 'Cancel'],
	beforeShow (alert) {
		const rawAlert = alert._v.alert()
		
		const filePath = scriptDir+'Resources/icons/copyPageOutlineToClipboard.png'
		const image = NSImage.alloc().initWithContentsOfFile(filePath)
		rawAlert.setIcon(image)
	},
})
if (alert.selected.title=='Cancel') return
*/


// outlineFromSelectionAsString
export default context=> (opt = {})=> {
	const doc = context.document
	const page = doc.currentPage()
	const selectedLayers = context.selection
	const selectionIsPage = selectedLayers.length==0
	const selection = selectionIsPage? [page]: selectedLayers
	const selectionCount = selection.length

	const flags = {...{
		path: true,
		textContent: true,
		status: false,
		kind: false,
		pug: false,
	}, ...opt.flags || {}}

	let txt = ''
	const prefix = ''
	const addLayerSingleRow = (layer, prefix)=> {
		const name = layer.name()
		const kind = layerKindGet(layer)
		if (flags.pug && kind=='Path') return
		if (flags.pug && name=='bg' && kind=='Shape') return
		txt += prefix
		if (flags.pug && name.substr(0, 1).match(/[a-z]/))
			txt += '.'
		txt += name
		if (flags.kind) txt += ': '+kind
		// +(layer.isSelected()?' ✓':'')
		if (flags.status) {
			txt += layer.isLocked()?' 🔒':''
			txt += !layer.isVisible()?' ∅':''
		}
		if (flags.textContent && kind=='Text') {
			const strVal = layer.stringValue()+''
			txt += strVal.length>80? '.\n'+prefix+'\t'+strVal: ' '
			txt += strVal
		}
		txt += '\n'
	}

	const loopLayers = (layers, prefix)=> {
		layers.slice().reverse().forEach(layer=> {
			addLayerSingleRow(layer, prefix)

			if (!flags.path && layerKindGet(layer)=='Shape') return false
			else if (layer.layers) loopLayers(layer.layers(), prefix+'\t')
		})
	}
	selection.slice().forEach(layer=> {
		addLayerSingleRow(layer, prefix)
		loopLayers(layer.layers(), prefix+'\t')
	})

	return txt
}
