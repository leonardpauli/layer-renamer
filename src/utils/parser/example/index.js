// utils/parser/example/index.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import root from './lexems'
import {lexemExtendCopyClean1Level} from '../tokenizer'

const concat = xxs=> xxs.reduce((a, xs)=> (a.push(...xs), a), [])


export const exprCtxDefaultGet = ()=> ({
	lexem: lexemExtendCopyClean1Level(root.expr),
	vars: {},
})
