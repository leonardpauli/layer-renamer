// utils/misc.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2017-2018


// strings

const regexEscape = s=> s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

const paddStringToLength = (str, len, append = false, char = ' ')=> {
	let txt = ''; for (let i = Math.max(0, len-str.length); i>0; i--) txt += char
	return append? str+txt: txt+str
}

// transformStringCaseUsingFlags
const transformCaseRE = /(?:\\([LUCKESTW])((?:.|\s)+?)(?=(?:\\[LUCKESTW])|$))/g
const toKebabCase = s=> s
	.replace(/([a-z])([A-Z])/g, (_, f, l)=> f+'-'+l) // convert camel/title case
	.toLowerCase() // discard case information
	.replace(/_(\w)/ig, (_, l)=> '-'+l) // convert snake case
	.replace(/ (\w)/ig, (_, l)=> '-'+l) // convert word case
const transformers = {
	L: s=> s.toLowerCase(), // lowercase
	U: s=> s.toUpperCase(), // UPPERCASE
	C: s=> toKebabCase(s).replace(/-(\w)/ig, (_, l)=> l.toUpperCase()), // camelCase
	K: s=> toKebabCase(s), // kebab-case
	E: s=> s, // end
	S: s=> toKebabCase(s).replace(/-(\w)/ig, (_, l)=> '_'+l), // snake_case
	T: s=> toKebabCase(s).replace(/(^|-)(\w)/ig, (_1, _2, l)=> l.toUpperCase()), // TitleCase
	W: s=> toKebabCase(s).replace(/-(\w)/ig, (_, l)=> ' '+l), // word case
}
// var str = "\\Klowercase \\KUPPERCASE \\KcamelCase \\Kkebab-case \\Kend \\Ksnake_case \\KTitleCase"
// str += "\n\\LlowerCase \\UupperCase \\CcamelCase \\KkebabCase \\Eend \\SsnakeCase \\TtitleCase"
const transformStringCaseUsingFlags = str=> str.replace(transformCaseRE, (all, flag, str)=> transformers[flag](str))


// export

export {
	regexEscape,
	paddStringToLength,
	transformStringCaseUsingFlags,
}
