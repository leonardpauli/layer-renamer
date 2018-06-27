// nodesFindUsingPathExpression/syntax.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import {stupidIterativeObjectDependencyResolve} from '../object'
import {relativePathTokenRegex} from '../nodesAtRelativePath'
import {root as filterExpression} from '../filterExpression'
import {root as regexp} from '../regularExpression'

import {astidsExpand, flags, expand} from '../parser/lexemUtils'
import {evaluate} from '../parser/evaluate'
import {astify} from '../parser/aster'


// --- TOKENIZE ----

const {optional, repeat, usingOr} = flags

// lexems definition

const root = stupidIterativeObjectDependencyResolve(({
	sp, spo,
	colon, achar, backslash, escapedchar,
	path,
	filterexp,
	special, step, inside,
})=> ({
	sp: {regex: /^[\t ]+/, description: 'space-horizontal'},
	spo: {type: sp, optional},
	colon: {regex: /^:/},

	achar: {regex: /^[^]/},
	backslash: {regex: /^\\/},
	escapedchar: {lexems: [backslash, achar]},

	path: {
		step: {regex: relativePathTokenRegex},
		stepupdown: {regex: /^([<>])/, retain: -1},
		start: {lexems: [colon, path.stepupdown]},
		lexems: [path.start, {type: path.step, repeat}],
	},

	filterexp: {
		lexems: [colon, filterExpression.paren],
	},

	// TODO: join nearby achar, possibly use as regex if enabled, or just match as substr
	special: {lexems: [spo, {lexems: [filterexp, path, regexp], usingOr}, spo]},
	step: {lexems: [escapedchar, special, achar], usingOr},
	lexems: [{type: step, repeat}],
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
