// regularExpression/index.js
// LayerRenamer
//
// created by Leonard Pauli, 26 jun 2018
// copyright © Leonard Pauli 2018

// TODO: astify for:
// 	- escapedchar, backref, characterset
// 	- capture groups, modifier lookahead

import {log} from 'string-from-object'
import {lexemExtendCopyClean1Level} from '../parser/lexemUtils'
import {evaluateStr as evaluateStr_} from '../parser/evaluate'

import root from './lexems'
import './lexemsExt'

export {root}

export const evaluateStr = (str, ctx = exprCtxDefaultGet(), opt)=> evaluateStr_(ctx, str, opt)

export const exprCtxDefaultGet = ()=> ({
	lexem: lexemExtendCopyClean1Level(root),
	vars: {},
	errors: [],
})
