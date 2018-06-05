// rename.js
// LayerRenamer
// 
// created by Leonard Pauli, jan 2017
// copyright © Leonard Pauli 2017-2018

var layerRenamerRename = function(context) {
	var doc = context.document
	var selection = context.selection
	var selectionCount = selection.count()
	if (selectionCount == 0) {
		doc.showMessage('No layers selected - no layers to rename')
		return
	}

	// Get past values
	var userDefaults = NSUserDefaults.standardUserDefaults()
	var defaultFindStr = '(.+)'
	var defaultReplaceStr = '$1'
	var pastFindStr = userDefaults.objectForKey_("LayerRenamer-find-value") || defaultFindStr
	var pastReplaceStr = userDefaults.objectForKey_("LayerRenamer-replace-value") || defaultReplaceStr
	if (pastFindStr==defaultFindStr) pastFindStr = ''
	if (pastReplaceStr==defaultReplaceStr) pastReplaceStr = ''

	var alert = showAlert({
		title: 'Rename '+selectionCount+' layer'+(selectionCount==1 ? '' : 's'),
		message: 'Using RegExp :)',
		fields: {
			_find: [pastFindStr, 'What to search for? By default everything: (.+)'],
			_replace: [pastReplaceStr, 'Try $1, %N, %p.t, and %x/y/w/h']},
		buttons: ['Replace All','Cancel'],
		showHelp: function (alert) {
			showRegExHelpAlert(false)
		},
		width: 400,
		icon: scriptDir+'Resources/icons/layerRenamerRename.png',
		beforeShow: function (alert) {
			alert.rawAlert.window().setInitialFirstResponder(alert.fields.replace)
		}
	})
	if (alert.selected.title=='Cancel') return;

	var findStr = alert.fields.find.value
	if (!findStr.length()) findStr = defaultFindStr
	var reg = new RegExp(findStr, 'i')
	userDefaults.setObject_forKey_(findStr, "LayerRenamer-find-value")
	
	var replaceStr = alert.fields.replace.value
	if (!replaceStr.length()) replaceStr = ''
	userDefaults.setObject_forKey_(replaceStr, "LayerRenamer-replace-value")
	
	var nrOfReplaced = 0
	for (var i=0; i<selectionCount; i++) {
		var layer = selection[i]
		var nameOld = layer.name()

		var str = replaceLayerExpressionFlags(replaceStr, layer, false, selectionCount, i)

		var name = nameOld.replace(reg, str)
		name = transformStringCaseUsingFlags(name)
		if (nameOld!=name) nrOfReplaced++

		dLog(paddStringToLength(''+nameOld, 25, true)
			 +paddStringToLength(str, 40, true)
			 +paddStringToLength(name, 40, true))

		layer.setName(name)}

	if (selectionCount==nrOfReplaced && nrOfReplaced==1)
		doc.showMessage('Renamed the layer')
	else doc.showMessage('Renamed '
		+(selectionCount==nrOfReplaced?'all ':nrOfReplaced+' of ')
		+selectionCount+' layer' + (selectionCount==1?'':'s'))
}
