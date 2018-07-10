// regularExpression/lexemsExt.js
// LayerRenamer
//
// created by Leonard Pauli, 25 jun 2018
// copyright © Leonard Pauli 2018

import sfo, {log} from 'string-from-object'
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

// regexp
const stepFirstGet = t=> t.astValue.length==1 ? t.astValue[0]: t
root.astValueGet = (ctx, t)=> ({
	step: stepFirstGet((astify(ctx, t.tokens[1]), t.tokens[1])),
	flags: t.tokens[3]? astify(ctx, t.tokens[3]): flagsGet(''),
})
root.flags.astValueGet = (ctx, t)=> flagsGet(t.match[0])

const flagsGet = s=> ({ // TODO: naming
	global: s.includes('g'),
	multiline: s.includes('m'),
	sticky: s.includes('s'),
	ignoreCase: s.includes('i'),
	yFlag: s.includes('y'), // TODO
	unicode: s.includes('u'),
})

// orlist
root.orlist.astValueGet = (ctx, t)=> (
	t.tokens.map(t=> astify(ctx, t)), [
		t.tokens[0],
		...t.tokens.slice(1).map(t=> t.astValue).filter(Boolean),
	]).map(t=> t.astValue.matchInner || t)
root.orlistrest.astValueGet = (ctx, t)=> t.tokens.length > 1
	? (astify(ctx, t.tokens[1]), t.tokens[1])
	: null

// step
root.step.astValueGet = (ctx, t)=> {
	// positionchar?, matchstep*, positionchar?
	t.tokens.map(t=> (astify(ctx, t), t))

	const tks = t.tokens.slice()
	const posStart = tks.length>0 && tks[0].type === root.matchstart? tks.shift(): null
	const posEnd = tks.length>0 && tks[tks.length-1].type === root.matchend? tks.pop(): null
	const matches = tks.map(t=> t.astValue.modifier? t: t.astValue.match)

	if (matches.length==1 && !posStart && !posEnd)
		return {matchInner: matches[0]}

	return {
		capture: false,
		at: {
			start: !!posStart,
			end: !!posEnd,
		},
		usingOr: false, // TODO: inspect tks and unwrap if wanted + all sub to tokens.usingOr
		matches,
		tokens: {
			capture: null, // TODO: reuse for capture group, etc?
			lookahead: null,
			at: {
				start: posStart,
				end: posEnd,
			},
			usingOr: null, // many
		},
	}
}

const matchModifierObjectGet = tks=> Object.assign({
	min: 1,
	max: 1,
	greedy: true,
	lookahead: {
		enabled: false,
		negated: false,
		step: null,
		// 	capture: ...,
		// 	...,
	},
},
		tks.length==0? {}
	: tks[0].type===root.modifierchar && (tks.length==1 || (tks.length==2
		&& tks[1].type===root.modifierchar && tks[1].match[0]==='?'))
			? Object.assign({greedy: tks.length!=2}, tks[0].astValue)
	: tks.length==1 && tks[0].type===root.matchcount? tks[0].astValue
	: {
	// TODO
	// : tks[0].type===root.matchmodifiergroup?
	// 	: (()=> {throw new Error('unknown type'+tks[0].type.name)})()
		a: (()=> { throw new Error('TODO'+sfo(tks, 3)) })(),
	}
)
root.modifierchar.astValueGet = (ctx, t)=>
		t.match[0]==='+'? {min: 1, max: Infinity}
	: t.match[0]==='*'? {min: 0, max: Infinity}
	: t.match[0]==='?'? {min: 0, max: 1}
	: (()=> { throw new Error('unknown char '+t.match[0]) })()
root.matchcount.astValueGet = (ctx, t)=> ({
	min: typeof t.match[1] === 'string' ? parseInt(t.match[1], 10): 0,
	max: typeof t.match[2] === 'string' ? parseInt(t.match[2], 10): Infinity,
})
root.matchmodifier.astValueGet = (ctx, t)=> (astify(ctx, t.tokens[0]), t.tokens[0])

root.matchstep.astValueGet = (ctx, t)=> (
	t.tokens.map(t=> astify(ctx, t)), {
		match: t.tokens[0].astValue,
		modifier: t.tokens.length==1? null: matchModifierObjectGet(t.tokens.slice(1).map(t=> t.astValue)),
	})

root.matchable.astValueGet = (ctx, t)=> (astify(ctx, t.tokens[0]), t.tokens[0])

// echar
root.echar.astValueGet = (ctx, t)=> astify(ctx, t.tokens[0])
root.achar.astValueGet = (ctx, t)=> t.match[0].charCodeAt(0)
root.escapedchar.astValueGet = (ctx, t)=> { throw new Error('TODO') }

// TODO


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
