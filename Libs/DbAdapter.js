'use strict'

const {result} = require('lodash')

module.exports = {
    saveStreamToCollection (streamdata = []) {
        return new Promise((resolve, reject) => {
            console.log('first data:', result(streamdata, '[0].hashuniqeid', ''))
            console.log('found:', streamdata.length, 'rows')
            resolve()
        })
    }
}
