'use strict'
var cli = require('..')

var SyncReadable = (input) => ({
  setEncoding () {},
  on (event, cb) { cb() },
  read () { return input }
})

var SyncWritable = () => ({
  data: '',
  write (data) { this.data += data }
})

module.exports = function exec (cmd, stdin) {
  var code = 0
  var process = global.process
  var fake = global.process = {
    exit: function (c) { code = c },
    argv: [process.execPath].concat(cmd.split(' ').map(arg =>
      arg[0] === '"' ? JSON.parse(arg) : arg
    )),
    stdin: SyncReadable(stdin),
    stdout: SyncWritable(),
    stderr: SyncWritable()
  }
  Object.keys(process).forEach(key => {
    fake[key] = fake[key] || process[key]
  })
  var timers = new Set()
  var setTimeout = global.setTimeout
  var clearTimeout = global.clearTimeout
  var consoleLog = console.log
  var consoleWarn = console.warn
  var consoleError = console.error
  console.log = (...args) => { fake.stdout.write(args.join(' ')) }
  console.warn = (...args) => { fake.stderr.write(args.join(' ')) }
  console.error = (...args) => { fake.stderr.write(args.join(' ')) }
  global.setTimeout = (fn) => {
    timers.add(fn)
    return fn
  }
  global.clearTimeout = (fn) => timers.delete(fn)
  var error
  try {
    cli.commands.forEach(command => {
      command.options.forEach(option => {
        if (option.defaultValue) {
          command[option.attributeName()] = option.defaultValue
        } else {
          delete command[option.attributeName()]
        }
      })
    })
    cli.parse(fake.argv)
    timers.forEach((fn) => fn())
  } catch (err) {
    error = err
  }
  timers.clear()
  global.clearTimeout = clearTimeout
  global.setTimeout = setTimeout
  console.log = consoleLog
  console.warn = consoleWarn
  console.error = consoleError
  global.process = process
  if (error) throw error
  return { code, stdout: fake.stdout.data, stderr: fake.stderr.data }
}
