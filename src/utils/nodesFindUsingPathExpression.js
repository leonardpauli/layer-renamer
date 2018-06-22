// nodesFindUsingPathExpression.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import {evaluate as evaluateExpression, parseStep} from './filterExpression'

const concat = xxs=> xxs.reduce((a, xs)=> (a.push(...xs), a), [])


// nodesRegexFiltering: [n] -> [(n, meta match groups)]
const nodesFilteredUsingRegex = ({nodes, titleGet, regex})=> nodes
	.map(node=> ({node, matches: titleGet(node).match(regex)}))
	.filter(({matches})=> matches)

// nodesExpressionFiltering: [n] -> [n]
const nodesFilteredUsingExpression = ({nodes, propertiesGet, expression})=> nodes
	.filter(node=> evaluateExpression(propertiesGet(node), expression))

// nodesAtRelativePath: [n] -> [[n]]
// imported


// nodesFindUsingPathExpressionStep :: [n] -> [[(n, [s])]], s = regex match group, concated from steps
const nodesFindUsingPathExpressionStep = ({
	roots, path,
	parentGet, childrenGet,
})=> {
	if (!path) return roots
	const xs = []

	// ...

	return xs
}

// nodesFindUsingPathExpressionGrouped :: [n] -> [[n]]
const nodesFindUsingPathExpressionGrouped = ({
	roots, path,
	parentGet, childrenGet,
})=> {
	const gs = [roots] // [n] -> [[n]]

	// ...

	return gs
}

// nodesAtExpressionPath :: [n] -> [n]
const nodesAtExpressionPath = opt=> {
	const res = nodesFindUsingPathExpressionGrouped(opt)
	return [...new Set(concat(res))] // get unique
}

export default nodesAtExpressionPath


// path parsing

export const parsePathExpressionStrPart = str=> {
	const state = {}
	const path = [...parsePathExpressionStr(str, state)]; const {restStr} = state
	// if (restStr===str) throw new Error(`Path "${restStr}" isn't valid path`)
	return {path, restStr}
}

export const parsePathExpressionStr = function* parsePathExpressionStr (str, state = {}) {
	state.restStr = str; let item
	while (state.restStr && ({item, restStr: state.restStr} =
		parsePathExpressionStrNext(state.restStr), item)) yield item
	return state.restStr
}

const parsePathExpressionStrNext = str=> ({item: null, restStr: str})
// {
// const match = str.match(/^(([<>])|((\d+n)([+-]?\d+)?)|(([+-])?\d+))/)
// if (!match) return {item: null, restStr: str}
// ...
// return {item, restStr: str.substr(whole.length)}
// }
