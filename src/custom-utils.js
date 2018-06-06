// custom-utils.js
// LayerRenamer
//
// created by Leonard Pauli, jan 2017
// copyright © Leonard Pauli 2017-2018


import {scriptDirGet, getLayerKind} from './utils'
const scriptDir = scriptDirGet(coscript)


const replaceLayerExpressionFlags = (expression, layer, quoteStrings, selectionCount, i)=> {
	const zeroPad = (template, source)=> {
		if (template.length<=1 || quoteStrings) return source
		let txt = ''+source
		if (txt.length>=template.length) return source
		for (let i=template.length-txt.length; i>0; i--) txt = '0'+txt
		return txt
	}
	const quoteString = str=> !quoteStrings? str: `"${str.replace(/"/g, '\\"')}"`

	const re = /(%%)|%([<>\d+np-]+)?(?:\.?(-)?([kKtxywh]|n+|N+|i+|I+)|( )|$)/g
	// eslint-disable-next-line max-params, complexity
	return expression.replace(re, (all, escaped, useRelativePath, useReverse, flag, suffix = '')=> (()=> {
		if (escaped) return '%'
		let lyr = layer
		if (useRelativePath) {
			const layers = findLayersUsingRelativePath([layer], useRelativePath.replace(/p/ig, '<'))
			if (!layers.length) return quoteStrings?null:'?'
			lyr = layers[0]
		}

		if (!flag) flag = 't'
		if (flag.substr(0, 1)=='n') return zeroPad(flag, !useReverse ? selectionCount-1-i : i)
		if (flag.substr(0, 1)=='N') return zeroPad(flag, !useReverse ? selectionCount-i : i+1)
		if (flag=='t') return quoteString(lyr.name())
		if (flag=='x') return lyr.frame().x()
		if (flag=='y') return lyr.frame().y()
		if (flag=='w') return lyr.frame().width()
		if (flag=='h') return lyr.frame().height()
		if (flag=='K') return quoteString(getLayerKind(lyr))
		if (flag=='k') return quoteString(getLayerKind(lyr).toLowerCase())

		const parentLyr = lyr.parentGroup()
		if (!parentLyr) return quoteStrings?null:'?'
			
		const siblings = parentLyr.layers()
		const indexInParent = parentLyr.indexOfLayer_(lyr)
		if (flag.substr(0, 1)=='i') return zeroPad(flag, !useReverse ? siblings.length-indexInParent-1 : indexInParent)
		if (flag.substr(0, 1)=='I') return zeroPad(flag, !useReverse ? siblings.length-indexInParent : indexInParent+1)

		return all
	})()+suffix)
}



const findLayersUsingRelativePath = (baseLayers, path)=> {
	const layers = []
	const direction = path.match(/^:?(([<>])|((\d+n)?(([+-])?\d+)?))/)
	if (!direction) throw new Error(`Path "${path}" isn't valid`)
	const [
		directionWhole,
		,
		directionUpDown,
		directionNr,
		directionModulusK,
		directionModulusM,
		directionRelative,
	] = direction
	const restPath = path.substr(directionWhole.length)

	if (directionUpDown=='<') {
		baseLayers.forEach(layer=> {
			if (layer.parentGroup) {
				const parent = layer.parentGroup()
				if (layers.indexOf(parent) < 0)
					layers.push(parent)
			}
		})
	} else if (directionUpDown=='>') {
		baseLayers.forEach(layer=> {
			if (layer.layers) layer.layers()
				.forEach(l=> { layers.push(l) })
		})
	} else if (!directionNr || !directionNr.length) { // containing group
		throw new Error(`Path "${path}" isn't valid`)
	} else {
		const usingModulus = !!directionModulusK
		const k = usingModulus? parseInt(directionModulusK, 10) : 1
		const m = directionModulusM? parseInt(directionModulusM, 10) : 0
		const doRelative = directionRelative

		baseLayers.forEach((layer, idx)=> {
			const index = baseLayers.length-idx-1
			if (usingModulus) {
				if ((index+m)%k == 0)
					layers.push(layer)
			} else {
				if (!layer.parentGroup) return
				const parent = layer.parentGroup()
				const siblings = parent.layers()

				let targetIdx = !doRelative? siblings.length-1-m : siblings.indexOf(layer) - m
				if (targetIdx < 0) targetIdx += siblings.length
				if (targetIdx >= 0 && targetIdx < siblings.length)
					layers.push(siblings[targetIdx])
			}
		})
	}

	return !restPath.length? layers:
		findLayersUsingRelativePath(layers, restPath)
}


// transformStringCaseUsingFlags
const transformCaseRE = /(?:\\([LUCKESTW])((?:.|\s)+?)(?=(?:\\[LUCKESTW])|$))/g
const toKebabCase = s=> s
	.replace(/([a-z])([A-Z])/g, (_, f, l)=> f+'-'+l) // convert camel/title case
	.toLowerCase() // discard case information
	.replace(/_(\w)/ig, (_, l)=> '-'+l) // convert snake case
	.replace(/ (\w)/ig, (_, l)=> '-'+l) // convert word case
const transformers = {
	L: s=> s.toLowerCase(), // lowercase
	U: s=> s.toUpperCase(), // UPPERCASE
	C: s=> toKebabCase(s).replace(/-(\w)/ig, (_, l)=> l.toUpperCase()), // camelCase
	K: s=> toKebabCase(s), // kebab-case
	E: s=> s, // end
	S: s=> toKebabCase(s).replace(/-(\w)/ig, (_, l)=> '_'+l), // snake_case
	T: s=> toKebabCase(s).replace(/(^|-)(\w)/ig, (_1, _2, l)=> l.toUpperCase()), // TitleCase
	W: s=> toKebabCase(s).replace(/-(\w)/ig, (_, l)=> ' '+l), // word case
}
// var str = "\\Klowercase \\KUPPERCASE \\KcamelCase \\Kkebab-case \\Kend \\Ksnake_case \\KTitleCase"
// str += "\n\\LlowerCase \\UupperCase \\CcamelCase \\KkebabCase \\Eend \\SsnakeCase \\TtitleCase"
const transformStringCaseUsingFlags = str=> str.replace(transformCaseRE, (all, flag, str)=> transformers[flag](str))


export {
	findLayersUsingRelativePath,
	replaceLayerExpressionFlags,
	transformStringCaseUsingFlags,
}
