/* eslint-disable */

function showRegExHelpAlert (isSearch) {
	const title = !isSearch
		? 'Replace more powerful with Regular Expressions':
		'Search and select more powerful with Regular Expressions'
	const preMessage = !isSearch
		? 'Write what you\'re searching for in the first field, and what to replace matches with in the second.':
		'The selected layers/artboards/groups/... (or their descendants) will be filtered on the regex in the first box, and the expression in the last box. If nothing is selected, it searches through all layers in the current page.'
	const middleMessage = !isSearch
		? 'Use parenthesis to create capture groups; eg. to rename '+
		'"item 57 flower" to "flower-57", we could do find: "(\\d+) (\\w+)", replace with: "$2-$1". '+
		'$1 would reference to first capture group, that is, the number ("\\d+"), etc.'+
		'\nPs. you can transform string cases using flags \\L,\\U,\\C,\\K,\\E,\\S,\\T,\\W; ie. `\\T this becomes \\U uppErcase \\E or What?` -> `ThisBecomes UPPERCASE or What?`'
		:
		'Use parenthesis to create capture groups; eg. filtering items like "item 57 flower"'+
		'using the regex  "item (\\d+)", and expression "$1 < 20 and (shape or group)"'+
		'would match "item 15", if it\'s also a shape or group layer, but not "item 22".'+
		' Be fast! hit ⌘↩︎ to access the second button.'+
		'\n'+
		'\nExpressions are written in cool JavaScript. Compare capture groups and use variables like:'
	const variablesMessage = !isSearch
		? 'Variables are also supported, in the replace box (see GitHub for more):':
		'$1 == %p.p.t and (artboard or group or shape or slice or bitmap or text or path)\n'

	const msgAlert = showAlert({
		title,
		message: preMessage+
			' Leave the textfield empty to find/replace everything/with nothing.'+
			' RegExp are very powerful. To learn more and try some more, check out regexr.com. Tiny cheatsheet:'+
			'\n'+
			'\n'+	'.'								+'\t\t\t\t'+	' Match any character once'+
			'\n'+	'[hk5]'						+'\t\t\t\t'+	' Match any of h, k, or 5 once'+
			'\n'+	'\\w, \\d, \\s'			+'\t\t\t'+	' word character, digit, whitespace'+
			'\n'+	'\\., \\*, \\\\, \\('+'\t\t\t'+	' special characters needs to be escaped'+
			'\n'+	'a*, a+, a?'				+'\t\t\t'+	' 0 or more, 1 or more, 0 or 1'+
			'\n'+	'a{5}, a{2,}, a{1,3}'		+'\t'+	' exactly five, two or more, between one & three'+
			'\n'+	'a+?, a{2,}?'					+'\t\t'+	' match as few as possible'+
			'\n'+	'ab|cd'							+'\t\t\t'+	' match ab or cd'+
			'\n'+
			'\n'+ middleMessage+
			'\n'+ variablesMessage+
			'\n'+'index  (%N)'+' \tin parent  (%i/I)'+'\t\tdimensions (%w/h/x/y)'+' title (%t)' +'   kind (%k/K)'+
			'\n'+'from 0 (%n)'+' \treversed  (%-N/n)'+ ' \tparent properties  (%p.t/w) '+' % (%%)'+
			'\n'+
			'\n'+'Navigate the layer tree using Relative find paths:'+
				   ' Write ":"" in the end of a search expression, followed by any of the following, stacked how many times you desire, to navigate the layer tree:'+
			'\n'+' > all children, < parent, 2 third layer in parent (counting starts at 0), 2n every other layer, +1 layer after, -4 layer four layers before, t.ex bg:-1>3>2n+1',
		buttons: ['OK', 'GitHub', 'Regexr.com'],
		width: 520,
		icon: scriptDir+'Resources/icons/layerRenamerSelect.png',
	})
	if (msgAlert.canceled) return
	const link = msgAlert.selected.title == 'Regexr.com' ? 'http://regexr.com':
		'https://github.com/LeonardPauli/LayerRenamer'
	NSWorkspace.sharedWorkspace()
		.openURL(NSURL.URLWithString(link))
}
