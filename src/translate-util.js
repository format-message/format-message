import slug from 'speakingurl'
import crc32 from 'crc32'
import Parser from 'message-format/dist/parser'
import Printer from 'message-format/dist/printer'


export function getTranslate(options) {
	if (options.translate) {
		return options.translate
	}

	if (!options.translations) {
		return (pattern => pattern)
	}

	let getKey = getGetKey(options)
	return function(pattern, locales) {
		let
			translations = options.translations,
			key = getKey(pattern)
		locales = [].concat(locales)
		for (let locale of locales) {
			let parts = locale.split('-')
			while (parts.length) {
				let current = parts.join('-')
				if (current in translations && key in translations[current]) {
					return translations[current][key]
				}
				parts.pop()
			}
		}
	}
}


export function getGetKey(options) {
	switch (options.keyType) {
		case 'underscored_crc32':
			return getKeyUnderscoredCrc32
		case 'underscored':
			return getKeyUnderscored
		case 'normalized':
			return getKeyNormalized
		default: // 'literal'
			return (pattern => pattern)
	}
}


export function getKeyNormalized(pattern) {
	return Printer.print(Parser.parse(pattern))
}


export function getKeyUnderscored(pattern) {
	pattern = getKeyNormalized(pattern)
	return slug(pattern, { separator:'_', lang:false })
		.replace(/[-_]+/g, '_')
		.slice(0, 50)
}


export function getKeyUnderscoredCrc32(pattern) {
	pattern = getKeyNormalized(pattern)
	let
		underscored = slug(pattern, { separator:'_', lang:false })
			.replace(/[-_]+/g, '_')
			.slice(0, 50),
		crc = crc32(pattern.length + ':' + pattern)
			.toString(16)
	return underscored + '_' + crc
}

