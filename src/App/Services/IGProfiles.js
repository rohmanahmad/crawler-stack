'use strict'

const request = require('request')
const { result } = require('lodash')
const domain = 'https://www.instagram.com'
const profileDirUrl = domain + '/directory/profiles/<index1>-<index2>?__a=1'
const profileUrl = domain + '/<username>?__a=1&utm_source=ig_seo&utm_campaign=profiles'

class IGProfiles {
    constructor () { }
    getAllProfiles (index1, index2) {
        return new Promise((resolve, reject) => {
            const url = profileDirUrl
                .replace('<index1>', index1)
                .replace('<index2>', index2)
            request
                .get(url, function (err, res, body) {
                    if (err) return reject(err)
                    try {
                        const json = JSON.parse(body)
                        const users = result(json, 'profile_data.profile_list', [])
                        return resolve(users)
                    } catch (err) {
                        reject(err)
                    }
                })
        })
    }
    getProfile (username) {
        return new Promise((resolve, reject) => {
            const url = profileUrl
                .replace('<username>', username)
            console.log('[GET]', url)
            request
                .get(url, function (err, res, body) {
                    if (err) return reject(err)
                    try {
                        if (res.statusCode !== 200) {
                            return resolve({})
                        }
                        const json = JSON.parse(body)
                        return resolve(result(json, 'graphql.user', {}))
                    } catch (err) {
                        reject(err)
                    }
                })
        })
    }
}

module.exports = IGProfiles