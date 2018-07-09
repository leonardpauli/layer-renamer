// utils/testUtils.js
// LayerRenamer
//
// created by Leonard Pauli, jul 2018
// copyright © Leonard Pauli 2018

/* global expect it */

// import sfo, {log, custom} from 'string-from-object'
import {objectFilterRecursiveToMatchStructure} from './object'

export const expectDeepSubsetMatch = (source, target)=>
	expect(objectFilterRecursiveToMatchStructure(
		source, target, { takenReturnStructure: true },
	)).toEqual(target)
