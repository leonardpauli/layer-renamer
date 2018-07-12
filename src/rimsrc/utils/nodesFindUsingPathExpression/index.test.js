// nodesFindUsingPathExpression.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import sfo, {log} from 'string-from-object'
import {testTokenizeStr, testManyGet} from '../parser/testUtils'
import {expand} from '../parser/lexemUtils'

import {evaluateStr, exprCtxDefaultGet} from '.'


describe.skip('tokenize', ()=> {
	// testTokenizeStr(exprCtxDefaultGet(), 'a.aa', [['a', '@.id'], ['.', '@.dot'], ['aa', '@.id']])
	// testTokenizeStr(exprCtxDefaultGet(), 'a+', [['a', '@.id'], ['+', '@.id.special']])
})


describe.skip('evaluate', ()=> {
	const baseNodes = []
	const setup = {
		titleGet: ()=> '',
		propertiesGet: ()=> ({}),
		parentGet: ()=> null,
		childrenGet: ()=> [],
	}

	const testMany = testManyGet(s=> {
		const ctx = exprCtxDefaultGet(setup)
		return evaluateStr(s, ctx)
	})

	describe('regex', ()=> testMany({
		'/a/': [],
		'/(a)/': [],
		'/.*/': [],
		'/b/': [],
		'/A/': [],
		'/A/i': [],
	}))
	describe('path', ()=> testMany({
		'>': [],
		'>2n+1>1': [],
	}))
	describe('filter', ()=> testMany({
		'()': [],
		'(1=1)': [],
		'(1=0)': [],
		'(color="red")': [],
		'(p.title="hello")': [],
	}))
	describe('together', ()=> testMany({
		'/a//b/': [],
		'(1=1)(2=2)': [],
		'/a/(color="red")': [],
		'/a/(color="red")/b/': [],
		'/a/>(color="red")/b/>1': [],
	}))
})
