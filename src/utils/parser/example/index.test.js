// utils/parser/example/index.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import sfo, {log} from 'string-from-object'
import {testTokenizeStr, logAstValue, testManyGet} from '../testUtils'

import {evaluateStr, exprCtxDefaultGet} from '.'


describe('tokenize', ()=> {
	describe('minor', ()=> {
		testTokenizeStr(exprCtxDefaultGet(), '66', [['66', '@.num']])
	})
})

describe('evaluate', ()=> {
	const testMany = testManyGet(evaluateStr)
	testMany({
		'1': [1],
		'2+3': [5],
		' 2 + 3': [void 0, ' 2 + 3'],
		'2 + 3': [5],
		'2*3+4': [10],
		'2+3*4': [14],
		'(2+3)*4': [20],
		'( (3 * (4) + 2) )': [14],
	})
})
