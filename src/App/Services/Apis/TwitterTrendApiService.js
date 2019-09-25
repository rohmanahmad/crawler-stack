'use strict'

const moment = require('moment')
const {uniq} = require('lodash')

const { list: ColoursConfig } = use('Config/Colours')
const { MongoAdapter } = use('Libs/DbAdapter')

const database = new MongoAdapter()
    .setURI('MONGODB_URI_TRENDS')
    .models([
        'TwitterTrends'
    ])
    .setup()
class TwitterApiService {
    constructor () {}

    async getTwitterTrends (queries = {}) {
        try {
            const allTrends = await this.getTwitterData(queries)
            let items = []
            let labels = []
            // getting labels
            // for (let i in allTrends) {
            //     const tren = allTrends[i]
            //     for (const index in tren.items) {
            //         const xd = tren.items[index]
            //         const date = moment(xd.date).format('YYYY-MM-DD HH:mm:00')
            //         labels.push(date)
            //     }
            // }
            // labels = labels.sort().map(x => `${x}`)
            // labels = uniq(labels)
            // console.log(labels)
            // for (let i in allTrends) {
            //     const tren = allTrends[i]
            //     let xdata = []
            //     const text = tren['_id']['text']
            //     if (text) {
            //         for (const index in tren.items) {
            //             const xd = tren.items[index]
            //             const date = moment(xd.date).format('YYYY-MM-DD HH:mm:00')
            //             // console.log('-------')
            //             for (const l of labels) {
            //                 let item = {}
            //                 // console.log(`${date}`, l, `${date}` === l)
            //                 if (`${date}` === l) {
            //                     item = {
            //                         t: new Date(l),
            //                         y: Math.ceil(xd.count / 1000)
            //                     }
            //                 } else {
            //                     item = {
            //                         t: l,
            //                         y: 0
            //                     }
            //                 }
            //                 xdata.push(item)
            //             }
            //         }
            //     }
            //     const res = {
            //         label: text,
            //         fill: false,
            //         borderColor: colours[parseInt(i)],
            //         pointBackgroundColor: colours[parseInt(i)],
            //         backgroundColor: colours[parseInt(i)],
            //         data: xdata
            //     }
            //     items.push(res)
            // }
            // labels = labels.map(x => moment(x).format('YYYY-MMM-DD HH:mm:00'))
            return {items: [], labels: []}
        } catch (err) { throw err }
    }
    
    getCriteria ({ since, until }) {
        try {
            const defaultsince = new Date(moment().subtract(2, 'h').format('YYYY-MM-DD HH:mm:00'))
            const defaultuntil = new Date(moment().format('YYYY-MM-DD HH:mm:00'))
            since = since ? new Date(since + ' 00:00:00') : defaultsince
            until = until ? new Date(until + ' 23:59:59') : defaultuntil
            let criteria = {
                source: 'twitter',
                date: {
                    $gte: since,
                    $lte: until
                }
            }
            return criteria
        } catch (err) { throw err }
    }
    
    async getTwitterData (queries = {}) {
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
                                count: '$post.count',
                                date: '$date'
                            }
                        }
                    }
                }
            ]
            const data = await database.TwitterTrends.aggregate(aggregate)
            return data
        } catch (err) { throw err }
    }
}

module.exports = TwitterApiService
