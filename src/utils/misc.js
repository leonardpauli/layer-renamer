// utils/misc.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2017-2018

import utils from 'sketch-utils'
import {log as _logd} from 'string-from-object'
import config from '../config'


// logging

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


// strings

const regexEscape = s=> s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

const paddStringToLength = (str, len, append = false, char = ' ')=> {
	let txt = ''; for (let i = Math.max(0, len-str.length); i>0; i--) txt += char
	return append? str+txt: txt+str
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


// system

const scriptDirGet = coscript=> coscript.env().scriptURL.path().stringByDeletingLastPathComponent().stringByDeletingLastPathComponent()+'/'

const openUrl = url=> NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url))


// storage

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


// export

export {
	logd, logns,

	regexEscape,
	paddStringToLength,
	transformStringCaseUsingFlags,

	openUrl,
	scriptDirGet,
	
	storageStringGet, storageJSONGet,
}
