'use strict'

const Request = require('request')

const placeUrl = 'https://www.instagram.com/explore/locations/<cityid>?__a=1&page=<page>'

class IGPlaceLocation {
    constructor () {
        // 
    }
    
    setPage (page = 0) {
        this.page = page
        return this
    }

    setCity (city = '') {
        this.city = city
        return this
    }

    getPlacesByCity (cityId) {
        return new Promise((resolve, reject) => {
            try {
                if (parseInt(this.page) < 0 || (!this.city && !cityId)) return reject('Invalid Input')
                const url = placeUrl
                    .replace('<cityid>', this.city || cityId)
                    .replace('<page>', this.page || 1)
                console.log('[GET]', (cityId || this.city), ':', url)
                Request
                    .get(url, (err, res, body) => {
                        try {
                            if (err) {
                                throw err
                            } else {
                                const json = JSON.parse(body)
                                console.log('Found:', (json.location_list || []).length, 'row')
                                resolve(json)
                            }
                        } catch (err) {
                            reject(err)
                        }
                    })
            } catch (err) {
                reject(err)
            }
        })
    }
}

module.exports = IGPlaceLocation