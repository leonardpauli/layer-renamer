import {showCursorPopupBrowserWindow} from '@leonardpauli/sketch-module-web-view/lib/lp-utils'
import utils from 'sketch-utils'
import {log as dlog} from 'string-from-object'

const logns = ns=> {
	// cocoascript values are often of type MOBoxedValue, which uses custom toValue etc
	// to inspect, using utils.prepareValue etc can be beneficial
  dlog('\n\n\n\n')
  // dlog(String(ns.treeAsDictionary().toString())
  // dlog(ns.treeAsDictionary(), {
  //   nameExtractor: o=> o && o['<class>'],
  //   filter: ({key})=> key!=='<class>',
  // })
  dlog(utils.prepareValue(ns, {
   skipMocha: false,
   withAncestors: false,
   withTree: true,
  }))
}

export {
	showCursorPopupBrowserWindow,
	logns,
}
