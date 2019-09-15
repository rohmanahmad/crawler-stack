'use strict'

if (typeof use !== 'function') require('../../App/Bootstrap')

const TWPrf = use('Services/TWProfiles')
// const { result } = require('lodash')
// const md5 = require('md5')
const { MongoAdapter } = use('Libs/DbAdapter')
const L1 = Array.from('abcdefghijklmnopqrstuvwxyz') // A-Z
const L2 = Array.apply(null, {length: 25}).map(Number.call, Number).map(x => x + 1) // 1 - 26

const sleep = function (timeout = 10) {
    return new Promise((resolve) => {
        // console.log('sleep:', `${timeout}s`)
        setTimeout(resolve, timeout * 1000)
    })
}

class TwitterUsers {
    constructor () {
        this.db = new MongoAdapter()
            .setURI('MONGODB_URI_TRENDS')
            .models([
                'TwProfileUsers',
                'TwProfileGroups'
            ])
            .setup()
        this.TWPrf = new TWPrf()
    }
    async run ({group}) {
        try {
            if (!group) {
                this.getGroups(group).catch((err) => { throw err })
                this.getUsername().catch((err) => { throw err })
            }
        } catch (err) {
            console.log(err)
            throw err
        }
    }
    async getUsername () {
        try {
            const groups = await this.db.TwProfileGroups.find({user_crawled: {$ne: true}, level: 3})
            for (let group of groups) {
                const parent = {id: group._id, title: group.title}
                const {items} = await this.TWPrf.getUsernameByGroup([group.uniqId])
                await this.updateUsers(items, {parent})
                await sleep(30)
            }
            await sleep(10)
        } catch (err) {
            throw err
        }
    }
    async getGroups (group) {
        try {
            let isUsername = false
            let n = 1
            let groups = group ? [group] : [...L1, ...L2]
            while (!isUsername) {
                let loop = 0
                for (const g of groups) {
                    // console.log('..'.repeat(20), '#' + n , '..'.repeat(20))
                    let data = await this.TWPrf.getGroup([g], { n })
                    isUsername = data.isUsername
                    if (!isUsername) {
                        if (loop === 0) {
                            // console.log('--'.repeat(20), 'resetting groups to []')
                            groups = []
                        }
                        groups = groups.concat(data.items.map(x => x.uniqId))
                        await this.updateGroups(data.items)
                    }
                    loop += 1
                }
                n += 1
                await sleep(10)
            }
        } catch (err) {
            throw err
        }
    }
    async updateUsers (items, { parent }) {
        try {
            for (let item of items) {
                await this.db.TwProfileUsers.updateOne({username: item.uniqId}, {
                    $setOnInsert: {
                        created_at: new Date(),
                        username: item.uniqId,
                        url: item.url_user,
                        parent_group: parent
                    },
                    $set: {
                        last_crawled_at: new Date()
                    }
                }, {upsert: true})
            }
            console.log('(users) saved!', items.length, 'rows')
        } catch (err) {
            throw err
        }
    }
    async updateGroups (items) {
        try {
            for (let item of items) {
                await this.db.TwProfileGroups.updateOne({uniqId: item.uniqId}, {
                    $setOnInsert: {
                        created_at: new Date(),
                        title: item.title.trim(),
                        level: item.level,
                        uniqId: item.uniqId,
                        user_crawled: false,
                        url: item.url
                    },
                    $set: {
                        last_crawled_at: new Date()
                    }
                }, {upsert: true})
            }
            const {title, level} = items[0]
            console.log(`(groups) saved!`, items.length, 'rows', `[${level}] ${title}(sample)`)
        } catch (err) {
            throw err
        }
    }
}

module.exports = TwitterUsers