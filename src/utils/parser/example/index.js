// utils/parser/example/index.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import {lexemExtendCopyClean1Level} from '../lexemUtils'
import {evaluate} from '../evaluate'

import root from './lexems'
import './lexemsEvalExt'

export {evaluate}

export const exprCtxDefaultGet = ()=> ({
	lexem: lexemExtendCopyClean1Level(root.expr),
	vars: {},
})
