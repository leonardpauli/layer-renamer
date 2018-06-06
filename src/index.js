// index.js
// LayerRenamer
//
// created by Leonard Pauli, jan 2017 + jun 2018
// copyright © Leonard Pauli 2017-2018

import UI from 'sketch/ui'
import {showCursorPopupBrowserWindow} from './utils'
import webviewContent from '../resources/webview.html'

let existingWindow = null
export default function (context) {
	coscript.setShouldKeepAround(true)
	UI.message(0+' start')

	if (existingWindow)
		return UI.message('already existing')

	existingWindow = showCursorPopupBrowserWindow({
		reuseId: 'ww-win1',
		url: webviewContent,
		onLoadFinish: ()=> { console.log('UI loaded!') },
		onNativeLog: s=> { // TODO: create handlers/actions obj instead, with eval method for js execution.. or cb?
			UI.message(s)
			existingWindow.webContents.executeJavaScript(`setRandomNumber && setRandomNumber(${Math.random()})`)
		},
		didClose: ()=> {
			existingWindow = null
			console.log('close')
			coscript.setShouldKeepAround(false) // allow session tear down
			// eslint-disable-next-line no-throw-literal
			throw null // force tear down start
		},
	})
}
