// rename.js
// LayerRenamer
//
// created by Leonard Pauli, jan 2017
// copyright © Leonard Pauli 2017-2018

import {replaceLayerExpressionFlags, transformStringCaseUsingFlags} from './custom-utils'

const layerRenamerRename = context=> {
	const doc = context.document
	const {selection} = context
	const selectionCount = selection.count()
	if (selectionCount == 0) {
		doc.showMessage('No layers selected - no layers to rename')
		return
	}

	// Get past values
	const userDefaults = NSUserDefaults.standardUserDefaults()
	const defaultFindStr = '(.+)'
	const defaultReplaceStr = '$1'
	let pastFindStr = userDefaults.objectForKey_('LayerRenamer-find-value') || defaultFindStr
	let pastReplaceStr = userDefaults.objectForKey_('LayerRenamer-replace-value') || defaultReplaceStr
	if (pastFindStr==defaultFindStr) pastFindStr = ''
	if (pastReplaceStr==defaultReplaceStr) pastReplaceStr = ''

	const alert = showAlert({
		title: 'Rename '+selectionCount+' layer'+(selectionCount==1 ? '' : 's'),
		message: 'Using RegExp :)',
		fields: {
			_find: [pastFindStr, 'What to search for? By default everything: (.+)'],
			_replace: [pastReplaceStr, 'Try $1, %N, %p.t, and %x/y/w/h']},
		buttons: ['Replace All', 'Cancel'],
		showHelp (alert) {
			showRegExHelpAlert(false)
		},
		width: 400,
		icon: scriptDir+'Resources/icons/layerRenamerRename.png',
		beforeShow (alert) {
			alert.rawAlert.window().setInitialFirstResponder(alert.fields.replace)
		},
	})
	if (alert.selected.title=='Cancel') return

	let findStr = alert.fields.find.value
	if (!findStr.length()) findStr = defaultFindStr
	const reg = new RegExp(findStr, 'i')
	userDefaults.setObject_forKey_(findStr, 'LayerRenamer-find-value')
	
	let replaceStr = alert.fields.replace.value
	if (!replaceStr.length()) replaceStr = ''
	userDefaults.setObject_forKey_(replaceStr, 'LayerRenamer-replace-value')
	
	let nrOfReplaced = 0
	for (let i=0; i < selectionCount; i++) {
		const layer = selection[i]
		const nameOld = layer.name()

		const str = replaceLayerExpressionFlags(replaceStr, layer, false, selectionCount, i)

		let name = nameOld.replace(reg, str)
		name = transformStringCaseUsingFlags(name)
		if (nameOld!=name) nrOfReplaced++

		layer.setName(name)
	}

	if (selectionCount==nrOfReplaced && nrOfReplaced==1)
		doc.showMessage('Renamed the layer')
	else doc.showMessage('Renamed '+
		(selectionCount==nrOfReplaced?'all ':nrOfReplaced+' of ')+
		selectionCount+' layer' + (selectionCount==1?'':'s'))
}
