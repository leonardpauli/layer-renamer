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
	open, close, flags,
	positionchar, backslash, achar,
	charbycode,
	escapedchar,
	characterset,
	matchgroup,
	modifierchar, matchcount, matchmodifier,
	matchable, matchstep, step,
	orchar, orlistrest, orlist,
})=> ({
	name: 'regexp',
	open: {regex: /^\//},
	close: {regex: /^\//},
	flags: {regex: /^[gmsiyu]{1,6}/},

	// \$ | \^
	positionchar: {regex: /^([$^])/},
	
	backslash: {regex: /^\\/},
	achar: {regex: /^([^\\])/}, // TODO: add |\u{HHHH} etc

	charbycode: {
		controlchar: { regex: /^(c[A-Z])/ },
		nullchar: { regex: /^0/ },
		hexa2char: { regex: /^x[A-f0-9]{2}/ },
		hexa4char: { regex: /^u[A-f0-9]{4}/ },
		unicodechar: { regex: /^u\{[A-f0-9]{4}\}/ },
		inside: {lexems: [charbycode.controlchar, charbycode.nullchar, charbycode.hexa2char, charbycode.hexa4char, charbycode.unicodechar], usingOr},
		lexems: [backslash, charbycode.inside],
	},
	escapedchar: {
		backref: { regex: /^\d+/ },
		lexems: [backslash, {lexems: [charbycode.inside, escapedchar.backref, backslash, achar], usingOr}],
	},

	// ("[" | "[^"), (escapedchar | range | achar)*, "]"
	characterset: {
		opennormal: { regex: /^\[/ },
		opennegated: { regex: /^\[\^/ },
		open: {lexems: [characterset.opennormal, characterset.opennegated], usingOr},
		close: { regex: /^\]/ },

		// backspace: {regex: /^\\b/}, // TODO: as astid

		dash: {regex: /^-/ },
		range: {lexems: [achar, characterset.dash, achar]},
		
		inside: {lexems: [escapedchar, characterset.range, achar], usingOr},
		lexems: [characterset.open, {type: characterset.inside, repeat, optional}, characterset.close],
	},

	matchgroup: {
		opennormal: { regex: /^\(/ },
		grouptype: { regex: /^(\?:|\?=|\?!)/ },
		open: {lexems: [characterset.opennormal, {type: matchgroup.grouptype, optional}]},
		close: { regex: /^\)/ },
		lexems: [matchgroup.open, {type: orlist, repeat, optional}, matchgroup.close],
	},

	// (\+ | \? | \*) | matchcount
	modifierchar: {regex: /^([+?*])/},
	matchcount: {regex: /^{(\d+)?,(\d+)?}/},
	matchmodifier: {lexems: [modifierchar, matchcount], usingOr},

	// matchable, matchmodifier*
	matchable: {lexems: [achar, escapedchar], usingOr},
	matchstep: {lexems: [matchable, {type: matchmodifier, optional, repeat}]},

	// positionchar?, matchstep?, positionchar?
	step: {lexems: [{type: positionchar, optional}, {type: matchstep, optional}, {type: positionchar, optional}]},

	// step, (\|, step)*
	orchar: {regex: /^\|/},
	orlistrest: {lexems: [orchar, {type: step, optional}]},
	orlist: {lexems: [step, {type: orlistrest, optional, repeat}]},

	// regexp: {regex: /^\/(\\.|[^\\])*\/([a-z]+)?/},

	// \/, step+, \/, flags?
	lexems: [open, {type: orlist, repeat}, close, {type: flags, optional}],
}), {n: 5})

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
