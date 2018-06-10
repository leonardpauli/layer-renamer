// arrayDeltaActions.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import arrayDeltaActions from './arrayDeltaActions'
import {log} from 'string-from-object'

describe('arrayDeltaActions', ()=> {
	const diffit = (aa, bb)=> expectedDiff=> {
		const as = aa.split(',')
		const bs = bb.split(',')
		const diff = []; arrayDeltaActions({
			add: (i, x)=> diff.push(`add at [${i.rel}]/[${i.abs}]: ${x.x} == bs[${x.i}]`),
			move: (i, f)=> diff.push(`move to [${i.rel}]/[${i.abs}] from [${f.rel}]/[${f.abs}] // ${f.x}`),
			remove: i=> diff.push(`remove at [${i.rel}]/[${i.abs}] // ${i.x}`),
		})(as, bs)
		return diff
	}
	it('a,ab', ()=> {
		log(diffit('a', 'ab')())
	})
})
