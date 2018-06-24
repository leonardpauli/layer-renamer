// utils/parser/evaluate.js
// LayerRenamer
//
// created by Leonard Pauli, 23 jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import {tokenizeNextCore} from './tokenizer'
import {astify} from './aster'

// TODO: join token.type.evaluate and astId.evaluate somehow? or not, different purposes
// 	- token.type generic
// 	- same token kan have different astId depending on match, so astId.evaluate is more specifi

export const evaluate = (ctx, t, args)=> t.evalValue =
		t.evalValue !== void 0 ? t.evalValue
	: t.astId.evaluate ? t.astId.evaluate(ctx, t, args)
	: t.type.evaluate ? t.type.evaluate(ctx, t, args)
	: null


// helpers

export const evaluateStr = (ctx, str)=> {
	tokenizeNextCore(ctx, str)
	if (ctx.lexem.matched) {
		astify(ctx, ctx.lexem)
		ctx.value = evaluate(ctx, ctx.lexem)
	}
	ctx.restStr = str.substr(ctx.lexem.location.e)
	return ctx
}
