// index.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import UI from 'sketch/ui'
import showCursorPopupBrowserWindow from './showCursorPopupBrowserWindow'
import {logd, storageStringGet} from './utils'
import config from './config'

import webviewContent from '../resources/webview.html'

const {app: {isProduction, namespace: pluginNamespace}} = config
const storage = storageStringGet({namespace: pluginNamespace}) // storageJSONGet


const mainWindow = {
	ref: null,
	context: null,
	show: (o = {}, {context} = {})=> (mainWindow.context = context, mainWindow.show({
		savedOptions: mainWindow.options.load(),
		options: JSON.stringify(o),
	})),
	options: {
		save: o=> storage.set('mainWindowOptions', o), // TODO: save dates?
		load: ()=> storage.get('mainWindowOptions') || '{}', // TODO: load dates?
	},
	_show: o=> mainWindow.ref? UI.message('already existing'): (
		logd({start: 0}),
		coscript.setShouldKeepAround(true),
		mainWindow.ref = showCursorPopupBrowserWindow({
			reuseId: `${pluginNamespace}-main-window`,
			url: webviewContent,
			onLoadFinish: ()=> {
				mainWindow.ref.webContents.executeJavaScript(`mainWindowInit(
					JSON.parse(${o.options}),
					{savedOptions: JSON.parse(${o.savedOptions})}
				)`)
			},
			onNativeLog: s=> { // TODO: create handlers/actions obj instead, with eval method for js execution.. or cb?
				UI.message(s)
				mainWindow.ref.webContents.executeJavaScript(`setRandomNumber && setRandomNumber(${Math.random()})`)
				// mainWindow.options.save(opt) // mainWindowOptions // TODO: before close
			},
			didClose: ()=> {
				mainWindow.ref = null

				logd({start: null})
				if (!isProduction) { // force close to allow reload of plugin source
					coscript.setShouldKeepAround(false) // allow session tear down
					// eslint-disable-next-line no-throw-literal
					throw null // force tear down start
				}
			},
		})
	),
}

export default mainWindow
