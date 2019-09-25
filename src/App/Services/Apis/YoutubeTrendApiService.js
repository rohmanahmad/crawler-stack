'use strict'

const moment = require('moment')
const {uniq} = require('lodash')

const { list: ColoursConfig } = use('Config/Colours')
const { MongoAdapter } = use('Libs/DbAdapter')

const database = new MongoAdapter()
    .setURI('MONGODB_URI_TRENDS')
    .models([
        'YoutubeTrends'
    ])
    .setup()

class YoutubeTrendApiService{
    constructor () {}

    async getYoutubeTrends (q) {
        try {
            const allTrends = await this.getYoutubeData(q)
            let items = []
            let labels = []
            // getting labels
            for (let tren of allTrends) {
                
            }
            return {items, labels}
        } catch (err) { throw err }
    }

    getCriteria ({since, until}) {
        try {
            let defaultsince = new Date(moment().subtract(7, 'd').format('YYYY-MM-DD HH:mm:00'))
            let defaultuntil = new Date(moment().format('YYYY-MM-DD HH:mm:00'))
            since = since ? new Date(since + ' 00:00:00') : defaultsince
            until = until ? new Date(until + ' 23:59:59') : defaultuntil
            let criteria = {
                source: 'youtube',
                'position': {
                    $lte: 10
                },
                date: {
                    $gte: since,
                    $lte: until
                }
            }
            return criteria
        } catch (err) { throw err }
    }

    async getYoutubeData (queries = {}) {
        try {
            const criteria = this.getCriteria(queries)
            const aggregate = [
                {
                    $match: criteria
                },
                {
                    $group: {
                        _id: {
                            source: '$source',
                            text: '$text'
                        },
                        items: {
                            $addToSet: {
                                count: '$post.views',
                                date: '$date'
                            }
                        }
                    }
                }
            ]
            const data = await database.YoutubeTrends.aggregate(aggregate)
            return data
        } catch (err) { throw err }
    }
}

module.exports = YoutubeTrendApiService
