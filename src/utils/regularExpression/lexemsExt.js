// regularExpression/lexemsExt.js
// LayerRenamer
//
// created by Leonard Pauli, 25 jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import {stupidIterativeObjectDependencyResolve} from '../object'
import {relativePathTokenRegex} from '../nodesAtRelativePath'
import {root as filterExpression} from '../filterExpression'

import {astidsExpand, astidFlags} from '../parser/lexemUtils'
import {evaluate} from '../parser/evaluate'
import {astify} from '../parser/aster'

import root from './lexems'


// --- AST ----

// const {} = root

// astToken declaration

// expr.single.astTokenWrapperIs = true
// sp.astTokenNot = true


// astValueGet definitions

// TODO
root.astValueGet = (ctx, t)=> astify(ctx, t.tokens[1])
root.orlist.astValueGet = (ctx, t)=> (t.tokens.map(t=> astify(ctx, t)), t.tokens)
root.orlistrest.astValueGet = (ctx, t)=> t.tokens.length > 1? astify(ctx, t.tokens[1]): null

root.step.astValueGet = (ctx, t)=> t.tokens.map(t=> (astify(ctx, t), t))
root.matchstep.astValueGet = (ctx, t)=> t.tokens.map(t=> astify(ctx, t))
root.matchable.astValueGet = (ctx, t)=> t.tokens.map(t=> astify(ctx, t))
root.achar.astValueGet = (ctx, t)=> t.match[0]
root.matchmodifier.astValueGet = (ctx, t)=> t.tokens.map(t=> astify(ctx, t))
root.modifierchar.astValueGet = (ctx, t)=> t.match[0]
root.orchar.astValueGet = (ctx, t)=> t.match[0]
root.matchstart.astValueGet = (ctx, t)=> t.match[0]
root.matchend.astValueGet = (ctx, t)=> t.match[0]
// expr.single.astValueGet = (ctx, t)=> astify(ctx, t.tokens[0])
// id.astValueGet = (ctx, t)=> t.match[0]


// lexemsAstTypes definition

const {prefix} = astidFlags

export const astids = {
	other: {is: ()=> true, prefix},
}; astidsExpand(astids)


// --- EVAL ----

// const {plus} = astids

// astId.evaluate
// plus.evaluate = (ctx, t, args)=> args[0] + args[1]


// token.type.evaluate
// text.evaluate = (ctx, t)=> t.astValue.map(t=> evaluate(ctx, t)).join('')
// text.raw.evaluate = (ctx, t)=> t.astValue
