// filterExpression/lexemsAstExt.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018
//
// based on rim / towards rim

import sfo, {log} from 'string-from-object'
import {handleUnhandled, astify, tokensGroupPrio} from './aster'

import root from './lexems'

const concat = xxs=> xxs.reduce((a, xs)=> (a.push(...xs), a), [])


// astValueGet definitions
// astValueGet -> value
// astifi (ctx, token) -> token.astValue = astValueGet(token)

const {paren, expr, dot, id, text, num, sp} = root

expr.single.astTokenWrapperIs = true
expr.lexems[1].type.astTokenWrapperIs = true
sp.astTokenNot = true
paren.open.astTokenNot = true
paren.close.astTokenNot = true
text.open.astTokenNot = true
text.close.astTokenNot = true

paren.astValueGet = (ctx, t)=> astify(ctx, t.tokens.find(t=> t.type === expr))
expr.astValueGet = (ctx, t)=> tokensGroupPrio(ctx, t, t.type.lexemsAstTypes)
expr.lexems[1].type.astValueGet = (ctx, t)=> astify(ctx, t.tokens.find(t=> t.type === expr.single))
expr.single.astValueGet = (ctx, t)=> t.tokens.length==1
	? astify(ctx, t.tokens[0])
	: handleUnhandled(t, {from: 'expr.single.astValueGet', t, err: 'expr len'})

sp.astValueGet = t=> null

id.astValueGet = (ctx, t)=> t.match[0]
id.special.astValueGet = id.astValueGet
id.strip.astValueGet = (ctx, t)=> t.tokens.map(t=>
		t.type === dot ? null
	: t.type === id ? t.match[0]
	: astify(ctx, t)
).filter(a=> a!==null)

num.astValueGet = (ctx, t)=> Number(t.match[0])

// text.expr.astValueGet = (ctx, {tokens})=> astify(ctx, tokens[1])
text.astValueGet = (ctx, t)=> concat(t.tokens
	.filter(t=> t.type === text.inner)
	.map(l=> l.tokens.map(t=>
			t.type === text.raw ? [t, t.match[0]]
		: t.type === text.expr ? astify(ctx, t.tokens.find(t=> t.type === paren))
		: handleUnhandled(t, {from: 'text.astValueGet inner', t})
	)))

// log(tokens, 5, {nameExtractor: o=> o && (o.name || (o.type && o.type.name?'type:'+o.type.name:void 0))}) ||


// lexemsAstTypes definition

const infix = true
const prefix = true
// TODO: validate astids schema
// {is: token=> Boolean, infix/suffix/prefix: true, name: String, prio: Number}

const astids = {
	// comma: {is: ({lexem, match})=> lexem.name==='id' && match[0]===',', infix: true},
	comma: {is: ({type: t, astValue: v})=> t===id.special && v===',', infix},
	
	plus: {is: ({type: t, astValue: v})=> t===id.special && v==='+', infix},
	minus: {is: ({type: t, astValue: v})=> t===id.special && v==='-', infix},
	mul: {is: ({type: t, astValue: v})=> t===id.special && v==='*', infix},
	div: {is: ({type: t, astValue: v})=> t===id.special && v==='/', infix},

	other: {is: ()=> true, prefix},
}; Object.keys(astids).map(k=> astids[k].name = astids[k].name || k)

root.expr.lexemsAstTypes = [ // order sets priority, + ability to have this dynamic? eg. add entry from language
	astids.comma,
	
	astids.plus,
	astids.minus,
	astids.mul,
	astids.div,
	
	astids.other,
]; root.expr.lexemsAstTypes.forEach((p, i)=> p.prio = i) // TODO: do in lexems ast pre-processor?
