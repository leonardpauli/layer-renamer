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

// TODO: yield tokens when as soon as decided (eg. not inside usingAnd block, or rest is optional)
// eslint-disable-next-line max-statements
export const parseStrNext = (ctx, _str)=> {
	if (!ctx.lexem.lexems) throw new Error( // TODO: possibly just autowrap if necessary?
		`parseStrNext: ctx.lexem(${ctx.lexem.name}) has to have .lexems; -> just wrap it {lexems: [<lexem>]}`)
	if (ctx.lexem.repeat) throw new Error( // TODO: possibly just autowrap if necessary?
		`parseStrNext: ctx.lexem(${ctx.lexem.name}) can't have .repeat; -> just wrap it {lexems: [<lexem>]}`)

	const blocks = [ctx.lexem]
	const blockis = []
	let blocksi = 0
	let str = _str

	const doneWithLexemsBefore = block=> {
		// block.matched // already set in loop
		block.tokens = block.matched? concat(block.lexems.map(l=> l.tokens || [])): []
		blocks.pop(); blockis.pop(); blocksi-- // remove current block
		doneWithLexemBefore()
		const repeatLexemOptionally = block.matched && block.repeat
		if (repeatLexemOptionally) {
			blocks[blocksi].lexems.splice(blockis[blocksi], 0, {
				...block, tokens: void 0, matched: void 0, optional: true})
		}
	}
	const doneWithLexemBefore = ()=> {
		blockis[blocksi]++ // do next step on block
	}
	const safeToYieldGet = ()=> !blocks
		.filter((v, i)=> i <= blocksi)
		.some(b=> !b.usingOr) // TODO: should also be ok if rest lexems in an usingAnd is optional

	while (blocks.length > 0) {
		if (blocksi >= blocks.length) throw new Error( // TODO: shouldn't happen, remove
			`blocksi > blocks.length (${blocksi} > ${blocks.length})`)
		const block = blocks[blocksi] // TODO: will always be last? replace with blocks.length-1?
		const {usingOr} = block
		const usingAnd = !usingOr
		// const safeToYield = safeToYieldGet()

		const enteringNextBlock = blocksi == blockis.length
		if (enteringNextBlock) {
			blockis.push(0)
			block.lexems && (block.lexems = block.lexems.map(l=> ({...l, tokens: void 0, matched: void 0}))) // copy lexems for later mod
			block.lexems && (block.matched = !usingOr) // set matched var default state
		} else if (blocksi > blockis.length) throw new Error( // TODO: shouldn't happen, remove
			`blocksi > blockis.length (${blocksi} > ${blockis.length})`)
		const blocki = blockis[blocksi]

		const {lexems} = block
		const doneWithLexems0 = blocki == lexems.length
		if (doneWithLexems0) {
			doneWithLexemsBefore(block)
			continue
		}
		const lexem = lexems[blocki]
		// log({lexem, lexems, blocki})
		if (lexem.lexems) { // create block
			blocks.push(lexem); blocksi++
			continue
		}

		if (!lexem.regex) throw new Error( // TODO: shouldn't happen, remove
			`expected lexem(${lexem}, ${lexem.name}).regex to exist`)

		const match = str.match(lexem.regex)
		if (!match) {
			lexem.matched = false

			const doneWithLexems1 = usingAnd && !lexem.optional
			if (doneWithLexems1) {
				block.matched = false
				doneWithLexemsBefore(block)
				continue
			}

			doneWithLexemBefore()
			continue
		}

		lexem.tokens = [{match, lexem}]
		lexem.matched = true
		const retainLength =
				lexem.retain===true ? match.length
			: lexem.retain>=0 ? lexem.retain
			: Math.max(0, match.length + lexem.retain)
		const restStr = str.substr(retainLength)
		str = restStr

		const doneWithLexems2 = usingOr
		if (doneWithLexems2) {
			block.matched = true
			doneWithLexemsBefore(block)
			continue
		}

		doneWithLexemBefore()
		continue
	}

	return ctx.lexem.tokens
}

export const exprCtxDefault = {lexem: lexemRoot.expr}
