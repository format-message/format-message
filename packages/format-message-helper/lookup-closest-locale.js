// "lookup" algorithm http://tools.ietf.org/html/rfc4647#section-3.4
module.exports = function lookupClosestLocale (locale, available) {
  var locales = [].concat(locale || [])
  for (var l = 0, ll = locales.length; l < ll; ++l) {
    var current = locales[l].split('-')
    while (current.length) {
      if (current.join('-') in available) {
        return current.join('-')
      }
      current.pop()
    }
  }
  return 'en'
}
