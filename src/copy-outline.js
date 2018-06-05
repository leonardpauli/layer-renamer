// copy-outline.js
// LayerRenamer
//
// created by Leonard Pauli, jan 2017
// copyright © Leonard Pauli 2017-2018

import {scriptDirGet} from './utils'
const scriptDir = scriptDirGet(coscript)

export default function (context) {
	const doc = context.document
	const page = doc.currentPage()
	const selectedLayers = context.selection
	const selectionIsPage = selectedLayers.length==0
	const selection = selectionIsPage? [page]: selectedLayers
	const selectionCount = selection.length

	const defaultFlagsStr = 'pug'
	const userDefaults = NSUserDefaults.standardUserDefaults()
	const pastFlagsStr = userDefaults.objectForKey_('LayerRenamer-outline-flags-value') || defaultFlagsStr

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

	let flagsStr = alert.fields.flags.value
	if (!flagsStr.length()) flagsStr = defaultFlagsStr
	const flagKeys = flagsStr.split(' ')
	const flags = {
		path: true,
		textContent: true,
		status: false,
		kind: false,
		pug: false,
	}
	flagKeys.forEach(key=> {
		let value = key.split('=')
		key = value[0]
		value = value[1]
		if (key[0]=='!') { key=key.substr(1); value=false } else if (value===undefined) value = true
		flags[key] = value
	})

	let txt = ''
	const prefix = ''
	function addLayerSingleRow (layer, prefix) {
		const name = layer.name()
		const kind = getLayerKind(layer)
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
			txt+= strVal.length>80? '.\n'+prefix+'\t'+strVal: ' '
			txt+=strVal
		}
		txt += '\n'
	}

	var loopLayers = function (layers, prefix) {
		layers.slice().reverse().forEach(layer=> {
			addLayerSingleRow(layer, prefix)

			if (!flags.path && getLayerKind(layer)=='Shape') return false
			else if (layer.layers) loopLayers(layer.layers(), prefix+'\t')
		})
	}
	selection.slice().forEach(layer=> {
		addLayerSingleRow(layer, prefix)
		loopLayers(layer.layers(), prefix+'\t')
	})

	NSPasteboard.generalPasteboard().clearContents()
	NSPasteboard.generalPasteboard().setString_forType_(txt, NSStringPboardType)
	doc.showMessage('Page outline copied to clipboard')

	// Save for later
	userDefaults.setObject_forKey_(flagsStr, 'LayerRenamer-outline-flags-value')
}
