// filterExpression/aster.js
// LayerRenamer
//
// created by Leonard Pauli, 22 jun 2018
// copyright © Leonard Pauli 2018

import sfo, {log} from 'string-from-object'


const concat = xxs=> xxs.reduce((a, xs)=> (a.push(...xs), a), [])

const valueEq = (a, b)=> a==b

// TODO: add astid parts etc to lexer definitions (+ priorites next to lexems using them or global?)
// TODO: add ast only "tokens"/nodes to lexem definitions?
// TODO: make ast return "tokens" from lexem definitions as nodes?
// TODO: when level1deep copy lexems in tokenizer, add extends so ref is correct
// 	(could probably use prototype/classes instead but nah, want to optimise for easy move to rim)

const astid = {
	// comma: {is: ({lexem, match})=> lexem.name==='id' && match[0]===',', infix: true},
	comma: {is: (_, [t, v])=> t==='id' && v===',', infix: true},
	
	plus: {is: (_, [t, v])=> t==='id' && v==='+', infix: true},
	minus: {is: (_, [t, v])=> t==='id' && v==='-', infix: true},
	mul: {is: (_, [t, v])=> t==='id' && v==='*', infix: true},
	div: {is: (_, [t, v])=> t==='id' && v==='/', infix: true},

	other: {is: ()=> true, prefix: true},
}
const priorities = [
	astid.comma,
	
	astid.plus,
	astid.minus,
	astid.mul,
	astid.div,
	
	astid.other,
]
priorities.forEach((p, i)=> p.p = i)
const astidGet = vtoken=> priorities.find(id=> id.is(vtoken.t, vtoken.v))

const vtokensGroup = vtokens=> {
	if (vtokens.length <= 1) return vtokens

	const ordered = vtokens.slice().sort((a, b)=> a.id.p-b.id.p)
	const [mid] = ordered
	const idx = vtokens.indexOf(mid)
	const pre = vtokens.slice(0, idx)
	const suf = vtokens.slice(idx+1)
	
	return mid.id.infix ? [mid, vtokensGroup(pre), vtokensGroup(suf)]
		: mid.id.prefix ? vtokensGroup([...pre, [mid, vtokensGroup(suf)]])
		: mid.id.suffix ? vtokensGroup([[mid, vtokensGroup(pre)], ...suf])
		: (()=> { throw new Error(`vtokensGroup: vtoken.id(${sfo(mid.id, 2)}) (pre/in/suf) -fix unspecified`) })()
}
const exprOrderEval = (ctx, vtokens)=> {
	vtokens.map(vt=> vt.id = astidGet(vt))

	const group = vtokensGroup(vtokens)
	const extractV = vtOrG=> Array.isArray(vtOrG)
		? vtOrG.length==1? vtOrG.map(extractV)[0]: vtOrG.map(extractV)
		: vtOrG.v

	return group.map(extractV)
}

const handleUnhandled = ({lexem, ...rest})=> log({'lexem.name': lexem.name, ...rest})
export const astify = (ctx, {lexem, match, tokens})=>
		lexem.name === '@.expr' ? exprOrderEval(ctx, tokens.map(t=> ({t, v: astify(ctx, t)})))
	: lexem.name === '@.expr.1' ? astify(ctx, tokens.find(t=> t.lexem.name === '@.expr.single'))
	: lexem.name === '@.expr.single' ? tokens.length!=1
			? log({err: 'expr len', tokens})
			: astify(ctx, tokens[0])
	: lexem.name === '@.sp' ? null
	: lexem.name === '@.id' ? ['id', match[0]] // ctx.vars[match[0]]
	: lexem.name === '@.id.special' ? ['id', match[0]] // ctx.vars[match[0]]
	: lexem.name === '@.id.strip' ? ['id.strip', ...tokens.map(({lexem, match, tokens})=>
			lexem.name === '@.dot' ? null
		: lexem.name === '@.id' ? match[0]
		: astify(ctx, lexem)).filter(a=> a!==null)]
	: lexem.name === '@.num' ? ['num', Number(match[0])]
	: lexem.name === '@.text' ? ['text', ...concat(tokens.filter(t=> t.lexem.name === '@.text.inner').map(l=> l.tokens.map(({lexem, match, tokens})=>
			lexem.name === '@.text.raw' ? match[0]
		: lexem.name === '@.text.expr' ? astify(ctx, tokens.find(t=> t.lexem.name === '@.paren'))
		: handleUnhandled({lexem, tokens}))))]
	: lexem.name === '@.paren' ? astify(ctx, tokens.find(t=> t.lexem.name === '@.expr'))
	: handleUnhandled({lexem, tokens})
