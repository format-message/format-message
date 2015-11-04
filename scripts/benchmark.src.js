if (typeof Intl === 'undefined') {
  require('intl')
  require('intl/locale-data/jsonp/en')
}
var IntlMF = require('intl-messageformat')
var MessageFormat = require('message-format')
var formatMessage = require('../packages/format-message')
var Benchmark = require('benchmark')
var pattern
var intlMF
var mf
var args

function benchmark (name, cases) {
  var suiteOptions = {
    onStart: function () {
      console.log(this.name)
    },
    onCycle: function (event) {
      console.log(' ', String(event.target))
    },
    onComplete: function () {
      console.log('Fastest is ' + this.filter('fastest').pluck('name').join(' or '))
      console.log()
    }
  }

  var suite = new Benchmark.Suite(name, suiteOptions)
  Object.keys(cases).forEach(function (name) {
    suite.add(name, cases[name])
  })
  suite.run()
}

pattern = 'Simple string with nothing special'
intlMF = new IntlMF(pattern, 'en-US').format
mf = new MessageFormat(pattern, 'en-US').format
benchmark(
  'Format simple message', {
    'intl-messageformat (reuse object)': function () { intlMF(args) },
    'message-format (reuse object)': function () { mf(args) },
    'format-message': function () { formatMessage(pattern, args, 'en-US') },
    'format-message (inlined)': function () { formatMessage('Simple string with nothing special', args, 'en-US') }
  }
)

pattern = 'Simple string with { placeholder }.'
intlMF = new IntlMF(pattern, 'en-US').format
mf = new MessageFormat(pattern, 'en-US').format
benchmark(
  'Format common one arg message', {
    'intl-messageformat (reuse object)': function () { intlMF({ placeholder: 'replaced value' }) },
    'message-format (reuse object)': function () { mf({ placeholder: 'replaced value' }) },
    'format-message': function () { formatMessage(pattern, { placeholder: 'replaced value' }, 'en-US') },
    'format-message (inlined)': function () { formatMessage('Simple string with { placeholder }.', { placeholder: 'replaced value' }, 'en-US') }
  }
)

pattern = `{name} had {
    gender, select,
      male {his}
      female {her}
      other {their}
    } {
    nth, selectordinal,
      one {#st}
      two {#nd}
      few {#rd}
      other {#th}
    } banana today, which makes {
    numBananas, plural,
         =0 {no bananas}
         =1 {a banana}
      other {lots of bananas}
    } total.`
intlMF = new IntlMF(pattern, 'en-US').format
mf = new MessageFormat(pattern, 'en-US').format
args = {
  date: new Date(),
  name: 'Curious George',
  gender: 'male',
  numBananas: 300,
  nth: 3
}
benchmark(
  'Format complex message (no numbers or dates)', {
    'intl-messageformat (reuse object)': function () { intlMF(args) },
    'message-format (reuse object)': function () { mf(args) },
    'format-message': function () { formatMessage(pattern, args) },
    'format-message (inlined)': function () {
      formatMessage(`{name} had {
        gender, select,
          male {his}
          female {her}
          other {their}
        } {
        nth, selectordinal,
          one {#st}
          two {#nd}
          few {#rd}
          other {#th}
        } banana today, which makes {
        numBananas, plural,
             =0 {no bananas}
             =1 {a banana}
          other {lots of bananas}
        } total.`, args, 'en-US')
    }
  }
)

pattern = `On { date, date, short } {name} had {
    numBananas, plural,
         =0 {no bananas}
         =1 {a banana}
      other {# bananas}
    } {
    gender, select,
      male {in his room.}
      female {in her room.}
      other {in their room.}
    }`
intlMF = new IntlMF(pattern, 'en-US').format
mf = new MessageFormat(pattern, 'en-US').format
args = {
  date: new Date(),
  name: 'Curious George',
  gender: 'male',
  numBananas: 300
}
benchmark(
  'Format complex message', {
    'intl-messageformat (reuse object)': function () { intlMF(args) },
    'message-format (reuse object)': function () { mf(args) },
    'format-message': function () { formatMessage(pattern, args) },
    'format-message (inlined)': function () {
      formatMessage(`On { date, date, short } {name} had {
          numBananas, plural,
               =0 {no bananas}
               =1 {a banana}
            other {# bananas}
          } {
          gender, select,
            male {in his room.}
            female {in her room.}
            other {in their room.}
          }`, args, 'en-US')
    }
  }
)
