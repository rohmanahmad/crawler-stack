'use strict'

const moment = require('moment')

const { MongoAdapter } = use('Libs/DbAdapter')

const database = new MongoAdapter()
    .setURI('MONGODB_URI_TRENDS')
    .models([
        'TwitterTrends'
    ])
    .setup()

class TrendService {
    constructor () {}
    async getAllTrends (q) {
        try {
            let since, until
            let criteria = {}
            if (typeof q === 'function') {
                since = q('since') ? new Date(q('since') + ' 00:00:00') : new Date(moment().format('YYYY-MM-DD 00:00:00'))
                until = q('until') ? new Date(q('until') + ' 23:59:59') : new Date(moment().format('YYYY-MM-DD 23:59:59'))
                criteria = { since, until }
            }
            const allTrends = await database.TwitterTrends.aggregate([
                {
                    $match: criteria
                },
                {
                    $sort: {
                        date: 1
                    }
                },
                {
                    $group: {
                        _id: {
                            source: '$source',
                            date: '$date'
                        },
                        items: {
                            $addToSet: {
                                tren_id: '$tren_id',
                                text: '$text',
                                post_count: '$post.count'
                            }
                        }
                    }
                }
            ])
            return allTrends
                .map(x => ({
                    source: x._id.source,
                    date: moment(x._id.date).format('Y-MM-DD HH:mm:SS'),
                    items: x.items
                }))
        } catch (err) { throw err }
    }
}

module.exports = TrendService