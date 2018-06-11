// layersChosenGet.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import {evaluateExpressionStrRaw} from './evaluateExpressionStr'
import findLayersUsingRelativePath, {parseRelativePathStrPart} from './findLayersUsingRelativePath'
import {layerKindGet} from './layers'
import {dlog, regexEscape} from './misc'
import config from '../config'


// layersChosenGet
export default ({
	search: { options, value: searchStr = '' },
	shouldContinueOnExpressionError = o=> (dlog(o), false),
	getAllLayers, getSelectedLayers,
} = {})=> {

	const opt = {
		scope: config.search.scope.all,
		regex: false,
		path: false,
		expression: false,
		caseSensitive: false,
		globalMatch: false,
		...options,
	}

	const expressionMatch = searchStr.match(/(?:[^\\]|^):\((.+)\)$/)
	const expressionStr = opt.path && expressionMatch ? expressionMatch[1] : null
	if (expressionStr) searchStr = searchStr.substr(0, searchStr.length-expressionStr.length-1)

	const relativePathMatch = searchStr.match(/(?:[^\\]|^):([<>n\d+-]+)$/)
	const relativePath = opt.path && relativePathMatch ? relativePathMatch[1] : null
	if (relativePath) searchStr = searchStr.substr(0, searchStr.length-relativePath.length-1)
	
	if (!searchStr && opt.regex) searchStr = '(.+)'

	const reg = new RegExp(
		opt.regex ? searchStr : regexEscape(searchStr),
		[!opt.caseSensitive && 'i', opt.globalMatch && 'g'].filter(Boolean).join(''))

	const selection = opt.scope === config.search.scope.all ? getAllLayers() : getSelectedLayers()
	const shouldFilterSelected = opt.scope <= config.search.scope.onlySelected
	const shouldFilterInside = opt.scope != config.search.scope.onlySelected
	const selectionCount = selection.count()

	const {layers: filteredLayers, err} = handleLayersGet({
		reg, expressionStr: expressionStr || 'true',
		shouldFilterSelected, shouldFilterInside,
		selectionCount, shouldContinueOnExpressionError,
	})(selection)

	if (err) return {err, layers: filteredLayers}

	const {path: relPath, restStr: relPathRestStr} = parseRelativePathStrPart(relativePath || '')
	// TODO: handle relPathRestStr + rename to relativePathStr etc
	const choosenLayers = relativePath && relPath.length
		? findLayersUsingRelativePath(filteredLayers, relPath)
		: filteredLayers
		
	return {layers: choosenLayers}
}


const handleLayersGet = opt=> {
	const state = {index: 0, layers: []}
	const handleLayer = handleLayerInner(opt, state)
	return xs=> ([].some.call(xs, l=> handleLayer(l)), state)
}

// returns if should stop
const handleLayerInner = (opt, state)=> (layer, depth = 0)=> {
	const digDeeper = ()=> !layer.layers? false: layer.layers().some(layer=>
		handleLayerInner(opt, state)(layer, depth+1))

	const {
		reg, expressionStr,
		shouldFilterSelected, shouldFilterInside,
		selectionCount, shouldContinueOnExpressionError,
	} = opt

	const name = String(layer.name())
	const matches = name.match(reg)
	if (!matches) return shouldFilterInside? digDeeper(): false

	const layerKindName = layerKindGet(layer)

	const {err, res, expression} = evaluateExpressionStrRaw({expressionStr, layer, matches, selectionCount, index: state.index++}, {layerKindName})
	if (err) return !shouldContinueOnExpressionError({layerName: name, expression, err})
	
	// logic
	const couldSelect = (shouldFilterSelected && depth==0) || (shouldFilterInside && depth>0)
	const shouldSelect = couldSelect && !!res
	if (shouldSelect) state.layers.push(layer)

	// Shape is really a group, even if it doesn't look that way if it only contains one
	const treatSingleChildAsParent = layerKindName=='Shape'
	const childCount = layer.layers && layer.layers().count() || 0

	if (!childCount) return false
	if (treatSingleChildAsParent && childCount==1) return false
	if (shouldSelect || !shouldFilterInside) return false

	return digDeeper()
}
