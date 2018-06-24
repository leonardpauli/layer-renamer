// nodesFindUsingPathExpression.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import {lexemExtendCopyClean1Level} from '../parser/lexemUtils'
import {evaluateStr as evaluateStr_} from '../parser/evaluate'

import root from './syntax'

// TODO:
// /regex \/ more .* regex (matchgroup 1.1) \\/g>1n+2(color = "red")>/hello (matchgroup 0.1)/
// 	- matchgroups are reversed
// 	- opacity .5 unparsed restStr if any
// 	- syntax highlight :)

// TODO

// nodesRegexFiltering: [n] -> [(n, meta match groups)]
// const nodesFilteredUsingRegex = ({nodes, titleGet, regex})=> nodes
// 	.map(node=> ({node, matches: titleGet(node).match(regex)}))
// 	.filter(({matches})=> matches)

// nodesExpressionFiltering: [n] -> [n]
// const nodesFilteredUsingExpression = ({nodes, propertiesGet, expression})=> nodes
// 	.filter(node=> evaluateExpression(propertiesGet(node), expression))

// nodesAtRelativePath: [n] -> [[n]]
// imported


export const evaluateStr = (str, ctx = exprCtxDefaultGet())=> evaluateStr_(ctx, str)

export const exprCtxDefaultGet = (setup = {
	titleGet: ()=> '',
	propertiesGet: ()=> ({}),
	parentGet: ()=> null,
	childrenGet: ()=> [],
})=> ({
	lexem: lexemExtendCopyClean1Level(root),
	vars: {},
	errors: [],
	setup,
})

const nodesFindUsingPathExpression = (setup, baseNodes)=> str=> {
	const ctx = exprCtxDefaultGet(setup)
	const val = evaluateStr(str, ctx)
	return val
}

export default nodesFindUsingPathExpression
