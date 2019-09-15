'use strict'

const request = require('request')
const profileGroup = 'https://twitter.com/i/directory/profiles/<group>'
const { readFileSync, writeFileSync } = require('fs')
const { result } = require('lodash')

const sleep = function (timeout = 10) {
    return new Promise((resolve) => {
        // console.log('sleep...', `${timeout}s`)
        setTimeout(resolve, timeout * 1000)
    })
}

class TWProfile {
    constructor () { }

    requestData (url = '') {
        return new Promise((resolve, reject) => {
            try {
                request.get(url, (err, res, body) => {
                    if (err) {
                        console.log(err)
                        console.log('retry after 10s')
                        setTimeout(async () => {
                            resolve(await this.requestData(url))
                        }, 10 * 1000)
                    } else {
                        if (res.statusCode !== 200) throw body
                        resolve(body)
                    }
                })
            } catch (err) {
                reject(err)
            }
        })
    }

    async getGroup (groups = [], config = {}) {
        try {
            const urls = groups.map(x => profileGroup.replace('<group>', x))
            const data = await this.getProfileGroup(urls, config)
            return data
        } catch (err) {
            console.log(err)
        }
    }

    async getUsernameByGroup (groups = []) {
        try {
            let urls = groups.map(group => profileGroup.replace('<group>', group))
            const data = await this.getProfileGroup(urls, { n: 0, user: true })
            return data
        } catch (err) { throw err }
    }

    async getProfileGroup (urls = [], config = {}) {
        try {
            let items = []
            let isUsername = false
            for (let url of urls) {
                // console.log('(group) requesting:', url)
                try {
                    let body = await this.requestData(url)
                    body = body.replace(/\n/g, ' ')
                    const uls = body.match(/<ul class="span3">(.*?)<\/ul>/img)
                    if (!uls || (uls && !uls[0])) throw 'Invalid <ul>'
                    const list = await this.getList(uls, config)
                    isUsername = list.isUsername
                    items = [...items, ...list.items]
                    // console.log({items: list.items, count: list.items.length})
                    await sleep(5)
                } catch (err) { throw err }
            }
            return {isUsername, items}
        } catch (err) { throw err }
    }

    async getProperties (li = '', { n }) {
        try {
            let results = []
            const u = li.match(/\/i\/directory\/profiles\/(.*?)"/img)
            const title = (li.match(/title="(.*?)"/img) || [])
                .map(x => x
                    .replace('title="', '')
                    .replace('"', '')
                )
                .join(' - ')
            for (let i of u) {
                const url = 'https://twitter.com' + i.replace('"', '')
                const uniqId = url.split('/').pop()
                let data = { title, uniqId, level: n }
                data[`url`] = url
                results.push(data)
            }
            return results
        } catch (err) { throw err }
    }

    async getUserScreenName (li = '') {
        try {
            let results = []
            const u = li.match(/<span class="screenname">(.*?)<\/span>/img)
            for (let i of u) {
                const uniqId = i.replace('<span class="screenname">', '').replace('</span>', '')
                const url = ('https://twitter.com' + uniqId.replace('@', '/')).trim()
                let data = { uniqId }
                data[`url_user`] = url
                results.push(data)
            }
            return results
        } catch (err) {
            throw err
        }
    }

    async getList (uls = [], { n, user }) {
        try {
            let isUsername = false
            let items = []
            for (let ul of uls) {
                const list = ul.match(/<li(.*?)<\/li>/img)
                for (let li of list) {
                    let item = []
                    if (li.indexOf('class="screenname"') > -1) {
                        if (user) {
                            item = await this.getUserScreenName(li)
                        }
                        isUsername = true
                    } else {
                        item = await this.getProperties(li, { n })
                    }
                    items.push(...item)
                }
            }
            // console.log({count: items.length, sample: items[0]})
            return {
                isUsername,
                items
            }
        } catch (err) {
            throw err
        }
    }
}

module.exports = TWProfile