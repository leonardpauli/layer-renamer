// filterExpression/lexemsAstExt.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018
//
// based on rim / towards rim

import sfo, {log} from 'string-from-object'
import {handleUnhandled, astify, tokensGroupPrio} from '../parser/aster'
import root from './lexems'

const concat = xxs=> xxs.reduce((a, xs)=> (a.push(...xs), a), [])

const {paren, expr, dot, id, text, num, sp} = root


// astToken declaration

expr.single.astTokenWrapperIs = true
expr.lexems[1].type.astTokenWrapperIs = true
sp.astTokenNot = true
paren.open.astTokenNot = true
paren.close.astTokenNot = true
text.open.astTokenNot = true
text.close.astTokenNot = true


// astValueGet definitions

paren.astValueGet = (ctx, t)=> astify(ctx, t.tokens.find(t=> t.type === expr))
expr.astValueGet = (ctx, t)=> tokensGroupPrio(ctx, t, t.type.lexemsAstTypes)
expr.lexems[1].type.astValueGet = (ctx, t)=> astify(ctx, t.tokens.find(t=> t.type === expr.single))
expr.single.astValueGet = (ctx, t)=> astify(ctx, t.tokens[0])

sp.astValueGet = t=> null

id.astValueGet = (ctx, t)=> t.match[0]
id.special.astValueGet = id.astValueGet
id.strip.astValueGet = (ctx, t)=> t.tokens.map(t=>
		t.type === dot ? null
	: t.type === id ? t.match[0]
	: astify(ctx, t)
).filter(a=> a!==null)

num.astValueGet = (ctx, t)=> Number(t.match[0])

text.astValueGet = (ctx, t)=> concat(t.tokens
	.filter(t=> t.type === text.inner)
	.map(l=> l.tokens.map(t=>
			t.type === text.raw ? [t, t.match[0]]
		: t.type === text.expr ? astify(ctx, t.tokens.find(t=> t.type === paren))
		: handleUnhandled(t, {from: 'text.astValueGet inner', t})
	)))


// lexemsAstTypes definition

const infix = true
const prefix = true

const astids = {
	comma: {is: ({type: t, astValue: v})=> t===id.special && v===',', infix},
	
	plus: {is: ({type: t, astValue: v})=> t===id.special && v==='+', infix},
	minus: {is: ({type: t, astValue: v})=> t===id.special && v==='-', infix},
	mul: {is: ({type: t, astValue: v})=> t===id.special && v==='*', infix},
	div: {is: ({type: t, astValue: v})=> t===id.special && v==='/', infix},

	other: {is: ()=> true, prefix},
}; Object.keys(astids).map(k=> astids[k].name = astids[k].name || k)

root.expr.lexemsAstTypes = [
	astids.comma,
	
	astids.plus,
	astids.minus,
	astids.mul,
	astids.div,
	
	astids.other,
]; root.expr.lexemsAstTypes.forEach((p, i)=> p.prio = i)
