// filterExpression.js
// LayerRenamer
//
// created by Leonard Pauli, mid jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import lexemRoot from './lexems'

const concat = xxs=> xxs.reduce((a, xs)=> (a.push(...xs), a), [])


const evaluateCtxGet = (ctx = {})=> ({...ctx})
const evaluate = (ctx, expr)=> expr.value =
		expr.value !== void 0 ? expr.value
	: expr.type == 'and' ? !expr.list.some(e=> !evaluate(ctx, e))
	: expr.type == 'or' ? expr.list.some(e=> evaluate(ctx, e))
	: expr.type == 'primitive' ? expr.value
	: expr.type == 'property' ? ctx[expr.key]
	: expr.type == 'eq' ? (([fste, ...es], fstv = evaluate(ctx, fste))=>
		!es.some(e=> !valueEq(fstv, evaluate(ctx, e))))(expr.list)
	: null

const valueEq = (a, b)=> a==b


// path parsing

export const parseStrPart = (str, ctx = parseStrCtxGet())=> {
	const state = {}
	const path = [...parseStr(str, ctx, state)]; const {restStr} = state
	// if (restStr===str) throw new Error(`Path "${restStr}" isn't valid path`)
	return {path, restStr}
}

export const parseStr = function* parseStr (str, ctx, state = {}) {
	state.restStr = str; let item
	while (state.restStr && ({item, restStr: state.restStr} =
		parseStrNext(ctx, state.restStr), item)) yield item
	return state.restStr
}

const parseStrCtxGet = (ctx = {})=> ({...exprCtxDefault, ...ctx})

// ({[l]}, s) -> ([t], s), ctx={lexem: lexemtree -> [lexem: l]}, t=token={lexem, match, location?}
// const parseStrNext = (ctx, str)=> {
// 	const {lexem} = ctx
// 	if (lexem.regex) {
// 		const match = str.match(lexem.regex)
// 		if (!match) return {matched: false, tokens: [], restStr: str}
// 		const token = {match, lexem}
// 		const restStr = str.substr(
// 				lexem.retain===true ? match.length
// 			: lexem.retain>=0 ? lexem.retain
// 			: Math.max(0, match.length + lexem.retain)
// 		)
// 		return {matched: true, tokens: [token], restStr}
// 	}

// 	const lexems = lexem.and || lexem.or
// 	const usingAnd = lexem.and
// 	const tokens = []; let restStr = str; let doNext = false; let i = 0
// 	do {
// 		const l = lexems[i]
// 		const matchedOk = false; let repeatDo = false
// 		do {
// 			// TODO: convert to loop to avoid stack overflow issue
// 			// 	(code has to be weeeery nested for that to happen, though we're striving for infinity)
// 			const {matched, tokens, restStr: rs} = parseStrNext({...ctx, lexem: l}, restStr)
// 			repeatDo = matched && l.repeat && rs !== restStr
// 			if (matched) { tokens.push(...tokens); restStr = rs; matchedOk = true }
// 		} while (repeatDo)
// 		doNext = usingAnd? l.optional || matchedOk: !matchedOk
// 	} while (doNext && ++i < lexems.length)
// 	const matched = usingAnd? doNext: !doNext
// 	return {matched, tokens, restStr}
// }


// eslint-disable-next-line max-statements
export const parseStrNext = (ctx, str)=> {
	// assumes ctx.lexem has gone through lexemUtils.expand for validation etc
	if (!ctx.lexem.lexems) throw new Error( // TODO: possibly just autowrap if necessary?
		`parseStrNext: ctx.lexem(${ctx.lexem.name}) has to have .lexems; -> just wrap it {lexems: [<lexem>]}`)
	if (ctx.lexem.repeat) throw new Error( // TODO: possibly just autowrap if necessary?
		`parseStrNext: ctx.lexem(${ctx.lexem.name}) can't have .repeat; -> just wrap it {lexems: [<lexem>]}`)

	// b = block, l = lexem, i = index
	// bs  = [b, b, ...]; b  = bs[bi];  b = [l, l, ...]
	// lis = [i, i, ...]; li = lis[bi]; l = b[li]
	// bi = bs.length-1
	//
	// b.usingAnd = b.lexems && !b.usingOr
	//
	// b.location.(s, e) // start, end; index in str

	const baseLexem = ctx.lexem // Beware! mutating // lexemCopyClean1Level(ctx.lexem)
	baseLexem.location = {s: 0, e: 0}
	const se = str.length // string end, possibly take from baseLexem.location.e
	const bs = [baseLexem]
	const lis = []


	while (bs.length > 0) {
		// get block
		const bi = bs.length-1
		if (bi >= bs.length || bi >= lis.length+1) throw new Error( // TODO: shouldn't happen, remove
			`bi >= bs.length (${bi} >= ${bs.length}) || bi >= lis.length+1`)
		const b = bs[bi]

		// get lexem index + starting on new block
		if (bi == lis.length) {
			lis.push(0)
			
			const bPrev = bi>0? bs[bi-1]: null
			b.location.s = bPrev? bPrev.location.e: 0
			b.location.e = b.location.s

			b.tokens = []

			if (b.lexems) {
				b.lexems = b.lexems.map(lexemCopyClean1Level)
				b.matched = !b.usingOr // set matched var default state
			}
		}
		const li = lis[bi]

		// get lexem
		const ls = b.lexems
		if (li == ls.length) { // done with block
			bNextDo(bs, lis)
			continue
		}
		if (li > ls.length) throw new Error( // TODO: shouldn't happen, remove
			`li > ls.length (${li} > ${ls.length})`)
		const l = ls[li]

		// TODO: yield tokens when as soon as decided
		// 	(eg. not inside usingAnd block, or rest is optional)
		// 	const safeToYield = safeToYieldGet(bs)

		if (l.lexems) { // add + goto new block
			bs.push(l)
			continue
		}

		l.location.s = b.location.e
		l.location.e = se

		// log({al: l})
		const match = str.substring(l.location.s, l.location.e).match(l.regex)
		if (!match) {
			l.tokens = []
			l.matched = false; handleMatch(bs, lis); continue
		}

		const retainLength =
				l.retain===true ? match[0].length
			: l.retain>=0 ? l.retain
			: Math.max(0, match[0].length + l.retain)
		l.location.e = l.location.s + retainLength
		// log({lo:l.location.s, retainLength, match, r: l.retain})

		l.tokens = [{match, lexem: l, location: l.location}]
		l.matched = true; handleMatch(bs, lis); continue
	}

	return baseLexem.tokens
}

export const exprCtxDefaultGet = ()=> ({lexem: lexemCopyClean1Level(lexemRoot.expr)})


// helpers

export const lexemCopyClean1Level = l=> ({...l, tokens: void 0, matched: void 0, location: {s: 0, e: 0}}) // s=start, e=end

const safeToYieldGet = bs=> !bs
	.filter((v, i)=> i <= bs.length-1)
	.some(b=> !b.usingOr) // TODO: should also be ok if rest lexems in an usingAnd is optional


// logic subs

const handleMatch = (bs, lis)=> {
	const bi = bs.length-1; const li = lis[bi]
	const b = bs[bi]
	const l = b.lexems[li]

	const {repeatShould, bNextDoShould} = fixOk(b, l)
	
	if (repeatShould) lInsertForRepeatOptional(bs, lis, l)
	else if (bNextDoShould) { bNextDo(bs, lis); return }

	lNextDo(bs, lis)
}

const fixOk = (b, l)=> {
	const repeatShould = l.matched && l.repeat
	const repeatFirst = l.repeat && !l.optional // no optional non-repeat in or
	const matchedDefaultChanged = b.matched == b.usingOr
	const backFromFailingRepeat = l.repeat && matchedDefaultChanged
	const bNextDoShould =
				(b.usingOr && l.matched)
		|| (!b.usingOr && !l.matched && !l.optional)
		|| backFromFailingRepeat

	if (bNextDoShould && (repeatFirst || !l.repeat))
		b.matched = l.matched // or will turn on, and will turn off
	if (b.matched) b.location.e = l.location.e
	// log({l, repeatShould, repeatFirst, matchedDefaultChanged, backFromFailingRepeat, bNextDoShould, b}, 3)

	return {repeatShould, bNextDoShould}
}

const bNextDo = (bs, lis)=> {
	const bi = bs.length-1; const li = lis[bi]
	const b = bs[bi]
	// const l = b[li]

	// b.matched // keep it as is, either the default or changed in handleMatch
	b.tokens = b.matched? concat(b.lexems.slice(0, li+1).map(l=> l.tokens)): []
	bs.pop(); lis.pop() // remove current/last b
	
	const {repeatShould, bNextDoShould} = bi>0? fixOk(bs[bi-1], b): {}

	// if (repeatShould) lInsertForRepeatOptional(bs, lis, b)
	// else if (bNextDoShould) { bNextDo(bs, lis); return }
	// log({b}, 3)

	lNextDo(bs, lis)
}

const lInsertForRepeatOptional = (bs, lis, l)=> {
	const bi = bs.length-1; const li = lis[bi]
	const b = bs[bi]
	// const l = b[li]

	b.lexems.splice(li+1, 0, {...lexemCopyClean1Level(l), optional: true})
}

const lNextDo = (bs, lis)=> {
	const bi = bs.length-1
	lis[bi]++ // do next step on b
	// log({a: true, bs, lis, bi, lexems: bs[bi] && bs[bi].lexems})
}
