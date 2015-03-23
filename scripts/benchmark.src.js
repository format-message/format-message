if (typeof Intl === 'undefined') { require('intl') }
import IntlMF from 'intl-messageformat'
import MessageFormat from 'message-format'
import formatMessage from '../src/format-message'
import Benchmark from 'benchmark'
let pattern, intlMF, mf, args

function benchmark (name, cases) {
  let suiteOptions = {
    onStart () {
      console.log(this.name)
    },
    onCycle (event) {
      console.log(' ', String(event.target))
    },
    onComplete () {
      console.log('Fastest is ' + this.filter('fastest').pluck('name').join(' or '))
      console.log()
    }
  }

  let suite = new Benchmark.Suite(name, suiteOptions)
  Object.keys(cases).forEach(name => suite.add(name, cases[name]))
  suite.run()
}

pattern = 'Simple string with nothing special'
intlMF = new IntlMF(pattern, 'en-US').format
mf = new MessageFormat(pattern, 'en-US').format
benchmark(
  'Format simple message', {
      'intl-messageformat (reuse object)': () => intlMF(args),
      'message-format (reuse object)': () => mf(args),
      'format': () => formatMessage(pattern, args, 'en-US'),
      'format (transpiled)': () => formatMessage('Simple string with nothing special', args, 'en-US')
  }
)

pattern = 'Simple string with { placeholder }.'
intlMF = new IntlMF(pattern, 'en-US').format
mf = new MessageFormat(pattern, 'en-US').format
args = { placeholder: 'replaced value' }
benchmark(
  'Format common one arg message', {
    'intl-messageformat (reuse object)': () => intlMF(args),
    'message-format (reuse object)': () => mf(args),
    'format': () => formatMessage(pattern, args, 'en-US'),
    'format (transpiled)': () => formatMessage('Simple string with { placeholder }.', args, 'en-US')
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
// intlMF = new IntlMF(pattern, 'en-US').format // doesn't support selectordinal
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
//    'intl-messageformat (reuse object)': () => intlMF(args),
    'message-format (reuse object)': () => mf(args),
    'format': () => formatMessage(pattern, args),
    'format (transpiled)': () => {
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
    'intl-messageformat (reuse object)': () => intlMF(args),
    'message-format (reuse object)': () => mf(args),
    'format': () => formatMessage(pattern, args),
    'format (transpiled)': () => {
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
