'use strict'

const Request = require('request')
const countryURL = 'https://www.instagram.com/explore/locations/?__a=1&page=<page>'
const cityURL = 'https://www.instagram.com/explore/locations/<country>/?__a=1&page=<page>'

class IGLocations {
    constructor () { }
    setPage (page = 0) {
        this.page = page
        return this
    }
    setCountry (country = 'ID') {
        this.country = country
        return this
    }
    setCity (city = '') {
        this.city = city
        return this
    }
    getCountries () {
        return new Promise((resolve, reject) => {
            try {
                if (parseInt(this.page) < 0) throw 'Invalid Input'
                const url = countryURL
                    .replace('<page>', this.page || 1)
                console.log('[GET]', url)
                Request
                    .get(url, (err, res, body) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(body)
                        }
                    })
            } catch (err) {
                reject(err)
            }
        })
    }
    getCities () {
        return new Promise((resolve, reject) => {
            try {
                if (!this.country || parseInt(this.page) < 0) throw 'Invalid Input'
                const url = cityURL
                    .replace('<country>', this.country || 'ID')
                    .replace('<page>', this.page || 0)
                console.log('[GET]', this.country, ':', url)
                Request
                    .get(url, (err, res, body) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(body)
                        }
                    })
            } catch (err) {
                reject(err)
            }
        })
    }
}

module.exports = IGLocations