// select.js
// LayerRenamer
//
// created by Leonard Pauli, jan 2017
// copyright © Leonard Pauli 2017-2018

import { layersSelect } from '../utils-sketch/layer/misc'
import layersChosenGet from '../utils-sketch/layer/chosenGet'

/*
	const alert = showAlert({
		title: 'Search through and filter '+(selectionCount || 'all')+' layer'+(selectionCount==1 ? '' : 's'),
		message: 'Using RegExp and flags :)',
		fields: {
			_search: [pastSearchStr, 'What should the name match? Leave empty for all'],
			_expression: [pastExpressionStr, 'Try $1 > 3, %N < 4, %p.p.t == "grandparent name", and %x/y/w/h']},
		buttons: selectionCount==0? ['Filter All', 'Cancel'] : ['Search inside', 'Filter selected', 'Cancel'],
		showHelp (alert) {
			showRegExHelpAlert(true)
		},
		width: 400,
		icon: scriptDir+'Resources/icons/layerRenamerSelect.png',
	})
	if (alert.selected.title=='Cancel') return
 */


// layerRenamerSelect
export default context=> search=> {
	const choosenLayers = layersChosenGet({
		search,
		getAllLayers: ()=> context.document.currentPage().layers(),
		getSelectedLayers: ()=> context.selection,
	})

	const {kindFreqs} = layersSelect({
		layers: choosenLayers,
		mode: layersSelect.modes.change,
		context,
	})

	return {msg: getFinalMessage({selectedTypesFreqs: kindFreqs})}
}

const getFinalMessage = ({selectedTypesFreqs})=> {
	const selectedTypes = Object.keys(selectedTypesFreqs)
	const newSelectionCount = selectedTypes.reduce((p, v)=> p+selectedTypesFreqs[v], 0)
	let msg = ''
	if (newSelectionCount==0) msg += 'No layers where selected'
	else {
		msg += 'Selected '
		msg += newSelectionCount==1? 'one': newSelectionCount
		msg += ' '
		
		const ending = newSelectionCount==1?'':'s'
		if (!selectedTypes.length || selectedTypes.length>3) msg += 'layer'+ending
		else if (selectedTypes.length==1) msg += selectedTypes[0].toLowerCase()+ending
		else {
			selectedTypes.forEach((name, idx)=> {
				if (idx) msg += idx == selectedTypes.length-1 ? ' and ': ', '
				msg += name.toLowerCase()+ending
			})
		}
	}
	return msg
}
