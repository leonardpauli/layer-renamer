/* eslint-disable */
import {overlayAssign} from '...?'

const init = (o = {}, {savedOptions = {}} = {})=> {
	const opt = options.current = overlayAssign(options.default(), savedOptions, o)
	opt.app.usage.count += 1
}

const options = global.mainWindowOptions = {
	current: {},
	default: ()=> ({
		app: {
			usage: {
				count: 1,
				createdAt: new Date(),
			},
		},

		search: {
			options: {
				inSelection: false,
				regex: true,
				pathAndFlags: true,
				caseSensitive: false,
			},

			history: [],
			last: {
				value: '',
				updatedAt: new Date(0),
			}
		},
		rename: {
			show: false,

			history: [],
			last: {
				value: '',
				updatedAt: new Date(0),
			}
		},
	})
}
