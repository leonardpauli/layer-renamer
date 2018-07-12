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
	: (ctx.errors.push({message: 'missing evaluate handler', t, args}), null)


// helpers

export const evaluateStr = (ctx, str, {stopAfterAstify = false} = {})=> {
	let tokenizeOk = true
	try {
		tokenizeNextCore(ctx, str)
	} catch (err) { tokenizeOk = false; ctx.errors.push({message: 'during tokenize', err}) }
	if (!tokenizeOk) return ctx
	// TODO: reset ctx.(lexem, value)?
	if (ctx.lexem.matched) {
		let astifyOk = true
		let evaluatOk = true
		try {
			astify(ctx, ctx.lexem)
		} catch (err) { astifyOk = false; ctx.errors.push({message: 'during astify', err}) }
		if (astifyOk && !stopAfterAstify) try {
			ctx.value = evaluate(ctx, ctx.lexem)
		} catch (err) { evaluatOk = false; ctx.errors.push({message: 'during evaluatOk', err}) }
	}
	ctx.restStr = str.substr(ctx.lexem.location.e)
	return ctx
}
