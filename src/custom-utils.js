// custom-utils.js
// LayerRenamer
//
// created by Leonard Pauli, jan 2017
// copyright © Leonard Pauli 2017-2018


const scriptDir = scriptDirGet(coscript)


function replaceLayerExpressionFlags (expression, layer, quoteStrings, selectionCount, i) {
	const zeroPad = function (template, source) {
		if (template.length<=1 || quoteStrings) return source
		let txt = ''+source
		if (txt.length>=template.length) return source
		for (let i=template.length-txt.length; i>0; i--) txt = '0'+txt
		return txt
	}
	const quoteString = function (str) {
		if (!quoteStrings) return str
		return '"'+ str.replace(new RegExp('"', 'g'),
			'\\"') +'"'
	}

	return expression.replace(/(%%)|%([<>\d+np-]+)?(?:\.?(-)?([kKtxywh]|n+|N+|i+|I+)|( )|$)/g,
		(all, escaped, useRelativePath, useReverse, flag, suffix)=> {
			if (!suffix) suffix = ''
			return (function () {
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
			}())+suffix
		})
}



var findLayersUsingRelativePath = function (baseLayers, path) {
	const layers = []
	const direction = path.match(/^:?(([<>])|((\d+n)?(([+-])?\d+)?))/)
	if (!direction) throw 'Path "'+path+'" isn\'t valid'
	const restPath = path.substr(direction[0].length)

	if (direction[2]=='<') {
		baseLayers.forEach(layer=> {
			if (layer.parentGroup) {
				const parent = layer.parentGroup()
				if (layers.indexOf(parent)<0)
					layers.push(parent)
			}
		})
	} else if (direction[2]=='>') {
		baseLayers.forEach(layer=> {
			if (layer.layers) layer.layers()
				.forEach(l=> { layers.push(l) })
		})
	} else if (!direction[3] || !direction[3].length) { // containing group
		throw 'Path "'+path+'" isn\'t valid.'
	} else {
		const usingModulus = !!direction[4]
		const k = usingModulus? parseInt(direction[4]) : 1
		const m = direction[5]? parseInt(direction[5]) : 0
		const doRelative = direction[6]

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
				if (targetIdx<0) targetIdx += siblings.length
				if (targetIdx>=0 && targetIdx<siblings.length)
					layers.push(siblings[targetIdx])
			}
		})
	}

	return !restPath.length? layers:
		findLayersUsingRelativePath(layers, restPath)
}



const transformStringCaseUsingFlags = function (str) {
	// var str = "\\Klowercase \\KUPPERCASE \\KcamelCase \\Kkebab-case \\Kend \\Ksnake_case \\KTitleCase"
	// str += "\n\\LlowerCase \\UupperCase \\CcamelCase \\KkebabCase \\Eend \\SsnakeCase \\TtitleCase"
	return str.replace(/(?:\\([LUCKESTW])((?:.|\s)+?)(?=(?:\\[LUCKESTW])|$))/g, (all, flag, str)=> {
		const toKebabCase = function (str) {
			return str
				.replace(/([a-z])([A-Z])/g, (_, f, l)=> f+'-'+l) // convert camel/title case
				.toLowerCase() // discard case information
				.replace(/_(\w)/ig, (_, l)=> '-'+l) // convert snake case
				.replace(/ (\w)/ig, (_, l)=> '-'+l) // convert word case
		}
		const transformers = {
			L (str) { // lowercase
				return str.toLowerCase()
			},
			U (str) { // UPPERCASE
				return str.toUpperCase()
			},
			C (str) { // camelCase
				return toKebabCase(str).replace(/-(\w)/ig, (_, l)=> l.toUpperCase())
			},
			K (str) { // kebab-case
				return toKebabCase(str)
			},
			E (str) { // end
				return str
			},
			S (str) { // snake_case
				return toKebabCase(str).replace(/-(\w)/ig, (_, l)=> '_'+l)
			},
			T (str) { // TitleCase
				return toKebabCase(str).replace(/(^|-)(\w)/ig, (_1, _2, l)=> l.toUpperCase())
			},
			W (str) { // word case
				return toKebabCase(str).replace(/-(\w)/ig, (_, l)=> ' '+l)
			},
		}
		return transformers[flag](str)
	})
}
