'use strict'

const optimist = require('optimist')
const filename = optimist.argv['_'][0]
const { join } = require('path')
let fs = require('fs')
let walk = function (dir, done) {
    let results = []
    fs.readdir(dir, function(err, list) {
        if (err) return done(err)
        let pending = list.length
        if (!pending) return done(null, results)
        list.forEach(function(file) {
            // console.log(dir, file)
            file = dir + '/' + file
            // file = path.resolve(dir, file)
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res)
                        if (!--pending) done(null, results)
                    })
                } else {
                    results.push(file)
                    if (!--pending) done(null, results)
                }
            })
        })
    })
}
const commandDir = 'Commands'
walk(commandDir, (err, res) => {
    let validCommands = {}
    for (let x of res) {
        const filename = x.split('/').pop().replace('.js', '')
        validCommands[filename] = x
    }
    const cmdFile = './' + validCommands[filename]
    if (!cmdFile) {
        console.log('Command Not Found', `(${filename})`)
        process.exit(0)
    }
    const CMD = require(cmdFile)
    const {_, $0, ...argv} = optimist.argv
    const C = new CMD()
    if (typeof C.run === 'function') {
        C
            .run(argv)
            .catch(err => {
                console.log(err)
                process.exit(0)
            })
    } else {
        console.log('Command Doesnt have .run() function')
    }
})