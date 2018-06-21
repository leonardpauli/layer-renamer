// filterExpression/tokenizer.test.js
// LayerRenamer
//
// created by Leonard Pauli, mid jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import {stupidIterativeObjectDependencyResolve as objr} from '../object'
import {tokenizeNext} from './tokenizer'
import {flags, expand} from './lexemUtils'

const {autoInsertIfNeeded, optional, repeat, usingOr} = flags

// TODO: make custom matcher
const _testTokens = (tokens, targets)=> {
	expect(tokens).toHaveLength(targets.length)
	tokens.some((to, i)=> {
		const [match0, name, location] = targets[i]
		expect(to.match[0]).toBe(match0)
		name && expect(to.lexem.name).toBe(name)
		location && expect(to.lexem.location).toEqual(location)
		expect(to.lexem.matched).toBe(true)
		return false
	})
}
const testTokens = (tokens, targets, extra = {})=> {
	try {
		_testTokens(tokens, targets)
	} catch (err) { log({tokens, targets, ...extra}); throw err }
}
const testTokensL = (lexem, str, targets, {matched = !!targets.length} = {})=> {
	testTokens(tokenizeNext({lexem}, str), targets, {str, lexem})
	expect(lexem.matched).toBe(matched)
}
const gs = s=> s.split('').map(s=> [s])
const testTokensS = (root, s)=> testTokensL(root, s, gs(s))


describe('simple', ()=> {
	it('a', ()=> {
		const root = objr(({a})=> ({
			a: {regex: /^a/},
			lexems: [a],
		})); expand(root)
		
		testTokensL(root, 'b', [])
		testTokensL(root, 'a', [['a', '@.a', {s: 0, e: 1}]])
	})

	it('a & b', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [a, b],
		})); expand(root)
		
		testTokensL(root, 'a', [])
		testTokensL(root, 'b', [])
		testTokensL(root, 'ab', [['a', '@.a', {s: 0, e: 1}], ['b', '@.b', {s: 1, e: 2}]])
	})
	it('a | b', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [a, b], usingOr,
		})); expand(root)
		
		testTokensL(root, 'a', [['a', '@.a', {s: 0, e: 1}]])
		testTokensL(root, 'b', [['b', '@.b', {s: 0, e: 1}]])
		testTokensL(root, 'ab', [['a', '@.a', {s: 0, e: 1}]])
	})
})

describe('optional', ()=> {
	it('a?', ()=> {
		const root = objr(({a})=> ({
			a: {regex: /^a/},
			lexems: [{...a, optional}],
		})); expand(root)
		
		testTokensL(root, 'b', [], {matched: true})
		testTokensL(root, 'a', [['a', '@.0', {s: 0, e: 1}]])
	})

	it('a? & b', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [{...a, optional}, b],
		})); expand(root)
		
		testTokensL(root, 'a', [])
		testTokensS(root, 'b')
		testTokensS(root, 'ab')
	})
	it('a? | b', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [{...a, optional}, b], usingOr,
		}))
		expect(()=> expand(root)).toThrow(/ambiguos.* when usingOr/)
	})
})

describe('repeat', ()=> {
	it('a+', ()=> {
		const root = objr(({a})=> ({
			a: {regex: /^a/},
			lexems: [{...a, repeat}],
		})); expand(root)
		
		testTokensL(root, 'b', [])
		testTokensL(root, 'ab', [['a']])
		testTokensS(root, 'aa')
		testTokensS(root, 'aaa')
	})

	it('a+ & b', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [{...a, repeat}, b],
		})); expand(root)
		
		testTokensL(root, 'b', [])
		testTokensL(root, 'a', [])
		testTokensL(root, 'ba', [])
		testTokensL(root, 'aa', [])
		testTokensS(root, 'ab')
		testTokensS(root, 'aab')
	})
	it('a+ | b', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [{...a, repeat}, b], usingOr,
		})); expand(root)

		testTokensL(root, 'b', [['b']])
		testTokensL(root, 'ba', [['b']])
		testTokensS(root, 'a')
		testTokensS(root, 'aa')
		testTokensL(root, 'ab', [['a', '@.0', {s: 0, e: 1}]])
		testTokensL(root, 'aab', [['a', '@.0', {s: 0, e: 1}], ['a', '@.0', {s: 1, e: 2}]])
	})

	it('a & b+', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [a, {...b, repeat}],
		})); expand(root)
		
		testTokensL(root, 'b', [])
		testTokensL(root, 'a', [])
		testTokensL(root, 'ba', [])
		testTokensL(root, 'aa', [])
		testTokensS(root, 'ab')
		testTokensL(root, 'aab', [])
		testTokensS(root, 'abb')
	})
	it('a | b+', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [a, {...b, repeat}], usingOr,
		})); expand(root)

		testTokensL(root, 'b', [['b']])
		testTokensL(root, 'bb', [['b'], ['b']])
		testTokensL(root, 'bba', [['b'], ['b']])
		testTokensL(root, 'ba', [['b']])
		testTokensL(root, 'a', [['a']])
		testTokensL(root, 'aa', [['a']])
		testTokensL(root, 'ab', [['a']])
		testTokensL(root, 'aab', [['a']])
		testTokensL(root, 'abb', [['a']])
	})
})

describe('repeat optional', ()=> {
	it('a*', ()=> {
		const root = objr(({a})=> ({
			a: {regex: /^a/},
			lexems: [{...a, repeat, optional}],
		})); expand(root)
		
		testTokensL(root, 'b', [], {matched: true})
		testTokensL(root, 'a', [['a', '@.0', {s: 0, e: 1}]])
		testTokensL(root, 'aa', [['a', '@.0', {s: 0, e: 1}], ['a', '@.0', {s: 1, e: 2}]])
	})
	it('a* & b', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [{...a, repeat, optional}, b],
		})); expand(root)
		
		testTokensL(root, 'b', [['b']])
		testTokensL(root, 'a', [])
		testTokensL(root, 'aa', [])
		testTokensL(root, 'ab', [['a'], ['b', '@.b', {s: 1, e: 2}]])
		testTokensL(root, 'aab', [['a'], ['a', '@.0', {s: 1, e: 2}], ['b']])
	})

	it('a & b*', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [a, {...b, repeat, optional}],
		})); expand(root)
		
		testTokensL(root, 'b', [])
		testTokensL(root, 'a', [['a']])
		testTokensL(root, 'aa', [['a']])
		testTokensL(root, 'ab', [['a'], ['b']])
		testTokensL(root, 'abb', [['a'], ['b'], ['b', '@.1', {s: 2, e: 3}]])
	})
})

describe('nested', ()=> {
	describe('simple', ()=> {
		it('(a)', ()=> {
			const root = objr(({a})=> ({
				a: {regex: /^a/},
				lexems: [{lexems: [a]}],
			})); expand(root)
			
			testTokensL(root, 'b', [])
			testTokensL(root, 'a', [['a', '@.a', {s: 0, e: 1}]])
		})
		it('((a))', ()=> {
			const root = objr(({a})=> ({
				a: {regex: /^a/},
				lexems: [{lexems: [{lexems: [a]}]}],
			})); expand(root)
			
			testTokensL(root, 'b', [])
			testTokensL(root, 'a', [['a', '@.a', {s: 0, e: 1}]])
		})
	})

	// it('((a | b)*, b)', ()=> {
	// 	const root = objr(({a, b, inner, outer})=> ({
	// 		a: {regex: /^a/},
	// 		b: {regex: /^b/},
	// 		inner: {lexems: [a, b], usingOr},
	// 		outer: {lexems: [{...inner, repeat, optional}, b]},
	// 		lexems: [outer],
	// 	})); expand(root)
	//
	// 	testTokensL(root, 'a', [])
	// 	// testTokensL(root, 'b', [['b', '@.b', {s: 0, e: 1}]]) // TODO: match non-greedy?
	// 	testTokensL(root, 'b', [])
	// 	testTokensL(root, 'baa', [['b', '@.b', {s: 0, e: 1}]])
	// 	// testTokensL(root, 'baab', [['b', '@.b', {s: 0, e: 1}], ['a', '@.a', {s: 1, e: 2}], ['a', '@.a', {s: 2, e: 3}], ['b', '@.b', {s: 3, e: 4}]])
	// 	// const tokens = tokenizeNext({lexem: root}, 'abbab')
	// 	// expect(tokens).toHaveLength(5)
	// })

	describe('repeat', ()=> {
		const root = objr(({a, b, inner})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			inner: {lexems: [a, b], usingOr},
			lexems: [{...inner, repeat, optional}],
		})); expand(root)

		it('(a | b)* // first', ()=> {
			testTokensS(root, 'a')
			testTokensS(root, 'b')
		})
		it('(a | b)* // many', ()=> {
			testTokensS(root, 'ab')
			testTokensS(root, 'ababaabb')
		})
	})

	it.skip('((a | b)*, c)', ()=> {
		const root = objr(({a, b, c, inner, outer})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			c: {regex: /^c/},
			inner: {lexems: [a, b], usingOr},
			outer: {lexems: [{...inner, repeat, optional}, c]},
			lexems: [outer],
		})); expand(root)
		
		testTokensL(root, 'a', [])
		testTokensL(root, 'b', [])
		testTokensL(root, 'c', [['c']])
		testTokensL(root, 'ac', [['a'], ['c']])
		testTokensL(root, 'bc', [['b'], ['c']])
		testTokensL(root, 'abc', [['a'], ['b'], ['c']])
		// testTokensL(root, 'baa', [['b', '@.b', {s: 0, e: 1}]])
		// testTokensL(root, 'baac', [['b'], ['a'], ['a'], ['c']])
		// testTokensL(root, 'baac', [['b', '@.b', {s: 0, e: 1}], ['a', '@.a', {s: 1, e: 2}], ['a', '@.a', {s: 2, e: 3}], ['c', '@.c', {s: 3, e: 4}]])
		// const tokens = tokenizeNext({lexem: root}, 'abbac')
		// expect(tokens).toHaveLength(5)
	})
	
})

// TODO: add a!, (a, b!) // should insert if not match + note in token?
