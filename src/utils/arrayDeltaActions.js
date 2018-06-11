// arrayDeltaActions.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

/* eslint brace-style:0, max-statements:0 */
const arrayDeltaActions = ({move, add, remove})=> (as, bs)=> {
	const rs = as.slice(); let offset = 0; let offsetAddBefore = 0
	const gs = as.map(_=> false) // ghosts
	let ai = 0; let a = void 0
	let bi = 0; let b = void 0
	do {
		while (gs[ai] && ai < as.length) { ai++; offsetAddBefore-- } // skip ghosts
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
			let i=ai+1; let found = false
			while (i < as.length) {
				while (gs[i] && i < as.length) i++ // skip ghosts
				if (i >= as.length) break
				const x = as[i]
				if (x===b) { found = true; break }
				i++
			}
			// move from later in as if found, else add from bs
			if (found) {
				const to = {abs: ai + (offset+offsetAddBefore), rel: ai + (offset+offsetAddBefore)}
				const fr = {abs: i, rel: i + (offset+offsetAddBefore), x: as[i]}
				// console.log(offset, offsetAddBefore)
				move(to, fr)
				gs[i] = true
				rs.splice(fr.rel, 1)
				rs.splice(to.abs, 0, fr.x)
				// offset++
				offsetAddBefore++
			} else {
				add({abs: ai + offsetAddBefore, rel: ai + (offset+offsetAddBefore)}, {x: b, i: bi})
				rs.splice(ai + (offset+offsetAddBefore), 0, b)
				offset++
			}
			bi++
		} else {
			remove({abs: ai, rel: ai + (offset+offsetAddBefore), x: a})
			rs.splice(ai + (offset+offsetAddBefore), 1)
			offset--
			ai++
		}
	} while (true) // eslint-disable-line no-constant-condition
}

export default arrayDeltaActions
