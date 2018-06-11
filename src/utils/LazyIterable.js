// LazyIterable.js
// from https://dev.to/nestedsoftware/lazy-evaluation-in-javascript-with-generators-map-filter-and-reduce--36h5
// modified by Leonard Pauli, jun 2018

/* eslint no-use-before-define:0 */

export default class Lazy {
	constructor (iterable, callback) {
		this.iterable = iterable
		this.callback = callback
	}
	
	filter (callback) { return new LazyFilter(this, callback) }

	map (callback) { return new LazyMap(this, callback) }
	
	takeAll () { return [...this] } // last {value: x, done: true} (eg. return x), is excluded
	take (n) {
		const xs = []
		for (let i=0; i < n; i++) xs.push(this.next().value)
		return xs
	}

	next () { return this.iterable.next() }

	* [Symbol.iterator] () {
		let v; while (!(v = this.next()).done) yield v.value
		return v.value
	}
}

class LazyFilter extends Lazy {
	next () {
		while (true) { // eslint-disable-line no-constant-condition
			const item = this.iterable.next()
			if (item.done || this.callback(item.value)) {
				return item
			}
		}
	}
}

class LazyMap extends Lazy {
	next () {
		const item = this.iterable.next()
		return { value: item.done? item.value: this.callback(item.value), done: item.done }
	}
}
