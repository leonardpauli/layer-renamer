// select.js
// LayerRenamer
// 
// created by Leonard Pauli, jan 2017
// copyright © Leonard Pauli 2017-2018

var layerRenamerSelect = function(context) {
	dLog('👉'+paddStringToLength('  Layer name', 24, true)
			 +paddStringToLength('Matches', 40, true)
			 +paddStringToLength('Expression', 40, true))
	var doc = context.document
	var page = doc.currentPage()
	var selection = context.selection
	var selectionCount = selection.count()

	// Get past values
	var defaultSearchStr = '^(.+)$'
	var defaultExpressionStr = '!artboard'
	var userDefaults = NSUserDefaults.standardUserDefaults()
	var pastSearchStr = userDefaults.objectForKey_("LayerRenamer-search-value") || defaultSearchStr
	var pastExpressionStr = userDefaults.objectForKey_("LayerRenamer-expression-value") || defaultExpressionStr
	if (pastSearchStr==defaultSearchStr) pastSearchStr = ''
	//if (pastExpressionStr==defaultExpressionStr) pastExpressionStr = ''

	var alert = showAlert({
		title: 'Search through and filter '+(selectionCount || 'all')+' layer'+(selectionCount==1 ? '' : 's'),
		message: 'Using RegExp and flags :)',
		fields: {
			_search: [pastSearchStr, 'What should the name match? Leave empty for all'],
			_expression: [pastExpressionStr, 'Try $1 > 3, %N < 4, %p.p.t == "grandparent name", and %x/y/w/h']},
		buttons: selectionCount==0? ['Filter All','Cancel'] : ['Search inside', 'Filter selected', 'Cancel'],
		showHelp: function (alert) {
			showRegExHelpAlert(true)
		},
		width: 400,
		icon: scriptDir+'Resources/icons/layerRenamerSelect.png'
	})
	if (alert.selected.title=='Cancel') return;

	var searchStr = alert.fields.search.value
	if (!searchStr.length()) searchStr = defaultSearchStr
	userDefaults.setObject_forKey_(searchStr, "LayerRenamer-search-value")

	// Take out relative selection path string
	var relativePathMatch = searchStr.match(/(?:[^\\]|^):([<>n\d+-]+)$/)
	var relativePath = relativePathMatch ? relativePathMatch[1] : null
	if (relativePath) searchStr = searchStr.substr(0,searchStr.length-relativePath.length-1)

	var reg = new RegExp(searchStr, 'i')
	var expressionStr = alert.fields.expression.value
	if (!expressionStr.length()) expressionStr = defaultExpressionStr
	userDefaults.setObject_forKey_(expressionStr, "LayerRenamer-expression-value")
	expressionStr = expressionStr.replace(/or/ig, '||').replace(/and/ig, '&&')

	var shouldFilterAll = alert.selected.title == 'Filter All'
	var shouldFilterSelected = alert.selected.title == 'Filter selected'
	var shouldFilterInside = alert.selected.title == 'Search inside'

	if (shouldFilterAll) {
		selection = page.layers()
		selectionCount = selection.count()
		shouldFilterSelected = shouldFilterInside = true}

	var layersToBeSelected = []
	var currIterationIdx = 0
	var handleLayer = function(layer, depth) {
		function digDeeper() {
			if (!layer.layers) return false;
			return layer.layers().some(function(layer) {
				return handleLayer(layer, depth+1)})}

		var name = layer.name()
		var matches = name.match(reg)
		if (!matches) {
			//layer.setIsSelected(false)
			if (shouldFilterInside) return digDeeper()
			else return false}
		//if (!shouldFilterInside && depth>0) return false;

		// Populate expression flags
		var str = replaceLayerExpressionFlags(expressionStr, layer, true, selectionCount, currIterationIdx)
		currIterationIdx++
		
		// Populate capture groups
		matches = matches.map(function(match, index) {
			if (!match) return 'null'
			var asNr = parseFloat(match)
			return isNaN(asNr)? '"'+match+'"': asNr})
		str = str.replace(/\$(\d+)/g, function(wholeMatch, nr) {
			var nr = parseInt(nr)
			return nr<matches.length ? matches[nr]: wholeMatch})

		// Setup expression variables
		var layerKindName = getLayerKind(layer)
		var vars = 'var '+'Shape/Group/Artboard/Page/Slice/Bitmap/Text/Symbol/SymbolMaster/Path'.split('/').map(function(name) {
			return name.toLowerCase()+'='+(layerKindName==name?'true':'false')
		}).join(', ')+';'
		vars += 'var '+'hidden'+'='+(!layer.isVisible()?'true':'false')+';'
		vars += 'var '+'locked'+'='+(layer.isLocked()?'true':'false')+';'

		// Try evaluate expression and (de)select current layer
		try {
			var res = eval(vars+str)
			var couldSelect = (shouldFilterSelected && depth==0) || (shouldFilterInside && depth>0)
			var shouldSelect =  couldSelect && !!res

			dLog((shouldSelect? '✅': '😡')+paddStringToLength('  '+name, 24, true)
			 +paddStringToLength((!matches?'null':'['+matches.join(', ')+']'), 40, true)
			 +paddStringToLength(str, 40, true))

			//layer.setIsSelected(shouldSelect)
			if (shouldSelect) layersToBeSelected.push(layer)

			// Shape is really a group, even if it doesn't
			// look that way if it only contains one
			if (layerKindName=='Shape' && layer.layers().count()==1)
				return false

			if (layerKindName=='Group' || layerKindName=='Artboard') {
				if (shouldSelect || !shouldFilterInside) return false
			} else if (!shouldFilterInside && !res) return false
		} catch(e) {
			var alert = showAlert({
				title:'Expression error',
				message:
					'Layer: "'+name+'"'
					+'\nExpression: "'+str+'"'
					+'\nError: "'+e+'"',
				buttons: ['Abort', 'Continue']
			})
			if (alert.selected.title=='Abort')
				return true
			//layer.setIsSelected(false)
			return false;
		}

		return digDeeper()
	}
	selection.some(function(layer){return handleLayer(layer, 0)})


	var selectedTypesFreqs = {}
	var addLayerKindToFreqs = function(layerKindName) {
		if (!selectedTypesFreqs[layerKindName]) selectedTypesFreqs[layerKindName] = 0
		selectedTypesFreqs[layerKindName]++}

	layersToBeSelected = !relativePath? layersToBeSelected:
		findLayersUsingRelativePath(layersToBeSelected, relativePath)

	context.api().selectedDocument.selectedLayers.clear()
	layersToBeSelected.forEach(function(layer) {
		if (layer.isSelected()) return;
		addLayerKindToFreqs(getLayerKind(layer))
		log(layer.select_byExtendingSelection_(true, true))
		//log(layer.select_byExtendingSelection_)
		//layer.addToSelection()
	})


	// Message
	var selectedTypes = Object.keys(selectedTypesFreqs)
	var newSelectionCount = selectedTypes.reduce(function(p,v) {return p+selectedTypesFreqs[v]}, 0)
	var msg = ''
	if (newSelectionCount==0) msg += 'No layers where selected'
	else {
		msg += 'Selected '
		msg += newSelectionCount==1? 'one': newSelectionCount
		msg += ' '
		
		var ending = newSelectionCount==1?'':'s'
		if (!selectedTypes.length || selectedTypes.length>3) msg += 'layer'+ending
		else if (selectedTypes.length==1) msg += selectedTypes[0].toLowerCase()+ending
		else {
			selectedTypes.forEach(function(name,idx) {
				if (idx) msg += idx == selectedTypes.length-1 ? ' and ': ', '
				msg += name.toLowerCase()+ending})
		}
	}
		
	doc.showMessage(msg)
}
