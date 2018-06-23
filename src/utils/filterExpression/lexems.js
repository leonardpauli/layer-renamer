// filterExpression/lexems.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018
//
// based on rim / towards rim

import {log} from 'string-from-object'
import {stupidIterativeObjectDependencyResolve} from '../object'

import {flags, expand} from '../parser/lexemUtils'
const {autoInsertIfNeeded, optional, repeat, usingOr} = flags

// TODO: fix autoInsertIfNeeded
// TODO: keep ref to original lexem when adding flags, eg. {extends: someLexem, optional} + reuse its name


// lexems definition

const root = stupidIterativeObjectDependencyResolve(({
	lexems, paren, num, sp, spo, expr, text, dot, comma, id,
})=> ({
	paren: {
		lexems: [paren.open, spo, expr, spo, {type: paren.close, optional}], // TODO: autoInsertIfNeeded instead
		open: {regex: /^\(/},
		close: {regex: /^\)/},
	},
	num: {regex: /^[1-9][0-9]*(\.[0-9]+)?/, description: 'number'},
	sp: {regex: /^[\t ]+/, description: 'space-horizontal (optional for formatting / min 1 req for separation / elastic tab for alignment)'},
	spo: {type: sp, optional},
	expr: {
		description: 'expression',
		lexems: [expr.single, {type: {lexems: [spo, expr.single]}, repeat, optional}],
		single: {
			usingOr, lexems: [
				num,
				text,
				paren,
				id,
				id.strip,
				id.special,
			],
		},
	},
	text: {
		open: {regex: /^"/},
		close: {regex: /^"/},
		raw: {regex: /^(([^\\"]|\\[\\"])+)/},
		expr: {
			open: {regex: /^\\\(/, retain: -1},
			lexems: [text.expr.open, paren],
		},
		inner: {usingOr, lexems: [text.raw, text.expr]},
		lexems: [text.open, {type: text.inner, repeat, optional}, {type: text.close, optional}], // TODO: autoInsertIfNeeded instead
	},
	dot: {regex: /^\./},
	comma: {regex: /^,/},
	id: {
		regex: /^[^ .(){}[\]\n\t"-<>=*+/!,]+/,
		striprest: {lexems: [dot, {usingOr, lexems: [id, text, paren]}]},
		strip: {lexems: [
			{type: id, optional},
			{type: id.striprest, optional, repeat},
		], description: 'id strip/chain, eg. `abc`, or `.a."b".("b"+c)`'},
		special: {
			regex: /^[-<>=*+/!,]+/,
			description: 'allowed right next it id without space, eg. a+b',
		}, // !%&\/=?^*<>@$§|≈±~–,≤≥•‰≠·
	},
	lexems: [expr],
}), {n: 3})


// TODO: expand (fn -> obj, name, validate) + test
// log(root, 17, {indentation: '  ', nameExtractor: ()=> null})
expand(root)
// log(root, {indentation: '  '})
export default root
