// regularExpression/lexems.js
// LayerRenamer
//
// created by Leonard Pauli, 25 jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import {stupidIterativeObjectDependencyResolve} from '../object'
import {root as filterExpression} from '../filterExpression'

import {flags, expand} from '../parser/lexemUtils'

// TODO: ability to define a lexem as failable,
// 	eg. behaves like optional during matching (but always returns as matched)
// 	+ if not matched, append error to ctx
// 	eg. backref in characterset


// --- TOKENIZE ----

const {optional, repeat, usingOr} = flags

// lexems definition

const root = stupidIterativeObjectDependencyResolve(({
	open, close, flags,
	backslash, achar,
	charbycode,
	escapedchar, echar, backref,
	characterset,
	matchgroup, matchmodifiergroup,
	modifierchar, matchcount, matchmodifier,
	matchable, matchstep, matchstart, matchend, step,
	orchar, orlistrest, orlist,
})=> ({
	name: 'regexp',
	open: {regex: /^\//},
	close: {regex: /^\//},
	flags: {regex: /^[gmsiyu]{1,6}/},
	
	backslash: {regex: /^\\/},
	achar: {regex: /^([^\\])/},

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
		achar: {regex: /^([^\\\d])/},
		lexems: [backslash, {lexems: [charbycode.inside, backslash, escapedchar.achar], usingOr}],
	},
	echar: {lexems: [escapedchar, achar], usingOr},
	backref: { regex: /^\\(\d+)/ },

	// ("[" | "[^"), (escapedchar | range | achar)*, "]"
	characterset: {
		opennormal: { regex: /^\[/ },
		opennegated: { regex: /^\[\^/ },
		open: {lexems: [characterset.opennegated, characterset.opennormal], usingOr},
		close: { regex: /^\]/ },

		achar: {regex: /^([^\\\]])/},
		echar: {lexems: [escapedchar, characterset.achar], usingOr},

		// backspace: {regex: /^\\b/}, // TODO: as astid

		dash: {regex: /^-/ },
		range: {lexems: [characterset.echar, characterset.dash, characterset.echar]},
		
		inside: {lexems: [characterset.range, characterset.echar], usingOr},
		// lexems: [characterset.open, {type: characterset.inside, repeat, optional}, characterset.close],
		lexems: [characterset.open, {type: characterset.inside, repeat, optional}, characterset.close],
	},

	matchgroup: {
		opennormal: { regex: /^\((?!\?)/ },
		opennoncapture: { regex: /^\((\?:)/ },
		open: {lexems: [matchgroup.opennormal, matchgroup.opennoncapture], usingOr},
		close: { regex: /^\)/ },
		lexems: [matchgroup.open, {type: orlist, optional}, matchgroup.close],
	},
	matchmodifiergroup: {
		opennormal: { regex: /^\((?!\?)/ },
		grouptype: { regex: /^(\?=|\?!)/ },
		open: {lexems: [matchmodifiergroup.opennormal, matchmodifiergroup.grouptype]},
		close: { regex: /^\)/ },
		lexems: [matchmodifiergroup.open, {type: orlist, optional}, matchmodifiergroup.close],
	},

	// (\+ | \? | \*) | matchcount
	modifierchar: {regex: /^([+?*])/},
	matchcount: {regex: /^{(\d+)?,(\d+)?}/},
	matchmodifier: {lexems: [modifierchar, matchcount, matchmodifiergroup], usingOr},

	// matchable, matchmodifier*
	matchable: {lexems: [characterset, matchgroup, echar, backref], usingOr},
	matchstep: {lexems: [matchable, {type: matchmodifier, optional, repeat}]},

	// positionchar?, matchstep?, positionchar?
	matchstart: {regex: /^\^/},
	matchend: {regex: /^\$/},
	step: {lexems: [{type: matchstart, optional}, {type: matchstep, optional, repeat}, {type: matchend, optional}]},

	// step, (\|, step)*
	orchar: {regex: /^\|/},
	orlistrest: {lexems: [orchar, {type: step, optional}]},
	orlist: {lexems: [step, {type: orlistrest, optional, repeat}]},

	// \/, step+, \/, flags?
	lexems: [open, orlist, close, {type: flags, optional}],

	// simple: {regex: /^\/(\\.|[^\\])*\/([a-z]+)?/ },
}), {n: 3})

expand(root)

export default root
