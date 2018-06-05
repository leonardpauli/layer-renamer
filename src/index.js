// index.js
// LayerRenamer
//
// created by Leonard Pauli, jan 2017 + jun 2018
// copyright © Leonard Pauli 2017-2018

import UI from 'sketch/ui'
import {showCursorPopupBrowserWindow} from './utils'

export default function (context) {
	coscript.setShouldKeepAround(true)
	UI.message(0+' start')

	if (existingWindow)
		return UI.message('already existing')

	existingWindow = showCursorPopupBrowserWindow({
		reuseId: 'ww-win1',
		url: require('../resources/webview.html'),
		onLoadFinish: ()=> { console.log('UI loaded!') },
		onNativeLog: s=> {
			UI.message(s)
			webContents.executeJavaScript(`setRandomNumber && setRandomNumber(${Math.random()})`)
		},
		didClose: ()=> {
			console.log('close')
			coscript.setShouldKeepAround(false) // allow session tear down
			throw null // force tear down start
		},
	})
}
