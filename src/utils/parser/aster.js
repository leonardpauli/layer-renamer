// filterExpression/aster.js
// LayerRenamer
//
// created by Leonard Pauli, 22 jun 2018
// copyright © Leonard Pauli 2018

import sfo, {log} from 'string-from-object'
import {lexemIs} from './lexemUtils'

const concat = xxs=> xxs.reduce((a, xs)=> (a.push(...xs), a), [])

const valueEq = (a, b)=> a==b


// tokensGroupPrio

export const tokensGroupPrio = (ctx, token, lexemsAstTypes)=> {
	token.tokens.forEach(t=> astify(ctx, t))
	if (!token.astTokens) astTokensSet(token)
	token.astTokens.forEach(t=> t.astId = astidGet(lexemsAstTypes, t))
	return tsGPInner(token.astTokens)
}

const tsGPInner = astTokens=> {
	const vs = astTokens
	if (vs.length == 1) return vs[0]
	if (vs.length <= 1) return vs

	const ordered = vs.slice().sort((a, b)=> a.astId.prio-b.astId.prio)
	const [mid] = ordered
	const idx = vs.indexOf(mid)
	const pre = vs.slice(0, idx)
	const suf = vs.slice(idx+1)
	
	const {astId} = mid
	return astId.infix ? [mid, tsGPInner(pre), tsGPInner(suf)]
		: astId.prefix ? tsGPInner([...pre, [mid, tsGPInner(suf)]])
		: astId.suffix ? tsGPInner([[mid, tsGPInner(pre)], ...suf])
		: (()=> { throw new Error(`tsGPInner: vtoken.id(${sfo(astId, 2)}) (pre/in/suf) -fix unspecified`) })()
}


// helpers

const astidGet = (types, token)=> types.find(id=> id.is(token))
const astTokensSet = token=> token.astTokens = concat(token.tokens.map(t=> t.type.astTokenWrapperIs? t.astTokens: t.type.astTokenNot? []: [t]))

// TODO: return required root.error lexem instead with tokens + org lexem attached?
export const handleUnhandled = (token, rest)=>
	log({err: 'astify unhandled token', token, ...rest}, 3) || null


// astify

export const astify = (ctx, token)=> {
	if (!token) throw new Error(`no token passed to astify`)
	if (token.astValue!==void 0) return token.astValue
	if (!token.type.astValueGet) return token.astValue = handleUnhandled(token, {
		from: 'astify', err: 'astValueGet missing'})
	// TODO: have either astValue OR astTokens, not both?
	token.astValue = token.type.astValueGet(ctx, token)
	if (!token.astTokens) astTokensSet(token)
	return token.astValue
}
