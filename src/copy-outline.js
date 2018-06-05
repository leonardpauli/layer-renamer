// copy-outline.js
// LayerRenamer
// 
// created by Leonard Pauli, jan 2017
// copyright © Leonard Pauli 2017-2018

import {scriptDirGet} from './utils'
const scriptDir = scriptDirGet(coscript)

export default function(context) {
	var doc = context.document
	var page = doc.currentPage()
	var selectedLayers = context.selection
	var selectionIsPage = selectedLayers.length==0
	var selection = selectionIsPage? [page]: selectedLayers
	var selectionCount = selection.length

	var defaultFlagsStr = 'pug'
	var userDefaults = NSUserDefaults.standardUserDefaults()
	var pastFlagsStr = userDefaults.objectForKey_("LayerRenamer-outline-flags-value") || defaultFlagsStr

	var alert = showAlert({
		title: 'Copy '+(selectionIsPage?'page':'selection')+' as outline',
		message: 'Protip: Use ⌘-⎇-F to filter first. Some options are available; status (ie. include locked and hidden status), !path, kind, !textContent, pug',
		fields: {_flags:[defaultFlagsStr,'Optionally list onptions, like: kind status !path']},
		buttons: ['Copy','Cancel'],
		beforeShow: function (alert) {
			var rawAlert = alert._v.alert()
			
			var filePath = scriptDir+'Resources/icons/copyPageOutlineToClipboard.png'
			var image = NSImage.alloc().initWithContentsOfFile(filePath)
			rawAlert.setIcon(image)
		}
	})
	if (alert.selected.title=='Cancel') return;

	var flagsStr = alert.fields.flags.value
	if (!flagsStr.length()) flagsStr = defaultFlagsStr
	var flagKeys = flagsStr.split(' ')
	var flags = {
		path: true,
		textContent: true,
		status: false,
		kind: false,
		pug: false
	}
	flagKeys.forEach(function(key) {
		var value = key.split('=')
		key = value[0]
		value = value[1]
		if (key[0]=='!') {key=key.substr(1);value=false}
		else if (value===undefined) value = true
		flags[key] = value
	})

	var txt = ''
	var prefix = ''
	function addLayerSingleRow(layer, prefix) {
		var name = layer.name()
		var kind = getLayerKind(layer)
		if (flags.pug && kind=='Path') return;
		if (flags.pug && name=='bg' && kind=='Shape') return;
		txt += prefix
		if (flags.pug && name.substr(0,1).match(/[a-z]/))
			txt += '.'
		txt += name
		if (flags.kind) txt += ': '+kind
			//+(layer.isSelected()?' ✓':'')
		if (flags.status) {
			txt += (layer.isLocked()?' 🔒':'')
			txt += (!layer.isVisible()?' ∅':'')}
		if (flags.textContent && kind=='Text') {
			var strVal = layer.stringValue()+''
			txt+= (strVal.length>80)? '.\n'+prefix+'\t'+strVal: ' '
			txt+=strVal}
		txt += '\n'}

	var loopLayers = function(layers, prefix) {
		layers.slice().reverse().forEach(function(layer) {
			addLayerSingleRow(layer, prefix)

			if (!flags.path && getLayerKind(layer)=='Shape') return false;
			else if (layer.layers) loopLayers(layer.layers(), prefix+'\t')
		})
	}
	selection.slice().forEach(function(layer) {
		addLayerSingleRow(layer, prefix)	
		loopLayers(layer.layers(), prefix+'\t')
	})

	NSPasteboard.generalPasteboard().clearContents()
	NSPasteboard.generalPasteboard().setString_forType_(txt, NSStringPboardType)
	doc.showMessage("Page outline copied to clipboard")

	// Save for later
	userDefaults.setObject_forKey_(flagsStr, "LayerRenamer-outline-flags-value")
}
