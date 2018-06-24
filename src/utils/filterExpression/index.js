// filterExpression/index.js
// LayerRenamer
//
// created by Leonard Pauli, mid jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import {lexemExtendCopyClean1Level} from '../parser/lexemUtils'
import {evaluateStr as evaluateStr_} from '../parser/evaluate'

import root from './lexems'
import './lexemsEvalExt'

export const evaluateStr = (str, ctx = exprCtxDefaultGet())=> evaluateStr_(ctx, str)

export const exprCtxDefaultGet = ()=> ({
	lexem: lexemExtendCopyClean1Level(root.expr),
	vars: {},
})
