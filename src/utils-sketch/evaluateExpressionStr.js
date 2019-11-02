// evaluateExpressionStr.js
// LayerRenamer
//
// created by Leonard Pauli, jan 2017 + jun 2018
// copyright © Leonard Pauli 2017-2018

import {layerKindGet} from './layer/misc'
import findLayersUsingRelativePath, {parseRelativePathStrPart} from './layer/findUsingRelativePath'


const evaluateExpressionStrRaw = ({expressionStr, layer, matches, selectionCount, index}, {layerKindName} = {})=> {
	const matchesEvalPrepared = matches.map(match=> !match ? 'null'
		: !isNaN(parseFloat(match))? parseFloat(match)
		: `"${match}"`)

	const expression = substituteCaptureGroupRefs(matchesEvalPrepared)(substituteLayerExpressionFlags({
		expression: expressionStr,
		layer, quoteStrings: true,
		selectionCount, index,
	}))

	return {expression, ...evaluateExpressionStr({expression, layer}, {layerKindName})}
}

const substituteCaptureGroupRefs = matches=> str=> str.replace(/\$(\d+)/g, (id, nr)=>
	(nr = parseInt(nr, 10), nr < matches.length ? matches[nr]: id))

const evaluateExpressionStr = ({expression, layer}, {layerKindName = layerKindGet(layer)} = {})=> {
	const layerKindNames = 'Shape/Group/Artboard/Page/Slice/Bitmap/Text/Symbol/SymbolMaster/Path'.split('/')
	const vars = [
		'var '+layerKindNames.map(s=> s.toLowerCase()+'='+(layerKindName==s?'true':'false')).join(', '),
		'var hidden='+(!layer.isVisible()?'true':'false'),
		'var locked='+(layer.isLocked()?'true':'false'),
	].join(';')

	try {
		// eslint-disable-next-line no-new-func
		const res = Function(`"use strict";${vars};return (${expression});`)()
		return {res}
	} catch (e) { return {err: e} }
}

const substituteLayerExpressionFlags = ({expression, layer, quoteStrings, selectionCount, index})=> {
	const zeroPad = (template, source)=> {
		if (template.length<=1 || quoteStrings) return source
		let txt = ''+source
		if (txt.length>=template.length) return source
		for (let i=template.length-txt.length; i>0; i--) txt = '0'+txt
		return txt
	}
	const quoteString = str=> !quoteStrings? str: `"${str.replace(/"/g, '\\"')}"`

	// TODO: expressionStr.replace(/or/ig, '||').replace(/and/ig, '&&')

	const re = /(%%)|%([<>\d+np-]+)?(?:\.?(-)?([kKtxywh]|n+|N+|i+|I+)|( )|$)/g
	// eslint-disable-next-line max-params, complexity
	return expression.replace(re, (all, escaped, useRelativePath, useReverse, flag, suffix = '')=> (()=> {
		if (escaped) return '%'
		let lyr = layer
		if (useRelativePath) {
			const {path, restStr} = parseRelativePathStrPart(useRelativePath.replace(/^:/ig, '').replace(/p/ig, '<'))
			// TODO: handle restStr
			const layers = findLayersUsingRelativePath([layer], path)
			if (!layers.length) return quoteStrings?null:'?'
			lyr = layers[0]
		}

		if (!flag) flag = 't'
		if (flag.substr(0, 1)=='n') return zeroPad(flag, !useReverse ? selectionCount-1-index : index)
		if (flag.substr(0, 1)=='N') return zeroPad(flag, !useReverse ? selectionCount-index : index+1)
		if (flag=='t') return quoteString(lyr.name())
		if (flag=='x') return lyr.frame().x()
		if (flag=='y') return lyr.frame().y()
		if (flag=='w') return lyr.frame().width()
		if (flag=='h') return lyr.frame().height()
		if (flag=='K') return quoteString(layerKindGet(lyr))
		if (flag=='k') return quoteString(layerKindGet(lyr).toLowerCase())

		const parentLyr = lyr.parentGroup()
		if (!parentLyr) return quoteStrings?null:'?'
			
		const siblings = parentLyr.layers()
		const indexInParent = parentLyr.indexOfLayer_(lyr)
		if (flag.substr(0, 1)=='i') return zeroPad(flag, !useReverse ? siblings.length-indexInParent-1 : indexInParent)
		if (flag.substr(0, 1)=='I') return zeroPad(flag, !useReverse ? siblings.length-indexInParent : indexInParent+1)

		return all
	})()+suffix)
}

export {
	evaluateExpressionStrRaw,
}
