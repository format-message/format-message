// @flow
// "lookup" algorithm http://tools.ietf.org/html/rfc4647#section-3.4
// assumes normalized language tags, and matches in a case sensitive manner
module.exports = function lookupClosestLocale (locale/*: string | string[] | void */, available/*: { [string]: any } */)/*: string */ {
  if (typeof locale === 'string' && available[locale]) return locale
  const locales = [].concat(locale || [])
  for (let l = 0, ll = locales.length; l < ll; ++l) {
    const current = locales[l].split('-')
    while (current.length) {
      const candidate = current.join('-')
      if (available[candidate]) return candidate
      current.pop()
    }
  }
  return 'en'
}
