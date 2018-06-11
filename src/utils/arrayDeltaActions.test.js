// arrayDeltaActions.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import arrayDeltaActions from './arrayDeltaActions'
import {log} from 'string-from-object'
import LazyIterable from './LazyIterable'


// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
const arrayShuffle = xs=> {
	let i = xs.length
	while (i > 0) { // While there are elements in the xs
		const j = Math.floor(Math.random() * i); i-- // get random index + dec counter
		const xc = xs[i]; xs[i] = xs[j]; xs[j] = xc // swap the last element with it
	}
	return xs
}

const rndstr = ()=> (s=>	arrayShuffle(s.split('')).join('')
	.substr(0, Math.floor(Math.random()*s.length))
)('abcdefghijklmnopqrstuvwxyz')


describe('arrayDeltaActions', ()=> {
	const diffit = (expr, name, doLog)=> {
		const [aa, bb] = expr.split(',')
		const as = aa.split('')
		const bs = bb.split('')
		const rs = as.slice()
		
		const diff = new LazyIterable(arrayDeltaActions(as, bs))
			.filter(({add, x, move, fr: f, at: i})=>
				add? rs.splice(i.rel, 0, bs[x.i])
					: move? (rs.splice(i.rel, 0, rs[f.rel]), rs.splice(f.rel+1, 1))
						: rs.splice(i.rel, 1), true // remove, don't filter out
			)
			.takeAll()

		doLog && log(diff.map(({add, x, move, fr: f, at: i})=>
			add? `add '${x.x}' (bs[${x.i}]) at r[${i.rel}] (final[${i.abs}])`
				: move? `move '${f.x}' (r[${f.rel}], org[${f.abs}]) to r[${i.rel}] (final[${i.abs}])`
					: `remove '${i.x}' at r[${i.rel}] (org[${i.abs}])`
		))

		it(expr+' // '+name, ()=> expect(rs).toEqual(bs))
	}

	diffit('a,ab', 'append, 1')
	diffit('a,ba', 'prepend, 1')
	diffit('ab,acb', 'insert')
	
	diffit('a,abc', 'append, 2')
	diffit('a,cba', 'prepend, 2')
	
	diffit('a,', 'remove, all 1')
	diffit('ab,b', 'remove, first 1')
	diffit('ab,a', 'remove, last 1')

	diffit('abc,c', 'remove, first 2')
	diffit('abc,bc', 'remove, first 1 of 3')
	diffit('abc,a', 'remove, last 2')
	diffit('abc,ab', 'remove, last 1 of 3')

	diffit('abc,acb', 'move, switch')
	diffit('abc,cab', 'move, back')
	diffit('abc,bca', 'move, forward')
	diffit('abc,ca', 'switch and remove')

	diffit('ba,ac', 'remove + add')
	diffit('dab,cad', 'move, add, and remove')
	diffit('bca,adc', 'move, add, and remove')

	/*
	bca
	abc a2,2;0 -> 0,0
	adbc d-,-;1 *> 1,1
	adcb c3,1;2 -> 2,2
	adc b4,0;x x
	adc
	*/

	diffit('bcd,dc', 'move, add, and remove')
	// diffit('bcd,dc', 'move, add, and remove', true)

	diffit(`${rndstr()},${rndstr()}`, 'random')
	diffit(`${rndstr()},${rndstr()}`, 'random')
	diffit(`${rndstr()},${rndstr()}`, 'random')
	diffit(`${rndstr()},${rndstr()}`, 'random')
	diffit(`${rndstr()},${rndstr()}`, 'random')
	diffit(`${rndstr()},${rndstr()}`, 'random')
	diffit(`${rndstr()},${rndstr()}`, 'random')
	diffit(`${rndstr()},${rndstr()}`, 'random')
	diffit(`${rndstr()},${rndstr()}`, 'random')
})
