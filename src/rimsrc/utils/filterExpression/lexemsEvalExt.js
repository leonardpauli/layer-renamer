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


const {paren, expr, id, num, sp, text} = root
const {plus, minus, mul, div, eq} = astids

// astId.evaluate
plus.evaluate = (ctx, t, args)=> args[0] + args[1]
minus.evaluate = (ctx, t, args)=> args[0] - args[1]
mul.evaluate = (ctx, t, args)=> args[0] * args[1]
div.evaluate = (ctx, t, args)=> args[0] / args[1]

eq.evaluate = (ctx, t, args)=> args[0] === args[1]


// token.type.evaluate
text.evaluate = (ctx, t)=> t.astValue.map(t=> evaluate(ctx, t)).join('')
text.raw.evaluate = (ctx, t)=> t.astValue

num.evaluate = (ctx, t)=> t.astValue
expr.evaluate = (ctx, t)=> Array.isArray(t.astValue)
	? t.astValue.length===0
		? []
		: evaluate(ctx, t.astValue[0], [
			evaluate(ctx, t.astValue[1]),
			evaluate(ctx, t.astValue[2])])
	: evaluate(ctx, t.astValue)
paren.evaluate = expr.evaluate
text.expr.evaluate = expr.evaluate

const idGetVal = (ctx, path, rest = {})=> {
	let val = ctx.vars
	for (let i = 0; i < path.length; i++) {
		const name = path[i]
		val = val[name]
		if (val===void 0) {
			const fullname = path.slice(0, i+1).join('.')
			ctx.errors.push({message: `use of undefined variable "${fullname}"`, fullname, ...rest})
			return null
		}
	}
	return val
}
id.evaluate = (ctx, t, args)=> idGetVal(ctx, [t.astValue], {t})
id.strip.evaluate = (ctx, t)=> idGetVal(ctx, t.astValue, {t})
