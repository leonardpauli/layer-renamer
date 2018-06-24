// filterExpression/lexemsEvalExt.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import {evaluate} from '../parser/evaluate'

import root from './lexems'
// import './lexemsAstExt'
import {astids} from './lexemsAstExt'


const {paren, expr, id, num, sp} = root
const {plus, minus, mul, div} = astids

// astId.evaluate
plus.evaluate = (ctx, t, args)=> args[0] + args[1]
minus.evaluate = (ctx, t, args)=> args[0] - args[1]
mul.evaluate = (ctx, t, args)=> args[0] * args[1]
div.evaluate = (ctx, t, args)=> args[0] / args[1]

// token.type.evaluate
num.evaluate = (ctx, t)=> t.astValue
expr.evaluate = (ctx, t)=> Array.isArray(t.astValue)
	? evaluate(ctx, t.astValue[0], [
		evaluate(ctx, t.astValue[1]),
		evaluate(ctx, t.astValue[2])])
	: evaluate(ctx, t.astValue)
paren.evaluate = expr.evaluate
