import { readFileSync, writeFileSync } from 'fs'

let pluralVars = {
	i: 'Math.floor(Math.abs(+s))',
	v: '(s + \'.\').split(\'.\')[1].length',
	w: '(\'\' + s).replace(/^[^.]*\.?|0+$/g, \'\').length',
	f: '+(s + \'.\').split(\'.\')[1]',
	t: '+(\'\' + s).replace(/^[^.]*\.?|0+$/g, \'\')'
}

function parseRules(rules) {
	let
		clauses = [],
		data = {}

	for (let key in rules) {
		if ('pluralRule-count-other' === key) { continue }
		let
			keyword = key.replace('pluralRule-count-', ''),
			rule = rules[key].replace(/\s*@.*$/, '')
		if ('other' !== keyword) {
			clauses.push([ keyword, rule ])
		}
	}
	if (!clauses.length) {
		return null
	}

	for (let [ keyword, rule ] of clauses) {
		let condition = rule
			.replace(/\bor\b/g, '||')
			.replace(/\band\b/g, '&&')
			.replace(/(\w(?:\s*%\s*\d+)?)\s*=\s*((?:[0-9.]+,)+[0-9.]+)/g, function($0, exp, range_list) {
				return '(' + range_list.split(',').map(range => (exp + ' = ' + range)).join(' || ') + ')'
			})
			.replace(/(\w(?:\s*%\s*\d+)?)\s*!=\s*((?:[0-9.]+,)+[0-9.]+)/g, function($0, exp, range_list) {
				return '(' + range_list.split(',').map(range => (exp + ' != ' + range)).join(' && ') + ')'
			})
			.replace(/(\w(?:\s*%\s*\d+)?)\s*=\s*(\d+)\.\.(\d+)/g, '($2 <= $1 && $1 <= $3)')
			.replace(/(\w(?:\s*%\s*\d+)?)\s*!=\s*(\d+)\.\.(\d+)/g, '($1 < $2 || $3 < $1)')
			.replace(/\s=\s/g, ' === ')
			.replace(/\s!=\s/g, ' !== ')
			.replace(/^\(([^()]*)\)$/, '$1')
		data[keyword] = condition
	}

	return data
}

let
	pluralFileName = __dirname + '/tmp-cldr/supplemental/plurals.json',
	ordinalFileName = __dirname + '/tmp-cldr/supplemental/ordinals.json',
	pluralsTypeCardinal = JSON.parse(readFileSync(pluralFileName, 'utf8')).supplemental['plurals-type-cardinal'],
	pluralsTypeOrdinal = JSON.parse(readFileSync(ordinalFileName, 'utf8')).supplemental['plurals-type-ordinal'],
	locales = {}

for (let locale in pluralsTypeCardinal) {
	let cardinal = parseRules(pluralsTypeCardinal[locale])
	if (cardinal) {
		locales[locale] = { plurals:{ cardinal } }
	}
}
for (let locale in pluralsTypeOrdinal) {
	let ordinal = parseRules(pluralsTypeOrdinal[locale])
	if (ordinal) {
		if (locales[locale]) {
			locales[locale].plurals.ordinal = ordinal
		} else {
			locales[locale] = { plurals:{ ordinal } }
		}
	}
}


let fileData = JSON.stringify({ pluralVars, locales }, null, '\t')
writeFileSync(__dirname + '/../src/locales.json', fileData, 'utf8')
console.log('Wrote data to src/locales.json')

