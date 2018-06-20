// filterExpression/objectUtils.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

/* eslint consistent-this:0 */

import {log} from 'string-from-object'
import {objectSelfDependenciesResolve as objr} from './objectUtils'

describe('objectSelfDependenciesResolve', ()=> {

	describe('passthrough', ()=> {
		it('object', ()=> {
			const o = {a: 33}
			const r = objr(o)
			expect(r).toBe(o)
		})
		it('object array', ()=> {
			const o = [33]
			const r = objr(o)
			expect(r).toBe(o)
		})
		it('primitive number', ()=> {
			const o = 33
			const r = objr(o)
			expect(r).toBe(o)
		})
		it('primitive string', ()=> {
			const o = '33'
			const r = objr(o)
			expect(r).toBe(o)
		})
		it('double function', ()=> {
			const f = ()=> '33'
			const o = ()=> f
			const r = objr(o)
			expect(r).toBe(f)
		})
	})

	describe('unwrap top level', ()=> {
		it('object', ()=> {
			const oi = {a: 33}
			const o = ()=> oi
			const r = objr(o)
			expect(r.a).toBe(oi.a)
			// expect(r).toBe(oi)
		})
		it('object array', ()=> {
			const oi = [33]
			const o = ()=> oi
			const r = objr(o)
			expect(r[0]).toBe(oi[0])
			// expect(r).toBe(oi)
		})
	})
	describe('unwrap top level - bindSelf', ()=> {
		it('object', ()=> {
			const oi = {a: 33}
			const o = objr.bindSelf(oi, ()=> oi)
			const r = objr(o)
			expect(r.a).toBe(oi.a)
			expect(r).toBe(oi)
		})
		it('object array', ()=> {
			const oi = [33]
			const o = objr.bindSelf(oi, ()=> oi)
			const r = objr(o)
			expect(r[0]).toBe(oi[0])
			expect(r).toBe(oi)
		})
	})
	describe('object ref self', ()=> {
		it('object ref self', ()=> {
			const oi = {a: 33}
			const state = {}
			const o = ({self, a})=> (
				state.self = self, state.a = a, state.sa = self.a, oi)
			const r = objr(o)
			expect(r.a).toBe(oi.a)
			expect(state.self).toBe(r)
			expect(state.a).toEqual({})
			expect(state.sa).toEqual(void 0)
		})
		it('object ref self - bindSelf', ()=> {
			const oi = {a: 33}
			const state = {}
			const o = objr.bindSelf(oi, ({self, a})=> (
				state.self = self, state.a = a, state.sa = self.a, oi))
			const r = objr(o)
			expect(r.a).toBe(oi.a)
			expect(state.self).toBe(r)
			expect(state.a).toEqual(oi.a)
			expect(state.sa).toEqual(oi.a)
		})
	})

	describe('unwrap nested', ()=> {
		it('lvl 1', ()=> {
			const oi = {a: 0}
			const o = ()=> ({x: ()=> oi})
			const r = objr(o)
			expect(r.x.a).toBe(oi.a)
		})
		it('lvl 2', ()=> {
			const oi = {a: 0}
			const o = ()=> ({x: ()=> ({y: ()=> oi})})
			const r = objr(o)
			expect(r.x.y.a).toBe(oi.a)
		})
	})

	describe('handle primitive first', ()=> {
		it('test', ()=> {
			// run function twice? first to get variable kinds, then for real?
			const o = ({a, b, d})=> ({a: 5, x: {a, b, c: d.k}, b: 6, d: {k: 4}})
			const r = objr(o)
			expect(r.x.a).toEqual({a: 5, b: 6, c: 4})
		})
	})

})
