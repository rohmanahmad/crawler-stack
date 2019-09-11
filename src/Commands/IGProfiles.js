'use strict'

if (typeof use !== 'function') require('../App/Bootstrap')

const IGPrf = use('Services/IGProfiles')
const { result } = require('lodash')
const { MongoAdapter } = use('Libs/DbAdapter')
const L1 = 99
const L2 = 9

const sleep = function (timeout = 10) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout * 1000)
    })
}

class IGProfiles {
    constructor () {
        this.db = new MongoAdapter()
            .setURI('MONGODB_URI_TRENDS')
            .models([
                'InstagramProfiles'
            ])
            .setup()
        this.IGPrf = new IGPrf()
    }
    async run () {
        try {
            for (let index1 = 0; index1 <= L1; index1++) {
                for (let index2 = 0; index2 <= L2; index2++) {
                    try {
                        console.log('--', [index1, index2])
                        const users = await this.IGPrf.getAllProfiles(index1, index2)
                        await this.updateUsers(users, { index1, index2 })
                        await sleep(5)
                    } catch (err) {
                        console.log(err)
                    }
                }
            }
        } catch (err) {
            console.log(err)
            throw err
        }
    }
    async updateUsers (data = [], { index1, index2 }) {
        try {
            data = JSON.parse(data)
            for (const user of data) {
                await this.db
                    .InstagramProfiles
                    .updateOne({
                        'profile.username': user
                    }, {
                        $set: {
                            updated_at: new Date()
                        },
                        $setOnInsert: {
                            index: {
                                one: index1,
                                two: index2
                            },
                            profile: {
                                id: null,
                                username: user,
                                real_name: null,
                                profile_pic: null,
                                followers: null,
                                following: null,
                                bio: null
                            },
                            created_at: new Date(),
                            raw: {},
                            last_crawled: {
                                page: 0,
                                at: null
                            }
                        }
                    }, { upsert: true })
            }
        } catch (err) { throw err }
    }
    async profileDetail () {
        try {
            let users = await this.db.InstagramProfiles.find({'last_crawled.at': null}).limit(100)
            let hasNext = (users.length === 100)
            while (hasNext) {
                for (let user of users) {
                    try {
                        const username = result(user, 'profile.username')
                        const raw = await this.getDetail(username)
                        await this.updateProfile(raw, username)
                        await sleep(5)
                    } catch (err) {
                        console.log(err)
                    }
                }
                users = await this.db.InstagramProfiles.find({'last_crawled.at': null}).limit(100)
                hasNext = (users.length === 100)
            }
            console.log('(profile_detail) done')
        } catch (err) {
            throw err
        }
    }
    async getDetail (user) {
        try {
            if (!user) throw 'Invalid User'
            const detail = await this.IGPrf.getProfile(user)
            return detail
        } catch (err) {
            throw err
        }
    }
    async updateProfile (raw, username) {
        try {
            if (username) {
                await this.db
                    .InstagramProfiles
                    .updateOne({
                        'profile.username': username
                    }, {
                        $set: {
                            'profile.id': result(raw, 'id', null),
                            'profile.real_name': result(raw, 'full_name', null),
                            'profile.profile_pic': result(raw, 'profile_pic_url', null),
                            'profile.followers': result(raw, 'edge_followed_by.count', null),
                            'profile.following': result(raw, 'edge_follow.count', null),
                            'profile.bio': result(raw, 'biography', null),
                            raw,
                            last_crawled: {
                                page: 0,
                                at: new Date()
                            }
                        }
                    })
            }
            return false
        } catch (err) { throw err }
    }
}

// new IGProfiles().run().catch(() => { process.exit(0) })
new IGProfiles().profileDetail().catch(() => { process.exit(0) })