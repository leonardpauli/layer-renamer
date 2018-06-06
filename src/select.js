// select.js
// LayerRenamer
//
// created by Leonard Pauli, jan 2017
// copyright © Leonard Pauli 2017-2018

import {findLayersUsingRelativePath, replaceLayerExpressionFlags, transformStringCaseUsingFlags} from './custom-utils'
import {getLayerKind} from './utils'


const layerRenamerSelect = function (context) {
	// dLog('👉'+paddStringToLength('  Layer name', 24, true)+
	// 		 paddStringToLength('Matches', 40, true)+
	// 		 paddStringToLength('Expression', 40, true))

	const doc = context.document
	const page = doc.currentPage()
	let {selection} = context
	let selectionCount = selection.count()

	// Get past values
	const defaultSearchStr = '^(.+)$'
	const defaultExpressionStr = '!artboard'
	const userDefaults = NSUserDefaults.standardUserDefaults()
	let pastSearchStr = userDefaults.objectForKey_('LayerRenamer-search-value') || defaultSearchStr
	const pastExpressionStr = userDefaults.objectForKey_('LayerRenamer-expression-value') || defaultExpressionStr
	if (pastSearchStr==defaultSearchStr) pastSearchStr = ''
	// if (pastExpressionStr==defaultExpressionStr) pastExpressionStr = ''

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

	let searchStr = alert.fields.search.value
	if (!searchStr.length()) searchStr = defaultSearchStr
	userDefaults.setObject_forKey_(searchStr, 'LayerRenamer-search-value')

	// Take out relative selection path string
	const relativePathMatch = searchStr.match(/(?:[^\\]|^):([<>n\d+-]+)$/)
	const relativePath = relativePathMatch ? relativePathMatch[1] : null
	if (relativePath) searchStr = searchStr.substr(0, searchStr.length-relativePath.length-1)

	const reg = new RegExp(searchStr, 'i')
	let expressionStr = alert.fields.expression.value
	if (!expressionStr.length()) expressionStr = defaultExpressionStr
	userDefaults.setObject_forKey_(expressionStr, 'LayerRenamer-expression-value')
	expressionStr = expressionStr.replace(/or/ig, '||').replace(/and/ig, '&&')

	const shouldFilterAll = alert.selected.title == 'Filter All'
	let shouldFilterSelected = alert.selected.title == 'Filter selected'
	let shouldFilterInside = alert.selected.title == 'Search inside'

	if (shouldFilterAll) {
		selection = page.layers()
		selectionCount = selection.count()
		shouldFilterSelected = shouldFilterInside = true
	}

	let layersToBeSelected = []
	let currIterationIdx = 0
	const handleLayer = (layer, depth)=> {
		const digDeeper = ()=> !layer.layers? false : layer.layers().some(layer=> handleLayer(layer, depth+1))

		const name = layer.name()
		let matches = name.match(reg)
		if (!matches) {
			// layer.setIsSelected(false)
			if (shouldFilterInside) return digDeeper()
			return false
		}
		// if (!shouldFilterInside && depth>0) return false;

		// Populate expression flags
		let str = replaceLayerExpressionFlags(expressionStr, layer, true, selectionCount, currIterationIdx)
		currIterationIdx++
		
		// Populate capture groups
		matches = matches.map((match, index)=> {
			if (!match) return 'null'
			const asNr = parseFloat(match)
			return isNaN(asNr)? '"'+match+'"': asNr
		})
		str = str.replace(/\$(\d+)/g, (wholeMatch, nr)=> {
			nr = parseInt(nr, 10)
			return nr < matches.length ? matches[nr]: wholeMatch
		})

		// Setup expression variables
		const layerKindName = getLayerKind(layer)
		let vars = 'var '+'Shape/Group/Artboard/Page/Slice/Bitmap/Text/Symbol/SymbolMaster/Path'.split('/').map(name=> name.toLowerCase()+'='+(layerKindName==name?'true':'false')).join(', ')+';'
		vars += 'var hidden='+(!layer.isVisible()?'true':'false')+';'
		vars += 'var locked='+(layer.isLocked()?'true':'false')+';'

		// Try evaluate expression and (de)select current layer
		try {
			// eslint-disable-next-line no-new-func
			const res = Function(`"use strict";${vars};return (${str});`)()
			const couldSelect = (shouldFilterSelected && depth==0) || (shouldFilterInside && depth>0)
			const shouldSelect = couldSelect && !!res

			// dLog((shouldSelect? '✅': '😡')+paddStringToLength('  '+name, 24, true)+
			//  paddStringToLength(!matches?'null':'['+matches.join(', ')+']', 40, true)+
			//  paddStringToLength(str, 40, true))

			// layer.setIsSelected(shouldSelect)
			if (shouldSelect) layersToBeSelected.push(layer)

			// Shape is really a group, even if it doesn't
			// look that way if it only contains one
			if (layerKindName=='Shape' && layer.layers().count()==1)
				return false

			if (layerKindName=='Group' || layerKindName=='Artboard') {
				if (shouldSelect || !shouldFilterInside) return false
			} else if (!shouldFilterInside && !res) return false
		} catch (e) {
			const alert = showAlert({
				title: 'Expression error',
				message:
					'Layer: "'+name+'"'+
					'\nExpression: "'+str+'"'+
					'\nError: "'+e+'"',
				buttons: ['Abort', 'Continue'],
			})
			if (alert.selected.title=='Abort')
				return true
			// layer.setIsSelected(false)
			return false
		}

		return digDeeper()
	}
	selection.some(layer=> handleLayer(layer, 0))


	const selectedTypesFreqs = {}
	const addLayerKindToFreqs = function (layerKindName) {
		if (!selectedTypesFreqs[layerKindName]) selectedTypesFreqs[layerKindName] = 0
		selectedTypesFreqs[layerKindName]++
	}

	layersToBeSelected = !relativePath? layersToBeSelected:
		findLayersUsingRelativePath(layersToBeSelected, relativePath)

	context.api().selectedDocument.selectedLayers.clear()
	layersToBeSelected.forEach(layer=> {
		if (layer.isSelected()) return
		addLayerKindToFreqs(getLayerKind(layer))
		log(layer.select_byExtendingSelection_(true, true))
		// log(layer.select_byExtendingSelection_)
		// layer.addToSelection()
	})


	// Message
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
		
	doc.showMessage(msg)
}
