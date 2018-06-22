// filterExpression/lexemUtils.test.js
// LayerRenamer
//
// created by Leonard Pauli, 22 jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import {stupidIterativeObjectDependencyResolve as objr} from '../object'
import {flags, expand} from './lexemUtils'

const {autoInsertIfNeeded, optional, repeat, usingOr} = flags

describe('lexem expand', ()=> {
	it('adds name - top level', ()=> {
		const root = {a: {regex: /^a/}}
		root.lexems = [root.a]
		expand(root)
		expect(root.name).toBe('@')
		expect(root.a.name).toBe('@.a')
		expect(root.lexems[0]).toBe(root.a)
	})
	it('adds name - lexems', ()=> {
		const root = {a: {regex: /^a/}}
		root.lexems = [root.a, {lexems: [{regex: /^b/}, {regex: /^c/}]}]
		expand(root)
		expect(root.lexems[1].name).toBe('@.1')
		expect(root.lexems[1].lexems[0].name).toBe('@.1.0')
	})
	it('stupidIterativeObjectDependencyResolve does some of it\'s job', ()=> {
		const root = {a: {regex: /^a/}}
		root.lexems = [root.a]
		const root2 = objr(({a})=> ({a: {regex: /^a/}, lexems: [a]}))
		expect(root2).toEqual(root)
		expect(root2.lexems[0]).toBe(root2.a)
	})
	it('throws if regex matches 0-length', ()=> {
		// alternatively check location.e-location.s > 0 in tokenizer to avoid infinite loop
		const root = {a: {regex: /^a*/}}
		root.lexems = [root.a]
		expect(()=> expand(root)).toThrow(/zero length/)
	})
	it('unwraps [lexem, flags] -> {...}', ()=> {
		const root = {a: {regex: /^a/}}
		root.lexems = [[root.a, {optional}], {lexems: [
			[{regex: /^b/, description: 'inner'}, {optional}], {regex: /^c/}]}]
		expand(root)
		
		expect(root.lexems[0].name).toBe('@.a')
		expect(root.lexems[0].extends[0]).toBe(root.a)
		expect(root.lexems[0].optional).toBe(true)

		expect(root.lexems[1].lexems[0].name).toBe('@.1.0')
		expect(root.lexems[1].lexems[0].extends[0].description).toBe('inner')
		expect(root.lexems[1].lexems[0].optional).toBe(true)
	})
	// TODO: use sticky match (regex flag y + regex.lastIndex) so "^" isn't needed all the time
})
