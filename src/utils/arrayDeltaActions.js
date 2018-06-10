// arrayDeltaActions.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

/* eslint brace-style:0, max-statements:0 */
const arrayDeltaActions = ({move, add, remove})=> (as, bs)=> {
	const rs = as.slice(); let offset = 0
	let ai = 0; let a = void 0
	let bi = 0; let b = void 0
	do {
		a = ai < as.length? as[ai]: void 0
		b = bi < bs.length? bs[bi]: void 0
		if (a===b) {
			if (a===void 0) break
			ai++
			bi++
		} else if (b!==void 0) {
			// find b in as
			let i=ai+1; let found = false
			do {
				const x = as[i]
				if (x===b) { found = true; break }
				i++
			} while (i < as.length)
			// move from later in as if found, else add from bs
			if (found) move({abs: ai, rel: ai + offset}, {abs: i, rel: i + offset, x: as[i]})
			else add({abs: ai, rel: ai + offset}, {x: b, i: bi})
			offset += 1
			bi++
		} else {
			remove({abs: ai, rel: ai + offset, x: a}); offset--
			ai++
		}
	} while (true) // eslint-disable-line no-constant-condition
}

export default arrayDeltaActions
