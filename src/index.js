// index.js
// LayerRenamer
//
// created by Leonard Pauli, jan 2017 + jun 2018
// copyright © Leonard Pauli 2017-2018

/* globals NSStringPboardType */

import UI from 'sketch/ui'
import mainWindow from './mainWindow'
import outlineFromSelectionAsString from './actions/outlineFromSelectionAsString'
import selectFn from './actions/select'
import {logd} from './utils/misc'

export default context=> UI.message(0+' start')

export const rename = context=> (UI.message(1+' RENMAE'), mainWindow.show({rename: {show: true}}, {context}))
// export const select = context=> (UI.message(1+' SELECT'), mainWindow.show({rename: {show: false}}, {context}))
export const select = context=> (UI.message(2+' SELECT'), logd(selectFn(context)({
	options: {
		regex: false,
	},
	value: 'hello',
})))
// UI.message(select(context)({}).msg)

export const copyOutline = context=> {
	const str = outlineFromSelectionAsString(context)({pug: true})
	NSPasteboard.generalPasteboard().clearContents()
	NSPasteboard.generalPasteboard().setString_forType_(str, NSStringPboardType)
	UI.message('Page outline copied to clipboard')
}
