// filterExpression.js
// LayerRenamer
//
// created by Leonard Pauli, mid jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import lexemRoot from './lexems'
import {lexemExtendCopyClean1Level} from '../parser/tokenizer'

const concat = xxs=> xxs.reduce((a, xs)=> (a.push(...xs), a), [])


const evaluateCtxGet = (ctx = {})=> ({...ctx})
const evaluate = (ctx, expr)=> expr.value =
		expr.value !== void 0 ? expr.value
	: expr.type == 'and' ? !expr.list.some(e=> !evaluate(ctx, e))
	: expr.type == 'or' ? expr.list.some(e=> evaluate(ctx, e))
	: expr.type == 'primitive' ? expr.value
	: expr.type == 'property' ? ctx[expr.key]
	: expr.type == 'eq' ? (([fste, ...es], fstv = evaluate(ctx, fste))=>
		!es.some(e=> !valueEq(fstv, evaluate(ctx, e))))(expr.list)
	: null

const valueEq = (a, b)=> a==b


export const exprCtxDefaultGet = ()=> ({
	lexem: lexemExtendCopyClean1Level(lexemRoot.expr),
	vars: {},
})
const parseStrCtxGet = (ctx = {})=> ({...exprCtxDefaultGet(), ...ctx})
