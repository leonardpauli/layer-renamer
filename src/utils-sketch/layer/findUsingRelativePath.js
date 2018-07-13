// layer/findUsingRelativePath.js
// LayerRenamer
//
// created by Leonard Pauli, jan 2017 + jun 2018
// copyright © Leonard Pauli 2017-2018

import nodesAtRelativePath, {parseRelativePathStrPart} from '@leonardpauli/utils/lib/nodesAtRelativePath'

const layersFindUsingRelativePath = (baseLayers, path, {
	parentGet = l=> l.parentGroup && l.parentGroup(),
	childrenGet = l=> l.layers && l.layers(),
} = {})=> nodesAtRelativePath({
	roots: baseLayers, path, parentGet, childrenGet,
})


export default layersFindUsingRelativePath
export {parseRelativePathStrPart}
