// utils/parser/aster.js
// LayerRenamer
//
// created by Leonard Pauli, 22 jun 2018
// copyright © Leonard Pauli 2018

import sfo, {log} from 'string-from-object'
import {lexemIs, lexemExtendCopyClean1Level} from './lexemUtils'

const concat = xxs=> xxs.reduce((a, xs)=> (a.push(...xs), a), [])


// tokensGroupPrio

export const tokensGroupPrio = (ctx, token, lexemsAstTypes)=> {
	token.tokens.forEach(t=> astify(ctx, t))
	if (!token.astTokens) astTokensSet(token)

	token.astTokens.forEach(t=> t.astId = astidGet(lexemsAstTypes, t))
	return tsGPInner(token, token.astTokens)
}

// (t, ts) -> t?
const tsGPInner = (token, astTokens)=> {
	const vs = astTokens
	if (vs.length == 1) return vs[0]
	if (vs.length == 0) return null

	const ordered = vs.slice().sort((a, b)=> a.astId.prio-b.astId.prio)
	const [mid] = ordered
	const idx = vs.indexOf(mid)
	const prets = vs.slice(0, idx)
	const sufts = vs.slice(idx+1)

	const rett = Object.assign(lexemExtendCopyClean1Level(token), {
		matched: true,
	})
	
	const {astId} = mid
	if (astId.infix) {
		const suft = tsGPInner(token, sufts)
		const pret = tsGPInner(token, prets)
		rett.location.s = mid.location.s
		rett.location.e = suft.location.e
		rett.astValue = [mid, pret, suft]
		return rett
	} else if (astId.prefix) {
		const suft = tsGPInner(token, sufts)
		return tsGPInner(token, [...prets, [mid, suft]])
	} else if (astId.suffix) {
		const pret = tsGPInner(token, prets)
		return tsGPInner(token, [[mid, pret], ...sufts])
	}

	throw new Error(`tsGPInner: vtoken.id(${sfo(astId, 2)}) (pre/in/suf) -fix unspecified`)
}


// helpers

const astidGet = (types, token)=> types.find(id=> id.is(token))
const astTokensSet = token=> {
	token.astTokens = concat(token.tokens.map(t=>
			t.type.astTokenWrapperIs? t.astTokens // assumes astify(ctx, t) has been run
		: t.type.astTokenNot? []
		: [t]
	))
}


// TODO: return required root.error lexem instead with tokens + org lexem attached?
export const handleUnhandled = (ctx, token, rest)=>
	(ctx.errors.push({message: 'astify unhandled token', token, ...rest}), null)


// astify
// 	- astTokens are all tokens relevant for the ast
// 	- astValue is a value or array of other tokens [token{astValue}, ...], depending on parent token type

const astidPlaceholder = {name: 'astify.placeholder'}

export const astify = (ctx, token)=> {
	if (!token) throw new Error(`no token passed to astify`)
	if (token.astValue!==void 0) return token.astValue
	if (!token.type.astValueGet) return token.astValue = handleUnhandled(ctx, token, {
		from: 'astify', message: 'astValueGet missing'})
	
	token.astId = token.astId || astidPlaceholder
	token.astValue = token.type.astValueGet(ctx, token)
	if (!token.astTokens) astTokensSet(token)

	return token.astValue
}
