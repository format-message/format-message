'use strict'

// This script was heavily inspired by:
// https://github.com/babel/babel/blob/master/scripts/bootstrap.js

var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var child = require('child_process')
var async = require('async')
var path = require('path')
var fs = require('fs')

// get packages
var packageMap = {}
var PACKAGES_PATH = path.resolve(__dirname + '/../packages')
var packages = fs.readdirSync(PACKAGES_PATH)
  .map(function (name) {
    if (name[0] === '.') return

    var pkgJson = PACKAGES_PATH + '/' + name + '/package.json'
    if (!fs.existsSync(pkgJson)) return
    pkgJson = require(pkgJson)

    packageMap[pkgJson.name] = {
      path: PACKAGES_PATH + '/' + name,
      age: pkgJson
    }

    console.log(pkgJson.name)
    return packageMap[pkgJson.name]
  })
  .filter(function (o) { return !!o })

async.parallelLimit(packages.map(function (pack) {
  return function (done) {
    var NODE_MODULES_PATH = pack.path + '/node_modules'

    var toLink = []
    var toInstall = []
    if (pack.age.dependencies) collectDependencies(pack.age.dependencies)
    if (pack.age.devDependencies) collectDependencies(pack.age.devDependencies)
    function collectDependencies (dependencies) {
      Object.keys(dependencies).forEach(function (dep) {
        var ver = dependencies[dep]
        var shouldLink = (
          ver[0] === '^' &&
          packageMap[dep] &&
          packageMap[dep].age.version[0] === ver[1]
        )
        if (shouldLink) {
          toLink.push({
            src: packageMap[dep].path,
            dest: NODE_MODULES_PATH + '/' + dep
          })
        } else {
          toInstall.push(dep + '@"' + ver + '"')
        }
      })
    }

    var tasks = []

    if (toLink.length) {
      tasks.push(function (done) {
        mkdirp(NODE_MODULES_PATH, done)
      })

      tasks.push(function (done) {
        async.each(toLink, function (link, done) {
          console.log(
            'Linking',
            path.relative(PACKAGES_PATH, link.src),
            'to', path.relative(PACKAGES_PATH, link.dest)
          )

          rimraf(link.dest, function (err) {
            if (err) return done(err)

            fs.mkdir(link.dest, function (err) {
              if (err) return done(err)

              fs.writeFile(
                link.dest + '/index.js',
                'module.exports = require(' + JSON.stringify(link.src) + ')',
                done
              )
            })
          })
        }, done)
      })
    }

    if (toInstall.length) {
      tasks.push(function (done) {
        child.exec('npm install ' + toInstall.join(' '), {
          cwd: pack.path
        }, function (err, stdout, stderr) {
          if (err != null) {
            done(stderr)
          } else {
            stdout = stdout.trim()
            if (stdout) console.log(stdout)
            done()
          }
        })
      })
    }

    async.series(tasks, done)
  }
}), 4, function (err) {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    process.exit()
  }
})
