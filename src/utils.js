// utils.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2017-2018

/* globals NSStringFromClass */

import utils from 'sketch-utils'
import {log as _logd} from 'string-from-object'
import config from './config'

const logd = (...args)=> config.app.isProduction || _logd(...args)
const logns = ns=> {
	// cocoascript values are often of type MOBoxedValue, which uses custom toValue etc
	// to inspect, using utils.prepareValue etc can be beneficial
	logd('\n\n\n\n')
	// dlog(String(ns.treeAsDictionary().toString())
	// dlog(ns.treeAsDictionary(), {
	//   nameExtractor: o=> o && o['<class>'],
	//   filter: ({key})=> key!=='<class>',
	// })
	logd(utils.prepareValue(ns, {
		skipMocha: false,
		withAncestors: false,
		withTree: true,
	}))
}

const getLayerKind = obj=> {
	const objClass = obj.class()
	if (objClass == MSLayerGroup)
		return 'Group'

	let str = NSStringFromClass(objClass)
	if (str.substr(0, 2)=='MS') str = str.substr(2)
	if (str.substr(-5)=='Group' || str.substr(-5)=='Layer')
		str = str.substr(0, str.length-5)

	if (str=='SymbolInstance') return 'Symbol'
	if (str.length>5 && (str.substr(-5)=='Shape' || str=='ShapePath')) return 'Path'

	return str
}

const paddStringToLength = (str, len, append = false, char = ' ')=> {
	let txt = ''; for (let i = Math.max(0, len-str.length); i>0; i--) txt += char
	return append? str+txt: txt+str
}

const scriptDirGet = coscript=> coscript.env().scriptURL.path().stringByDeletingLastPathComponent().stringByDeletingLastPathComponent()+'/'

const openUrl = url=> NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url))

const storageStringGet = ({namespace})=> ({
	store: NSUserDefaults.alloc().initWithSuiteName(`plugin.sketch.${namespace}`),
	// TODO: later use obj-c refs for performance?
	// store.boolForKey(k), store.doubleForKey(k), store.arrayForKey(k), store.dictionaryForKey(k)
	// store.setBool_forKey(v, k), store.setDouble_forKey(v, k)
	set (k, v) {
		this.store.setObject_forKey(v, k)
		this.store.synchronize()
	},
	get (k) { return String(this.store().stringForKey(k) || '') || void 0 },
})

const storageJSONGet = ({namespace})=> ({
	store: storageStringGet({namespace}),
	get (k) {
		const v = this.store.get(k); if (!v) return void 0
		try { return JSON.parse(v) } catch (_) { return void 0 }
	},
	set (k, v) { return this.store.set(k, JSON.stringify(v)) },
})

const regexEscape = s=> s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

export {
	logd, logns,
	scriptDirGet,
	getLayerKind,
	paddStringToLength,
	openUrl,
	storageStringGet, storageJSONGet,
	regexEscape,
}
