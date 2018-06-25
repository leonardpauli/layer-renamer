// regularExpression/syntax.js
// LayerRenamer
//
// created by Leonard Pauli, 25 jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import {stupidIterativeObjectDependencyResolve} from '../object'
import {relativePathTokenRegex} from '../nodesAtRelativePath'
import {root as filterExpression} from '../filterExpression'

import {astidsExpand, flags, expand} from '../parser/lexemUtils'
import {evaluate} from '../parser/evaluate'
import {astify} from '../parser/aster'


// --- TOKENIZE ----

const {optional, repeat, usingOr} = flags

// lexems definition

const root = stupidIterativeObjectDependencyResolve(({
	step, path, regexp, sp, spo,
})=> ({
	name: 'regexp',
	open: {regex: /^\//},
	close: {regex: /^\//},
	flags: {regex: /^[gmsiyu]{1,6}/},
	escaped: 
	step: {},
	regexp: {regex: /^\/(\\.|[^\\])*\/([a-z]+)?/},
	lexems: [open, {type: step, repeat}, close, {type: flags, optional}],
}), {n: 3})

expand(root)

export default root


// --- AST ----

// const {} = root

// astToken declaration

// expr.single.astTokenWrapperIs = true
// sp.astTokenNot = true


// astValueGet definitions

// expr.single.astValueGet = (ctx, t)=> astify(ctx, t.tokens[0])
// id.astValueGet = (ctx, t)=> t.match[0]


// lexemsAstTypes definition

const prefix = true

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
