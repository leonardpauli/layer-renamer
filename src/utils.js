// utils.js
// LayerRenamer
// 
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2017-2018

import {showCursorPopupBrowserWindow} from '@leonardpauli/sketch-module-web-view/lib/lp-utils'
import utils from 'sketch-utils'
import {log as _logd} from 'string-from-object'

const isProduction = false // TODO: use process.env.NODE_ENV==='development'

const logd = (...args)=> isProduction || _logd(...args)
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
  var objClass = obj.class()
  if (objClass == MSLayerGroup)
    return 'Group'

  var str = NSStringFromClass(objClass)
  if (str.substr(0,2)=='MS') str = str.substr(2)
  if (str.substr(-5)=='Group' || str.substr(-5)=='Layer')
    str = str.substr(0,str.length-5)

  if (str=='SymbolInstance') return 'Symbol'
  if (str.length>5 && (str.substr(-5)=='Shape' || str=='ShapePath')) return 'Path'

  return str
}

const paddStringToLength = (str, len, append, char)=> {
  char = char || ' '
  var txt = ''
  for (var i=Math.max(0,len-str.length); i>0; i--) txt+=char
  return append? str+txt: txt+str
}

const scriptDirGet = coscript=> coscript.env().scriptURL.path().stringByDeletingLastPathComponent().stringByDeletingLastPathComponent()+'/'

export {
	showCursorPopupBrowserWindow,
	logd, logns,
  scriptDirGet,
  getLayerKind,
  paddStringToLength,
}
