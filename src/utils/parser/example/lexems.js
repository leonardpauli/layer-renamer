// utils/parser/example/lexems.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import {stupidIterativeObjectDependencyResolve} from '../../object'

import {flags, expand} from '../lexemUtils'
const {optional, repeat, usingOr} = flags


// lexems definition

const root = stupidIterativeObjectDependencyResolve(({
	paren, num, sp, spo, expr, id,
})=> ({
	paren: {
		lexems: [paren.open, spo, expr, spo, {type: paren.close, optional}],
		open: {regex: /^\(/},
		close: {regex: /^\)/},
	},
	num: {regex: /^[1-9][0-9]*(\.[0-9]+)?/, description: 'number'},
	sp: {regex: /^[\t ]+/, description: 'space-horizontal'},
	spo: {type: sp, optional},
	expr: {
		description: 'expression',
		lexems: [expr.single, {type: {lexems: [spo, expr.single]}, repeat, optional}],
		single: {usingOr, lexems: [num, paren, id.special]},
	},
	id: {
		regex: /^[^ .(){}[\]\n\t"-<>=*+/!,]+/,
		special: {regex: /^[-<>=*+/!,]+/, description: 'allowed right next to id without space, eg. a+b'},
	},
	lexems: [expr],
}), {n: 3})

expand(root)

export default root
