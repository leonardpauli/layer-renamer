// utils/parser/testUtils.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

/* global expect it */

import sfo, {log, custom} from 'string-from-object'
import {tokenizeNext} from '../parser/tokenizer'


export const testTokenizeStr = (ctx, str, tasexp)=> it(str, ()=> {
	const tokens = tokenizeNext(ctx, str)
	const tas = tokens.filter(t=> t.match).map(t=> [t.match[0], t.type.name])
	try {
		expect(tas).toHaveLength(tasexp.length)
		tas.some((t, i)=> {
			const [s, name] = tasexp[i]
			s && expect(t[0]).toBe(s)
			name && expect(t[1]).toBe(name)
			return false
		})
	} catch (err) { log(tas); throw err }
})


const logAstValuePlain = custom({
 	indentation: '  ', colors: true,
	depth: 10,
	filter: ({key, value, parent})=> value !== void 0
		&& !(parent.key === 'type')
		&& !(parent.key === 'astId')
		&& !'optional,repeat,tokens,lexems,location,match,matched'.split(',').includes(key),
})
export const logAstValue = (...args)=> console.log(logAstValuePlain(...args))
