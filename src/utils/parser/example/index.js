// utils/parser/example/index.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import {lexemExtendCopyClean1Level} from '../lexemUtils'

import root from './lexems'
import './lexemsAstExt'
import {astids} from './lexemsAstExt' // eslint-disable-line no-duplicate-imports

const concat = xxs=> xxs.reduce((a, xs)=> (a.push(...xs), a), [])


// eval

const {paren, expr, id, num, sp} = root
const {plus, minus, mul, div} = astids

export const evaluate = (ctx, t, args)=> t.evalValue = // log({t: t.type.name, a: t.astId, args}) ||
		t.evalValue !== void 0 ? t.evalValue
	
	: t.type === expr || t.type === paren ? Array.isArray(t.astValue)
		? evaluate(ctx, t.astValue[0], [
			evaluate(ctx, t.astValue[1]),
			evaluate(ctx, t.astValue[2]),
		])
		: evaluate(ctx, t.astValue)
	
	: t.type === num ? t.astValue

	: t.astId === plus ? args[0] + args[1]
	: t.astId === minus ? args[0] - args[1]
	: t.astId === mul ? args[0] * args[1]
	: t.astId === div ? args[0] / args[1]

	// : t.type == 'and' ? !t.list.some(e=> !evaluate(ctx, e))
	// : t.type == 'or' ? t.list.some(e=> evaluate(ctx, e))
	// : t.type == 'property' ? ctx[t.key]
	// : t.type == 'eq' ? (([fste, ...es], fstv = evaluate(ctx, fste))=>
	// 	!es.some(e=> !valueEq(fstv, evaluate(ctx, e))))(t.list)
	: null

// const valueEq = (a, b)=> a==b


export const exprCtxDefaultGet = ()=> ({
	lexem: lexemExtendCopyClean1Level(root.expr),
	vars: {},
})
