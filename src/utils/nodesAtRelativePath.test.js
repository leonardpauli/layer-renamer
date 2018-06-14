// nodesAtRelativePath.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import nodesAtRelativePath, {parseRelativePathStrPart} from './nodesAtRelativePath'
import sfo, {log} from 'string-from-object'

// TODO:
// >* // select all children of parent recursively
// <* // select top roots for selected children
// 1,3 // select at idx 1 and 3 of selected
// 1-3 // select at idx 1 to 3 of selected

// TODO: 2n should be "select every x:th of selected" + "IN EACH PARENT separately"


const concat = xxs=> xxs.reduce((a, xs)=> (a.push(...xs), a), [])
const range = n=> Array(n || 0).fill().map((_, i)=> i)

const tests = [{
	pathStr: 'nah', restStr: 'nah',
	desc: 'skip non-path restStr',
	path: [],
	titles: range(7).map(String),
}, {
	pathStr: '>',
	desc: 'select children of selected',
	path: [{down: true}],
	titles: concat(range(7).map(i=> range(4).map(j=> i+'.'+j))),
}, {
	pathStr: '<',
	desc: 'select parents of selected',
	path: [{up: true}],
	titles: ['root'],
}, {
	pathStr: '0',
	desc: 'select only index x of selected',
	path: [{sideways: true, relative: false, m: 0}],
	titles: ['0'],
}, {
	pathStr: '+1',
	desc: 'select sibling relative to selected, wrap around',
	path: [{sideways: true, relative: true, m: 1}],
	titles: range(7).map(i=> (i+=1, i%=7, i+=i < 0?7: i >= 7?-7:0, i)).map(String),
}, {
	pathStr: '-20',
	desc: 'select sibling relative to selected, wrap around',
	path: [{sideways: true, relative: true, m: -20}],
	titles: range(7).map(i=> (i+=-20, i%=7, i+=i < 0?7: i >= 7?-7:0, i)).map(String),
}, {
	pathStr: '2n',
	desc: 'select every x:th of selected',
	path: [{modulus: true, k: 2, m: 0}],
	titles: range(7).filter(i=> i%2===0).map(String),
}, {
	pathStr: '2n+1',
	desc: 'combine modulus + relative offset',
	path: [{modulus: true, k: 2, m: 1}],
	titles: range(7).filter(i=> (i-1)%2===0).map(String),
}, {
	pathStr: '-2n-3', restStr: 'n-3',
	desc: 'negative modulus is ignored and treated like sideways -2',
	path: [{sideways: true, relative: true, m: -2}],
	titles: range(7).map(i=> (i+=-2, i%=7, i+=i < 0?7: i >= 7?-7:0, i)).map(String),
}]


describe('parseRelativePathStrPart', ()=> {

	const pathit = (str, title, pathE, restStrE = '')=> it(`${str}\t // ${title}`, ()=> {
		const {path, restStr} = parseRelativePathStrPart(str)
		expect(path).toEqual(pathE)
		expect(restStr).toEqual(restStrE)
	})

	tests.map(({pathStr, desc, restStr = '', path})=>
		pathit(pathStr, desc, path, restStr))

	// 2n3n -> 3(2n) -> 6n
	// 2n+5, -3n-7 -> -3(2n+5)-7 -> -6n-21
	pathit('>><lal>', 'skip non-path restStr including valid path', [{down: true}, {down: true}, {up: true}], 'lal>')
	pathit('>>1>2n-3', 'multiple path components', [
		{down: true},
		{down: true}, {sideways: true, relative: false, m: 1},
		{down: true}, {modulus: true, k: 2, m: -3},
	])

})

const last = xs=> xs[xs.length]
const nodeGet = (depths = [0], depthMax = 3, siblingsMax = 4)=> ({
	title: depths.join('.'),
	nodes: depths.length < depthMax
		? range(siblingsMax).map(i=>
			nodeGet([...depths, i], depthMax, siblingsMax))
		: [],
})
const topNodes = range(7).map(i=> nodeGet([i]))
const rootNode = {nodes: topNodes, isRootNode: true, title: 'root'}
const parentGet = n=> {
	const components = n.title.split('.')
	components.pop()
	let next
	let node = rootNode
	if (!components.length) return node
	while (next = parseInt(components.shift(), 10), !isNaN(next))
		node = node.nodes[next]
	return node
}

// log(topNodes, 7)
// log(tests.reduce((o, {pathStr, titles})=> (o[pathStr] = titles, o), {}), 2)
// log(tests)

describe('nodesAtRelativePath', ()=> {
	const getTitlesFromPath = path=> nodesAtRelativePath({
		roots: topNodes,
		path,
		parentGet, childrenGet: n=> n.nodes,
	}).map(n=> n.title)

	const toMatchTitles = ({path, titles})=> {
		const result = getTitlesFromPath(path)
		try {
			expect(result).toEqual(titles)
			return {result, pass: true}
		} catch (err) {
			return {result, pass: false, err}
		}
	}

	expect.extend({toMatchTitles (path, titles) {
		const {pass, result} = toMatchTitles({path, titles})
		return {pass, message: ()=> sfo({
			message: pass
				? 'expected result not to match titles'
				: 'expected result to match titles',
			path, titles, result,
		}, {depth: 5, colors: true, indentation: '\t'})}
	}})

	const testit = (title, path, titles, _it = it)=>
		_it(title, ()=> expect(path).toMatchTitles(titles))

	describe('isolated on topNodes', ()=> {
		tests.map(({pathStr, desc, path, titles})=>
			testit(`${pathStr}\t // ${desc}`, path, titles))
	})

	const strit = (str, titles, _it = it)=>
		testit(str, parseRelativePathStrPart(str).path, titles, _it)
	strit.only = (str, titles)=> strit(str, titles, it.only)

	describe('combined', ()=> {
		strit('0>', range(4).map(i=> `0.${i}`))
		strit('<<<', ['root'])
		strit('2', ['2'])
		strit('2>', ['2.0', '2.1', '2.2', '2.3'])
		strit('2>0', ['2.0'])
		strit('2>>', [
			'2.0.0', '2.0.1', '2.0.2', '2.0.3',
			'2.1.0', '2.1.1', '2.1.2', '2.1.3',
			'2.2.0', '2.2.1', '2.2.2', '2.2.3',
			'2.3.0', '2.3.1', '2.3.2', '2.3.3',
		])
		strit('>0', range(7).map(i=> `${i}.0`))
		strit('>0>1', range(7).map(i=> `${i}.0.1`))
		
		strit('', range(7).map(i=> `${i}`))
		strit('><', range(7).map(i=> `${i}`))
		strit('><2', ['2'])

		strit('>0>1<>2n', getTitlesFromPath(parseRelativePathStrPart('>0>2n').path))
		strit('>0>1<<2n', getTitlesFromPath(parseRelativePathStrPart('2n').path))
	})

})
