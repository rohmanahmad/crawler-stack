'use strict'

const _ = require('lodash')
const async = require('async')

class FilterStreams {
    constructor (config = {}) {
        this.config = config
    }

    tokenize (input) {
        return input
            .replace(/[^a-zA-Z 0-9#@]+/g, ' ')
            .trim()
            .replace(/\s+/ig, ' ')
            .toLowerCase()
            .split(' ')
    }

    getInclude () {
        if (this.config && this.config.key_in) {
            if (typeof this.config.key_in === 'string') {
                return this.config
                    .key_in
                    .split(',')
                    .map(x => x.trim())
            }
            return this
                .config
                .key_in
        } else {
            return null
        }
    }

    getExclude () {
        if (this.config && this.config.key_ex) {
            if (typeof this.config.key_ex === 'string') {
                return this.config
                    .key_ex
                    .split(',')
                    .map(x => x.trim())
            }
            return this
                .config
                .key_ex
        } else {
            return null
        }
    }

    filter (streams = []) {
        return new Promise((resolve, reject) => {
            if (!this.config) {
                return reject('invalid config')
            }
            if (!streams || typeof streams !== 'object' || streams.length === 0) {
                return resolve([])
            }
            const keywords = this.config.keyword
            const include = this.getInclude()
            const exclude = this.getExclude()
            let allStreams = []
            let queue = async.queue((stream, n) => {
                const arrText = this.tokenize(_.result(stream, 'title', '') + '.' + _.result(stream, 'text', ''))
                const isContainKeyword = _.intersection(keywords, arrText).length > 0 ? 1 : 0
                const isInclude = include && include.length > 0 ? _.intersection(arrText, include).length > 0 : 1
                const isExclude = exclude && exclude.length > 0 ? _.intersection(arrText, exclude).length <= 0 : 1
                if (isContainKeyword && isExclude && isInclude) {
                    // debuglog(stream.thread.uuid + _.intersection(keywords, arrText))
                    allStreams.push(stream)
                } else {
                    // console.log('++'.repeat(100))
                    // console.log(`>> ${stream.title} ${stream.text}`)
                    // console.log('tokenize', arrText)
                    // console.log('contain', _.intersection(keywords, arrText))
                    // console.log('include', _.intersection(arrText, include))
                    // console.log('exclude', _.intersection(arrText, exclude))
                }
                n()
            }, 2)
            async.each(streams, (s, callback) => {
                queue.push(s, () => {
                    callback()
                })
            }, function () {
                console.log(`data streams new: ${allStreams.length} filtered.`)
                return resolve(allStreams)
            })
        })
    }
}

module.exports = FilterStreams
// // testing
// const {readFileSync} = require('fs')
// const {join} = require('path')
// let streams = readFileSync(join(__dirname, '../dummy/streams.json'), {encoding: 'utf-8'})
// streams = JSON.parse(streams)
// console.log('old:', streams.length)
// new FilterStreams({
//     key_in: '',
//     key_ex: '',
//     keyword: ['indomie']
// })
//     .filter(streams)
//     .then(r => console.log('new:', r.length))
