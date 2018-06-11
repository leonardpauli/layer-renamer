// arrayDeltaActions.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

// assumes all items are unique and comparable between arrays with ===
/* eslint brace-style:0, max-statements:0 */
const arrayDeltaActions = ({move, add, remove})=> (as, bs)=> {
	const gs = as.map(_=> false) // ghosts
	let ai = 0; let a = void 0
	let bi = 0; let b = void 0
	let offset = 0 // + added - removed - skipped
	do {
		while (gs[ai] && ai < as.length) { ai++; offset-- } // skip ghosts
		a = ai < as.length? as[ai]: void 0
		b = bi < bs.length? bs[bi]: void 0
		// console.log(a, b, ';', ai, bi, gs)
		// console.log(rs)
		if (a===b) {
			if (a===void 0) break
			ai++
			bi++
		} else if (b!==void 0) {
			// find b in as
			let i=ai+1; let skipped = 0; let found = false
			while (i < as.length) {
				while (gs[i] && i < as.length) { i++; skipped++ } // skip ghosts
				if (i >= as.length) break
				if (as[i]===b) { found = true; break }
				i++
			}
			// move from later in as if found, else add from bs
			if (found) {
				const at = {abs: ai, rel: ai + offset}
				const fr = {abs: i, rel: i + offset - skipped, x: as[i]}
				move(at, fr)
				gs[i] = true
				offset++
			} else {
				const at = {abs: ai, rel: ai + offset}
				const x = {x: b, i: bi}
				add(at, x)
				offset++
			}
			bi++
		} else {
			const at = {abs: ai, rel: ai + offset, x: a}
			remove(at)
			offset--
			ai++
		}
	} while (true) // eslint-disable-line no-constant-condition
}

export default arrayDeltaActions
