// utils/parser/example/lexemsAstExt.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018
//
// - lexems Abstract Syntax Tree extensions

import sfo, {log} from 'string-from-object'
import {handleUnhandled, astify, tokensGroupPrio} from '../aster'
import root from './lexems'

const concat = xxs=> xxs.reduce((a, xs)=> (a.push(...xs), a), [])

const {paren, expr, id, num, sp} = root


// astToken declaration

expr.single.astTokenWrapperIs = true
expr.lexems[1].type.astTokenWrapperIs = true
sp.astTokenNot = true
paren.open.astTokenNot = true
paren.close.astTokenNot = true


// astValueGet definitions

paren.astValueGet = (ctx, t)=> astify(ctx, t.tokens.find(t=> t.type === expr))
expr.astValueGet = (ctx, t)=> tokensGroupPrio(ctx, t, t.type.lexemsAstTypes)
expr.lexems[1].type.astValueGet = (ctx, t)=> astify(ctx, t.tokens.find(t=> t.type === expr.single))
expr.single.astValueGet = (ctx, t)=> astify(ctx, t.tokens[0])
// t.tokens.length!=1 ? handleUnhandled(t, {from: 'expr.single.astValueGet', t, err: 'expr len'})

sp.astValueGet = t=> null

id.astValueGet = (ctx, t)=> t.match[0]
id.special.astValueGet = id.astValueGet

num.astValueGet = (ctx, t)=> Number(t.match[0])


// lexemsAstTypes definition

const infix = true
const prefix = true
// TODO: validate astids schema
// {is: token=> Boolean, infix/suffix/prefix: true, name: String, prio: Number}

const astids = {
	plus: {is: ({type: t, astValue: v})=> t===id.special && v==='+', infix},
	minus: {is: ({type: t, astValue: v})=> t===id.special && v==='-', infix},
	mul: {is: ({type: t, astValue: v})=> t===id.special && v==='*', infix},
	div: {is: ({type: t, astValue: v})=> t===id.special && v==='/', infix},

	other: {is: ()=> true, prefix},
}; Object.keys(astids).map(k=> astids[k].name = astids[k].name || k)

root.expr.lexemsAstTypes = [ // order sets priority, + ability to have this dynamic? eg. add entry from language
	astids.plus,
	astids.minus,
	astids.mul,
	astids.div,
	
	astids.other,
]; root.expr.lexemsAstTypes.forEach((p, i)=> p.prio = i) // TODO: do in lexems ast pre-processor?
