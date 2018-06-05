// custom-utils.js
// LayerRenamer
// 
// created by Leonard Pauli, jan 2017
// copyright © Leonard Pauli 2017-2018


const scriptDir = scriptDirGet(coscript)


function replaceLayerExpressionFlags(expression, layer, quoteStrings, selectionCount, i) {
	var zeroPad = function (template, source) {
		if (template.length<=1 || quoteStrings) return source
		var txt = ''+source
		if (txt.length>=template.length) return source
		for (var i=template.length-txt.length; i>0; i--) txt = '0'+txt
		return txt}
	var quoteString = function(str) {
		if (!quoteStrings) return str
		return '"'+ str.replace(new RegExp('"', 'g'),
			'\\"') +'"'}

	return expression.replace(/(%%)|%([<>\d+np-]+)?(?:\.?(-)?([kKtxywh]|n+|N+|i+|I+)|( )|$)/g,
		function(all, escaped, useRelativePath, useReverse, flag, suffix) {
			if (!suffix) suffix = ''
			return (function(){
			if (escaped) return '%'
			var lyr = layer
			if (useRelativePath) {
				var layers = findLayersUsingRelativePath([layer], useRelativePath.replace(/p/ig, '<'))
				if (!layers.length) return quoteStrings?null:'?'
				lyr = layers[0]
			}

			if (!flag) flag = 't'
			if (flag.substr(0,1)=='n') return zeroPad(flag, !useReverse ? selectionCount-1-i : i)
			if (flag.substr(0,1)=='N') return zeroPad(flag, !useReverse ? selectionCount-i   : i+1)
			if (flag=='t') return quoteString(lyr.name())
			if (flag=='x') return lyr.frame().x()
			if (flag=='y') return lyr.frame().y()
			if (flag=='w') return lyr.frame().width()
			if (flag=='h') return lyr.frame().height()
			if (flag=='K') return quoteString(getLayerKind(lyr))
			if (flag=='k') return quoteString(getLayerKind(lyr).toLowerCase())

			var parentLyr = lyr.parentGroup()
			if (!parentLyr) return quoteStrings?null:'?'
			
			var siblings = parentLyr.layers()
			var indexInParent = parentLyr.indexOfLayer_(lyr)
			if (flag.substr(0,1)=='i') return zeroPad(flag, !useReverse ? siblings.length-indexInParent-1 : indexInParent)
			if (flag.substr(0,1)=='I') return zeroPad(flag, !useReverse ? siblings.length-indexInParent   : indexInParent+1)

			return all
			})()+suffix
		})
}



var findLayersUsingRelativePath = function (baseLayers, path) {
	var layers = []
	var direction = path.match(/^:?(([<>])|((\d+n)?(([+-])?\d+)?))/)
	if (!direction) throw 'Path "'+path+'" isn\'t valid'
	var restPath = path.substr(direction[0].length)

	if (direction[2]=='<') {
		baseLayers.forEach(function(layer) {
			if (layer.parentGroup) {
				var parent = layer.parentGroup()
				if (layers.indexOf(parent)<0)
					layers.push(parent)
			}
		})
	} else if (direction[2]=='>') {
		baseLayers.forEach(function(layer) {
			if (layer.layers) layer.layers()
				.forEach(function(l) {layers.push(l)})
		})
	} else if (!direction[3] || !direction[3].length) { // containing group
		throw 'Path "'+path+'" isn\'t valid.'
	} else {
		var usingModulus = !!direction[4]
		var k = usingModulus? parseInt(direction[4]) : 1
		var m = direction[5]? parseInt(direction[5]) : 0
		var doRelative = direction[6]

		baseLayers.forEach(function(layer, idx) {
			var index = baseLayers.length-idx-1
			if (usingModulus) {
				if ((index+m)%k == 0)
					layers.push(layer)
			} else {
				if (!layer.parentGroup) return;
				var parent = layer.parentGroup()
				var siblings = parent.layers()

				var targetIdx = !doRelative? siblings.length-1-m : siblings.indexOf(layer) - m
				if (targetIdx<0) targetIdx += siblings.length
				if (targetIdx>=0 && targetIdx<siblings.length)
					layers.push(siblings[targetIdx])
			}
		})
	}

	return !restPath.length? layers:
		findLayersUsingRelativePath(layers, restPath)
}



var transformStringCaseUsingFlags = function (str) {
	// var str = "\\Klowercase \\KUPPERCASE \\KcamelCase \\Kkebab-case \\Kend \\Ksnake_case \\KTitleCase"
	// str += "\n\\LlowerCase \\UupperCase \\CcamelCase \\KkebabCase \\Eend \\SsnakeCase \\TtitleCase"
	return str.replace(/(?:\\([LUCKESTW])((?:.|\s)+?)(?=(?:\\[LUCKESTW])|$))/g, function (all, flag, str) {
		var toKebabCase = function (str) {
			return str
			.replace(/([a-z])([A-Z])/g, function (_,f,l) { return f+'-'+l }) // convert camel/title case
			.toLowerCase() // discard case information
			.replace(/_(\w)/ig, function (_,l) {return '-'+l }) // convert snake case
			.replace(/ (\w)/ig, function (_,l) {return '-'+l }) // convert word case
		}
		var transformers = {
			L: function (str) { // lowercase
				return str.toLowerCase()
			},
			U: function (str) { // UPPERCASE
				return str.toUpperCase()
			},
			C: function (str) { // camelCase
				return toKebabCase(str).replace(/-(\w)/ig, function (_,l) {return l.toUpperCase() })
			},
			K: function (str) { // kebab-case
				return toKebabCase(str)
			},
			E: function (str) { // end
				return str
			},
			S: function (str) { // snake_case
				return toKebabCase(str).replace(/-(\w)/ig, function (_,l) {return '_'+l })
			},
			T: function (str) { // TitleCase
				return toKebabCase(str).replace(/(^|-)(\w)/ig, function (_1,_2,l) {return l.toUpperCase() })
			},
			W: function (str) { // word case
				return toKebabCase(str).replace(/-(\w)/ig, function (_,l) {return ' '+l })
			},
		}
		return transformers[flag](str)
	})
}