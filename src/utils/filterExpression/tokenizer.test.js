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
		expect(to.lexem.name).toBe(name)
		expect(to.lexem.location).toEqual(location)
		expect(to.lexem.matched).toBe(true)
		return false
	})
}
const testTokens = (tokens, targets)=> {
	try {
		_testTokens(tokens, targets)
	} catch (err) { log(tokens); throw err }
}
const testTokensL = (lexem, str, targets)=> testTokens(tokenizeNext({lexem}, str), targets)


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
		
		testTokensL(root, 'b', [])
		testTokensL(root, 'a', [['a', '@.0', {s: 0, e: 1}]])
	})

	it('a? & b', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [{...a, optional}, b],
		})); expand(root)
		
		testTokensL(root, 'a', [])
		testTokensL(root, 'b', [['b', '@.b', {s: 0, e: 1}]])
		testTokensL(root, 'ab', [['a', '@.0', {s: 0, e: 1}], ['b', '@.b', {s: 1, e: 2}]])
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

describe.skip('repeat', ()=> {
	it('a+', ()=> {
		const root = objr(({a})=> ({
			a: {regex: /^a/},
			lexems: [{...a, repeat}],
		})); expand(root)
		
		// testTokensL(root, 'a', [])
	})

	it('a+ & b', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [{...a, repeat}, b],
		})); expand(root)
		
		// testTokensL(root, 'a', [])
	})
	it('a+ | b', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [{...a, repeat}, b], usingOr,
		}))

		// testTokensL(root, 'a', [])
	})

	it('a & b+', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [a, {...b, repeat}],
		})); expand(root)
		
		// testTokensL(root, 'a', [])
	})
	it('a | b+', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [a, {...b, repeat}], usingOr,
		}))

		// testTokensL(root, 'a', [])
	})
})

describe.skip('repeat optional', ()=> {
	it('a*', ()=> {
		const root = objr(({a})=> ({
			a: {regex: /^a/},
			lexems: [{...a, repeat, optional}],
		})); expand(root)
		
		// testTokensL(root, 'a', [])
	})
	it('a* & b', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [{...a, repeat, optional}, b],
		})); expand(root)
		
		// testTokensL(root, 'a', [])
	})

	it('a & b*', ()=> {
		const root = objr(({a, b})=> ({
			a: {regex: /^a/},
			b: {regex: /^b/},
			lexems: [a, {...b, repeat, optional}],
		})); expand(root)
		
		// testTokensL(root, 'a', [])
	})
})

describe.skip('nested', ()=> {
	it('(a)', ()=> {
		// const root = objr(({a})=> ({
		// 	a: {regex: /^a/},
		// 	lexems: [{...a, repeat, optional}],
		// })); expand(root)
		
		// testTokensL(root, 'a', [])
	})
	it('((a))', ()=> {
		// const root = objr(({a})=> ({
		// 	a: {regex: /^a/},
		// 	lexems: [{...a, repeat, optional}],
		// })); expand(root)
		
		// testTokensL(root, 'a', [])
	})

	it('((a))', ()=> {
		// const root = objr(({a})=> ({
		// 	a: {regex: /^a/},
		// 	lexems: [{...a, repeat, optional}],
		// })); expand(root)
		
		// testTokensL(root, 'a', [])
	})
	
})
