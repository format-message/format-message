// @flow
'use strict'

/*:: export type Rule = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other' */
var zero = 'zero', one = 'one', two = 'two', few = 'few', many = 'many', other = 'other'
var f = [
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n === 1 ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return 0 <= n && n <= 1 ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var n = +s
    return i === 0 || n === 1 ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n === 0 ? zero
      : n === 1 ? one
      : n === 2 ? two
      : 3 <= n % 100 && n % 100 <= 10 ? few
      : 11 <= n % 100 && n % 100 <= 99 ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var v = (s + '.').split('.')[1].length
    return i === 1 && v === 0 ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n % 10 === 1 && n % 100 !== 11 ? one
      : (2 <= n % 10 && n % 10 <= 4) && (n % 100 < 12 || 14 < n % 100) ? few
      : n % 10 === 0 || (5 <= n % 10 && n % 10 <= 9) || (11 <= n % 100 && n % 100 <= 14) ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n % 10 === 1 && (n % 100 !== 11 && n % 100 !== 71 && n % 100 !== 91) ? one
      : n % 10 === 2 && (n % 100 !== 12 && n % 100 !== 72 && n % 100 !== 92) ? two
      : ((3 <= n % 10 && n % 10 <= 4) || n % 10 === 9) && ((n % 100 < 10 || 19 < n % 100) && (n % 100 < 70 || 79 < n % 100) && (n % 100 < 90 || 99 < n % 100)) ? few
      : n !== 0 && n % 1000000 === 0 ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var v = (s + '.').split('.')[1].length
    var f = +(s + '.').split('.')[1]
    return v === 0 && i % 10 === 1 && i % 100 !== 11 || f % 10 === 1 && f % 100 !== 11 ? one
      : v === 0 && (2 <= i % 10 && i % 10 <= 4) && (i % 100 < 12 || 14 < i % 100) || (2 <= f % 10 && f % 10 <= 4) && (f % 100 < 12 || 14 < f % 100) ? few
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var v = (s + '.').split('.')[1].length
    return i === 1 && v === 0 ? one
      : (2 <= i && i <= 4) && v === 0 ? few
      : v !== 0 ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n === 0 ? zero
      : n === 1 ? one
      : n === 2 ? two
      : n === 3 ? few
      : n === 6 ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var t = +('' + s).replace(/^[^.]*.?|0+$/g, '')
    var n = +s
    return n === 1 || t !== 0 && (i === 0 || i === 1) ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var v = (s + '.').split('.')[1].length
    var f = +(s + '.').split('.')[1]
    return v === 0 && i % 100 === 1 || f % 100 === 1 ? one
      : v === 0 && i % 100 === 2 || f % 100 === 2 ? two
      : v === 0 && (3 <= i % 100 && i % 100 <= 4) || (3 <= f % 100 && f % 100 <= 4) ? few
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    return i === 0 || i === 1 ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var v = (s + '.').split('.')[1].length
    var f = +(s + '.').split('.')[1]
    return v === 0 && (i === 1 || i === 2 || i === 3) || v === 0 && (i % 10 !== 4 && i % 10 !== 6 && i % 10 !== 9) || v !== 0 && (f % 10 !== 4 && f % 10 !== 6 && f % 10 !== 9) ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n === 1 ? one
      : n === 2 ? two
      : 3 <= n && n <= 6 ? few
      : 7 <= n && n <= 10 ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n === 1 || n === 11 ? one
      : n === 2 || n === 12 ? two
      : ((3 <= n && n <= 10) || (13 <= n && n <= 19)) ? few
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var v = (s + '.').split('.')[1].length
    return v === 0 && i % 10 === 1 ? one
      : v === 0 && i % 10 === 2 ? two
      : v === 0 && (i % 100 === 0 || i % 100 === 20 || i % 100 === 40 || i % 100 === 60 || i % 100 === 80) ? few
      : v !== 0 ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var v = (s + '.').split('.')[1].length
    var n = +s
    return i === 1 && v === 0 ? one
      : i === 2 && v === 0 ? two
      : v === 0 && (n < 0 || 10 < n) && n % 10 === 0 ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var t = +('' + s).replace(/^[^.]*.?|0+$/g, '')
    return t === 0 && i % 10 === 1 && i % 100 !== 11 || t !== 0 ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n === 1 ? one
      : n === 2 ? two
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n === 0 ? zero
      : n === 1 ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var n = +s
    return n === 0 ? zero
      : (i === 0 || i === 1) && n !== 0 ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var f = +(s + '.').split('.')[1]
    var n = +s
    return n % 10 === 1 && (n % 100 < 11 || 19 < n % 100) ? one
      : (2 <= n % 10 && n % 10 <= 9) && (n % 100 < 11 || 19 < n % 100) ? few
      : f !== 0 ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var v = (s + '.').split('.')[1].length
    var f = +(s + '.').split('.')[1]
    var n = +s
    return n % 10 === 0 || (11 <= n % 100 && n % 100 <= 19) || v === 2 && (11 <= f % 100 && f % 100 <= 19) ? zero
      : n % 10 === 1 && n % 100 !== 11 || v === 2 && f % 10 === 1 && f % 100 !== 11 || v !== 2 && f % 10 === 1 ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var v = (s + '.').split('.')[1].length
    var f = +(s + '.').split('.')[1]
    return v === 0 && i % 10 === 1 && i % 100 !== 11 || f % 10 === 1 && f % 100 !== 11 ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var v = (s + '.').split('.')[1].length
    var n = +s
    return i === 1 && v === 0 ? one
      : v !== 0 || n === 0 || n !== 1 && (1 <= n % 100 && n % 100 <= 19) ? few
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n === 1 ? one
      : n === 0 || (2 <= n % 100 && n % 100 <= 10) ? few
      : 11 <= n % 100 && n % 100 <= 19 ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var v = (s + '.').split('.')[1].length
    return i === 1 && v === 0 ? one
      : v === 0 && (2 <= i % 10 && i % 10 <= 4) && (i % 100 < 12 || 14 < i % 100) ? few
      : v === 0 && i !== 1 && (0 <= i % 10 && i % 10 <= 1) || v === 0 && (5 <= i % 10 && i % 10 <= 9) || v === 0 && (12 <= i % 100 && i % 100 <= 14) ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    return 0 <= i && i <= 1 ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var v = (s + '.').split('.')[1].length
    return v === 0 && i % 10 === 1 && i % 100 !== 11 ? one
      : v === 0 && (2 <= i % 10 && i % 10 <= 4) && (i % 100 < 12 || 14 < i % 100) ? few
      : v === 0 && i % 10 === 0 || v === 0 && (5 <= i % 10 && i % 10 <= 9) || v === 0 && (11 <= i % 100 && i % 100 <= 14) ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var n = +s
    return i === 0 || n === 1 ? one
      : 2 <= n && n <= 10 ? few
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var f = +(s + '.').split('.')[1]
    var n = +s
    return (n === 0 || n === 1) || i === 0 && f === 1 ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    var v = (s + '.').split('.')[1].length
    return v === 0 && i % 100 === 1 ? one
      : v === 0 && i % 100 === 2 ? two
      : v === 0 && (3 <= i % 100 && i % 100 <= 4) || v !== 0 ? few
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return (0 <= n && n <= 1) || (11 <= n && n <= 99) ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n === 1 || n === 5 || n === 7 || n === 8 || n === 9 || n === 10 ? one
      : n === 2 || n === 3 ? two
      : n === 4 ? few
      : n === 6 ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    return (i % 10 === 1 || i % 10 === 2 || i % 10 === 5 || i % 10 === 7 || i % 10 === 8) || (i % 100 === 20 || i % 100 === 50 || i % 100 === 70 || i % 100 === 80) ? one
      : (i % 10 === 3 || i % 10 === 4) || (i % 1000 === 100 || i % 1000 === 200 || i % 1000 === 300 || i % 1000 === 400 || i % 1000 === 500 || i % 1000 === 600 || i % 1000 === 700 || i % 1000 === 800 || i % 1000 === 900) ? few
      : i === 0 || i % 10 === 6 || (i % 100 === 40 || i % 100 === 60 || i % 100 === 90) ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return (n % 10 === 2 || n % 10 === 3) && (n % 100 !== 12 && n % 100 !== 13) ? few
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n === 1 || n === 3 ? one
      : n === 2 ? two
      : n === 4 ? few
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n === 0 || n === 7 || n === 8 || n === 9 ? zero
      : n === 1 ? one
      : n === 2 ? two
      : n === 3 || n === 4 ? few
      : n === 5 || n === 6 ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n % 10 === 1 && n % 100 !== 11 ? one
      : n % 10 === 2 && n % 100 !== 12 ? two
      : n % 10 === 3 && n % 100 !== 13 ? few
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n === 1 ? one
      : n === 2 || n === 3 ? two
      : n === 4 ? few
      : n === 6 ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n === 1 || n === 5 ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n === 11 || n === 8 || n === 80 || n === 800 ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    return i === 1 ? one
      : i === 0 || ((2 <= i % 100 && i % 100 <= 20) || i % 100 === 40 || i % 100 === 60 || i % 100 === 80) ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n % 10 === 6 || n % 10 === 9 || n % 10 === 0 && n !== 0 ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var i = Math.floor(Math.abs(+s))
    return i % 10 === 1 && i % 100 !== 11 ? one
      : i % 10 === 2 && i % 100 !== 12 ? two
      : (i % 10 === 7 || i % 10 === 8) && (i % 100 !== 17 && i % 100 !== 18) ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n === 1 ? one
      : n === 2 || n === 3 ? two
      : n === 4 ? few
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return 1 <= n && n <= 4 ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return (n === 1 || n === 5 || (7 <= n && n <= 9)) ? one
      : n === 2 || n === 3 ? two
      : n === 4 ? few
      : n === 6 ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n === 1 ? one
      : n % 10 === 4 && n % 100 !== 14 ? many
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return (n % 10 === 1 || n % 10 === 2) && (n % 100 !== 11 && n % 100 !== 12) ? one
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return (n % 10 === 6 || n % 10 === 9) || n === 10 ? few
      : other
  },
  function (s/*: string | number */)/*: Rule */ {
    var n = +s
    return n % 10 === 3 && n % 100 !== 13 ? few
      : other
  }
]

module.exports = {
  af: { cardinal: f[0] },
  ak: { cardinal: f[1] },
  am: { cardinal: f[2] },
  ar: { cardinal: f[3] },
  ars: { cardinal: f[3] },
  as: { cardinal: f[2], ordinal: f[34] },
  asa: { cardinal: f[0] },
  ast: { cardinal: f[4] },
  az: { cardinal: f[0], ordinal: f[35] },
  be: { cardinal: f[5], ordinal: f[36] },
  bem: { cardinal: f[0] },
  bez: { cardinal: f[0] },
  bg: { cardinal: f[0] },
  bh: { cardinal: f[1] },
  bn: { cardinal: f[2], ordinal: f[34] },
  br: { cardinal: f[6] },
  brx: { cardinal: f[0] },
  bs: { cardinal: f[7] },
  ca: { cardinal: f[4], ordinal: f[37] },
  ce: { cardinal: f[0] },
  cgg: { cardinal: f[0] },
  chr: { cardinal: f[0] },
  ckb: { cardinal: f[0] },
  cs: { cardinal: f[8] },
  cy: { cardinal: f[9], ordinal: f[38] },
  da: { cardinal: f[10] },
  de: { cardinal: f[4] },
  dsb: { cardinal: f[11] },
  dv: { cardinal: f[0] },
  ee: { cardinal: f[0] },
  el: { cardinal: f[0] },
  en: { cardinal: f[4], ordinal: f[39] },
  eo: { cardinal: f[0] },
  es: { cardinal: f[0] },
  et: { cardinal: f[4] },
  eu: { cardinal: f[0] },
  fa: { cardinal: f[2] },
  ff: { cardinal: f[12] },
  fi: { cardinal: f[4] },
  fil: { cardinal: f[13], ordinal: f[0] },
  fo: { cardinal: f[0] },
  fr: { cardinal: f[12], ordinal: f[0] },
  fur: { cardinal: f[0] },
  fy: { cardinal: f[4] },
  ga: { cardinal: f[14], ordinal: f[0] },
  gd: { cardinal: f[15] },
  gl: { cardinal: f[4] },
  gsw: { cardinal: f[0] },
  gu: { cardinal: f[2], ordinal: f[40] },
  guw: { cardinal: f[1] },
  gv: { cardinal: f[16] },
  ha: { cardinal: f[0] },
  haw: { cardinal: f[0] },
  he: { cardinal: f[17] },
  hi: { cardinal: f[2], ordinal: f[40] },
  hr: { cardinal: f[7] },
  hsb: { cardinal: f[11] },
  hu: { cardinal: f[0], ordinal: f[41] },
  hy: { cardinal: f[12], ordinal: f[0] },
  io: { cardinal: f[4] },
  is: { cardinal: f[18] },
  it: { cardinal: f[4], ordinal: f[42] },
  iu: { cardinal: f[19] },
  iw: { cardinal: f[17] },
  jgo: { cardinal: f[0] },
  ji: { cardinal: f[4] },
  jmc: { cardinal: f[0] },
  ka: { cardinal: f[0], ordinal: f[43] },
  kab: { cardinal: f[12] },
  kaj: { cardinal: f[0] },
  kcg: { cardinal: f[0] },
  kk: { cardinal: f[0], ordinal: f[44] },
  kkj: { cardinal: f[0] },
  kl: { cardinal: f[0] },
  kn: { cardinal: f[2] },
  ks: { cardinal: f[0] },
  ksb: { cardinal: f[0] },
  ksh: { cardinal: f[20] },
  ku: { cardinal: f[0] },
  kw: { cardinal: f[19] },
  ky: { cardinal: f[0] },
  lag: { cardinal: f[21] },
  lb: { cardinal: f[0] },
  lg: { cardinal: f[0] },
  ln: { cardinal: f[1] },
  lt: { cardinal: f[22] },
  lv: { cardinal: f[23] },
  mas: { cardinal: f[0] },
  mg: { cardinal: f[1] },
  mgo: { cardinal: f[0] },
  mk: { cardinal: f[24], ordinal: f[45] },
  ml: { cardinal: f[0] },
  mn: { cardinal: f[0] },
  mo: { cardinal: f[25], ordinal: f[0] },
  mr: { cardinal: f[2], ordinal: f[46] },
  mt: { cardinal: f[26] },
  nah: { cardinal: f[0] },
  naq: { cardinal: f[19] },
  nb: { cardinal: f[0] },
  nd: { cardinal: f[0] },
  ne: { cardinal: f[0], ordinal: f[47] },
  nl: { cardinal: f[4] },
  nn: { cardinal: f[0] },
  nnh: { cardinal: f[0] },
  no: { cardinal: f[0] },
  nr: { cardinal: f[0] },
  nso: { cardinal: f[1] },
  ny: { cardinal: f[0] },
  nyn: { cardinal: f[0] },
  om: { cardinal: f[0] },
  or: { cardinal: f[0], ordinal: f[48] },
  os: { cardinal: f[0] },
  pa: { cardinal: f[1] },
  pap: { cardinal: f[0] },
  pl: { cardinal: f[27] },
  prg: { cardinal: f[23] },
  ps: { cardinal: f[0] },
  pt: { cardinal: f[28] },
  'pt-PT': { cardinal: f[4] },
  rm: { cardinal: f[0] },
  ro: { cardinal: f[25], ordinal: f[0] },
  rof: { cardinal: f[0] },
  ru: { cardinal: f[29] },
  rwk: { cardinal: f[0] },
  saq: { cardinal: f[0] },
  scn: { cardinal: f[4], ordinal: f[42] },
  sd: { cardinal: f[0] },
  sdh: { cardinal: f[0] },
  se: { cardinal: f[19] },
  seh: { cardinal: f[0] },
  sh: { cardinal: f[7] },
  shi: { cardinal: f[30] },
  si: { cardinal: f[31] },
  sk: { cardinal: f[8] },
  sl: { cardinal: f[32] },
  sma: { cardinal: f[19] },
  smi: { cardinal: f[19] },
  smj: { cardinal: f[19] },
  smn: { cardinal: f[19] },
  sms: { cardinal: f[19] },
  sn: { cardinal: f[0] },
  so: { cardinal: f[0] },
  sq: { cardinal: f[0], ordinal: f[49] },
  sr: { cardinal: f[7] },
  ss: { cardinal: f[0] },
  ssy: { cardinal: f[0] },
  st: { cardinal: f[0] },
  sv: { cardinal: f[4], ordinal: f[50] },
  sw: { cardinal: f[4] },
  syr: { cardinal: f[0] },
  ta: { cardinal: f[0] },
  te: { cardinal: f[0] },
  teo: { cardinal: f[0] },
  ti: { cardinal: f[1] },
  tig: { cardinal: f[0] },
  tk: { cardinal: f[0], ordinal: f[51] },
  tl: { cardinal: f[13], ordinal: f[0] },
  tn: { cardinal: f[0] },
  tr: { cardinal: f[0] },
  ts: { cardinal: f[0] },
  tzm: { cardinal: f[33] },
  ug: { cardinal: f[0] },
  uk: { cardinal: f[29], ordinal: f[52] },
  ur: { cardinal: f[4] },
  uz: { cardinal: f[0] },
  ve: { cardinal: f[0] },
  vo: { cardinal: f[0] },
  vun: { cardinal: f[0] },
  wa: { cardinal: f[1] },
  wae: { cardinal: f[0] },
  xh: { cardinal: f[0] },
  xog: { cardinal: f[0] },
  yi: { cardinal: f[4] },
  zu: { cardinal: f[2] },
  lo: { ordinal: f[0] },
  ms: { ordinal: f[0] },
  vi: { ordinal: f[0] }
}
