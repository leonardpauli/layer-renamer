// config.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

// config
export default {
	app: {
		env: 'development', // production // TODO: get from babel or webpack procees.env transpile?
		namespace: 'layer-renamer', // TODO: get from manifest?
		get isProduction () { return this.env === 'production' },
	},
	search: {
		scope: {
			all: 0,
			selectedAndInside: 1,
			onlySelected: 2,
			insideSelected: 3,
		},
	},
}
