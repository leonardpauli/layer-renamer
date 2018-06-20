// utils/object.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import {log} from 'string-from-object'
import {stupidIterativeObjectDependencyResolve} from './object'

describe('stupidIterativeObjectDependencyResolve', ()=> {
	it('resolves', ()=> {
		const r = stupidIterativeObjectDependencyResolve(self=> ({
			a: 1,
			l1: {a: 2, b: 3},
			c: {a: 2, b: 3, ssum: self.s.sum, gsum: self.c.ssum, rsum: self.c.gsum},
			s: {sum: self.c.a + self.c.b},
			circular: (Number(self.circular) || 0) + (Number(self.l1.a)||2)-1,
		}), {n: 4})
		// log(r)
		expect(r).toEqual({
			a: 1,
			l1: { a: 2, b: 3 },
			c: { a: 2, b: 3, ssum: 5, gsum: 5, rsum: 5 },
			s: { sum: 5 },
			circular: 5,
		})
	})
})
