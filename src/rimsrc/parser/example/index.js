// utils/parser/example/index.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import {lexemExtendCopyClean1Level} from '../lexemUtils'
import {evaluateStr as evaluateStr_} from '../evaluate'

import root from './lexems'
import './lexemsEvalExt'

export const evaluateStr = (str, ctx = exprCtxDefaultGet())=> evaluateStr_(ctx, str)

export const exprCtxDefaultGet = ()=> ({
	lexem: lexemExtendCopyClean1Level(root.expr),
	vars: {},
	errors: [],
})
