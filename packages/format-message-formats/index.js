// @flow
var LONG = 'long'
var SHORT = 'short'
var NARROW = 'narrow'
var NUMERIC = 'numeric'
var TWODIGIT = '2-digit'

/**
 * formatting information
 **/
module.exports = {
  number: {
    decimal: {
      style: 'decimal'
    },
    integer: {
      style: 'decimal',
      maximumFractionDigits: 0
    },
    currency: {
      style: 'currency',
      currency: 'USD'
    },
    percent: {
      style: 'percent'
    },
    default: {
      style: 'decimal'
    }
  },
  date: {
    short: {
      month: NUMERIC,
      day: NUMERIC,
      year: TWODIGIT
    },
    medium: {
      month: SHORT,
      day: NUMERIC,
      year: NUMERIC
    },
    long: {
      month: LONG,
      day: NUMERIC,
      year: NUMERIC
    },
    full: {
      month: LONG,
      day: NUMERIC,
      year: NUMERIC,
      weekday: LONG
    },
    default: {
      month: SHORT,
      day: NUMERIC,
      year: NUMERIC
    }
  },
  time: {
    short: {
      hour: NUMERIC,
      minute: NUMERIC
    },
    medium: {
      hour: NUMERIC,
      minute: NUMERIC,
      second: NUMERIC
    },
    long: {
      hour: NUMERIC,
      minute: NUMERIC,
      second: NUMERIC,
      timeZoneName: SHORT
    },
    full: {
      hour: NUMERIC,
      minute: NUMERIC,
      second: NUMERIC,
      timeZoneName: SHORT
    },
    default: {
      hour: NUMERIC,
      minute: NUMERIC,
      second: NUMERIC
    }
  },
  duration: {
    default: {
      hours: {
        minimumIntegerDigits: 1,
        maximumFractionDigits: 0
      },
      minutes: {
        minimumIntegerDigits: 2,
        maximumFractionDigits: 0
      },
      seconds: {
        minimumIntegerDigits: 2,
        maximumFractionDigits: 3
      }
    }
  },
  parseNumberPattern: function (pattern/*: ?string */) {
    if (!pattern) return
    var options = {}
    var currency = pattern.match(/\b[A-Z]{3}\b/i)
    var syms = pattern.replace(/[^¤]/g, '').length
    if (!syms && currency) syms = 1
    if (syms) {
      options.style = 'currency'
      options.currencyDisplay = syms === 1 ? 'symbol' : syms === 2 ? 'code' : 'name'
      options.currency = currency ? currency[0].toUpperCase() : 'USD'
    } else if (pattern.indexOf('%') >= 0) {
      options.style = 'percent'
    }
    if (!/[@#0]/.test(pattern)) return options.style ? options : undefined
    options.useGrouping = pattern.indexOf(',') >= 0
    if (/E\+?[@#0]+/i.test(pattern) || pattern.indexOf('@') >= 0) {
      var size = pattern.replace(/E\+?[@#0]+|[^@#0]/gi, '')
      options.minimumSignificantDigits = Math.min(Math.max(size.replace(/[^@0]/g, '').length, 1), 21)
      options.maximumSignificantDigits = Math.min(Math.max(size.length, 1), 21)
    } else {
      var parts = pattern.replace(/[^#0.]/g, '').split('.')
      var integer = parts[0]
      var n = integer.length - 1
      while (integer[n] === '0') --n
      options.minimumIntegerDigits = Math.min(Math.max(integer.length - 1 - n, 1), 21)
      var fraction = parts[1] || ''
      n = 0
      while (fraction[n] === '0') ++n
      options.minimumFractionDigits = Math.min(Math.max(n, 0), 20)
      while (fraction[n] === '#') ++n
      options.maximumFractionDigits = Math.min(Math.max(n, 0), 20)
    }
    return options
  },
  parseDatePattern: function (pattern/*: ?string */) {
    if (!pattern) return
    var options = {}
    for (var i = 0; i < pattern.length;) {
      var current = pattern[i]
      var n = 1
      while (pattern[++i] === current) ++n
      switch (current) {
        case 'G':
          options.era = n === 5 ? NARROW : n === 4 ? LONG : SHORT
          break
        case 'y':
        case 'Y':
          options.year = n === 2 ? TWODIGIT : NUMERIC
          break
        case 'M':
        case 'L':
          n = Math.min(Math.max(n - 1, 0), 4)
          options.month = [ NUMERIC, TWODIGIT, SHORT, LONG, NARROW ][n]
          break
        case 'E':
        case 'e':
        case 'c':
          options.weekday = n === 5 ? NARROW : n === 4 ? LONG : SHORT
          break
        case 'd':
        case 'D':
          options.day = n === 2 ? TWODIGIT : NUMERIC
          break
        case 'h':
        case 'K':
          options.hour12 = true
          options.hour = n === 2 ? TWODIGIT : NUMERIC
          break
        case 'H':
        case 'k':
          options.hour12 = false
          options.hour = n === 2 ? TWODIGIT : NUMERIC
          break
        case 'm':
          options.minute = n === 2 ? TWODIGIT : NUMERIC
          break
        case 's':
        case 'S':
          options.second = n === 2 ? TWODIGIT : NUMERIC
          break
        case 'z':
        case 'Z':
        case 'v':
        case 'V':
          options.timeZoneName = n === 1 ? SHORT : LONG
          break
      }
    }
    return Object.keys(options).length ? options : undefined
  }
}
