// filterExpression/lexems.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018
//
// based on rim / towards rim

import {log} from 'string-from-object'


import {flags, process, recursivelyAddNameToLexems} from './lexemUtils'
const {autoInsertIfNeeded, optional, repeat, usingOr} = flags

// lexems definition

export const root = {
	paren: {
		open: {regex: /^\(/},
		close: {regex: /^\)/},
	},
	num: {regex: /^[1-9][0-9]*(\.[0-9]+)?/, description: 'number'},
	spv: {regex: /^[\t ]+/, description: 'space-vertical (optional for formatting / min 1 req for separation / elastic tab for alignment)'},
	spvo: {},
	expr: {
		description: 'expression',
		single: {usingOr},
	},
	text: {
		open: {regex: /^"/},
		close: {regex: /^"/},
		raw: {regex: /^(([^\\"]|\\[\\"])*)/},
		expr: {
			open: {regex: /^\\\(/, retain: -1},
		},
		inner: {},
	},
	dot: {regex: /^\./},
	comma: {regex: /^,/},
	id: {
		regex: /^[^ .(){}[\]\n\t"]+/,
		strip: {usingOr},
		special: {
			regex: /^[-<>=+*/!,]+/, // !%&\/=?^*<>@$§|≈±~–,≤≥•‰≠·
		},
	},
}
const {paren, spv, num, expr, text, id, dot, comma, spvo} = root
root.lexems = [expr]

Object.assign(spvo, spv, {optional})

text.expr.lexems = [text.expr.open, expr]
text.inner.lexems = [{repeat, optional, usingOr, lexems: [text.raw, text.expr]}]
text.lexems = [text.open, text.raw, {...text.close, autoInsertIfNeeded}]

id.strip.lexems = [id, {lexems: [{...id, optional}, // abc, .a."b".("b"+c)
	{lexems: [dot, {usingOr, lexems: [id, text, paren]}], optional, repeat}]}]

paren.lexems = [paren.open, spvo, expr, spvo, [paren.close, {autoInsertIfNeeded}]]
// expr.commalist.lexems = [expr, {optional, repeat, lexems: [comma, spvo, expr]}]
expr.single.lexems = [
	num,
	text,
	paren,
	id.strip,
	id.special,
]
expr.lexems = [expr.single, {repeat, optional, usingOr, lexems: [spvo, expr.single]}]


process(root)
// log(root, 3)
export default root
