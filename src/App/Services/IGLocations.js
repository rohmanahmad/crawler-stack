'use strict'

const Request = require('request')
const locURL = 'https://www.instagram.com/explore/locations/<location>/?__a=1&page=<page>'

class IGLocations {
    constructor (config = {}) {
        const {location, page} = config
        if (!location || parseInt(page) < 0) throw 'Invalid Input'
        this.location = location
        this.page = page
    }
    setPage (page = 0) {
        this.page = page
        return this
    }
    setLocation (location = 'ID') {
        this.location = location
        return this
    }
    getLocation () {
        return new Promise((resolve, reject) => {
            try {
                if (!this.location || parseInt(this.page) < 0) throw 'Invalid Input'
                const url = locURL
                    .replace('<location>', this.location || 'ID')
                    .replace('<page>', this.page || 0)
                console.log(url)
                Request
                    .get(url, (err, res, body) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(body)
                        }
                    })
            } catch (err) {
                throw err
            }
        })
    }
}

module.exports = IGLocations