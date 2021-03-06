'use strict'

const moment = require('moment')
const {uniq} = require('lodash')

const { MongoAdapter } = use('Libs/DbAdapter')

const database = new MongoAdapter()
    .setURI('MONGODB_URI_TRENDS')
    .models([
        'TwitterTrends',
        'YoutubeTrends'
    ])
    .setup()

const colours = [
    '#A52A2A', '#FF7F50', '#FF8C00', '#FFD700',
    '#DAA520', '#F0E68C', '#7CFC00', '#ADFF2F',
    '#008000', '#32CD32', '#00FFFF', '#40E0D0',
    '#4682B4', '#000080', '#8A2BE2', '#9932CC',
    '#CD5C5C', '#FFA07A', '#B8860B', '#BDB76B',
    '#FFFF00', '#6B8E23', '#00FA9A', '#7FFF00'
]
class TrendService {
    constructor () {}

    async getTwitterTrends (q) {
        try {
            let since = new Date(moment().subtract(2, 'h').format('YYYY-MM-DD HH:mm:00'))
            let until = new Date(moment().format('YYYY-MM-DD HH:mm:00'))
            if (typeof q === 'object') {
                since = q['since'] ? new Date(q['since'] + ' 00:00:00') : since
                until = q['until'] ? new Date(q['until'] + ' 23:59:59') : until
            }
            let criteria = {
                source: 'twitter',
                date: {
                    $gte: since,
                    $lte: until
                }
            }
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
            const allTrends = await database.TwitterTrends
                .aggregate(aggregate)
            let items = []
            let labels = []
            // getting labels
            for (let i in allTrends) {
                const tren = allTrends[i]
                for (const index in tren.items) {
                    const xd = tren.items[index]
                    const date = moment(xd.date).format('YYYY-MM-DD HH:mm:00')
                    labels.push(date)
                }
            }
            labels = labels.sort().map(x => `${x}`)
            labels = uniq(labels)
            // console.log(labels)
            for (let i in allTrends) {
                const tren = allTrends[i]
                let xdata = []
                const text = tren['_id']['text']
                if (text) {
                    for (const index in tren.items) {
                        const xd = tren.items[index]
                        const date = moment(xd.date).format('YYYY-MM-DD HH:mm:00')
                        // console.log('-------')
                        for (const l of labels) {
                            let item = {}
                            // console.log(`${date}`, l, `${date}` === l)
                            if (`${date}` === l) {
                                item = {
                                    t: new Date(l),
                                    y: Math.ceil(xd.count / 1000)
                                }
                            } else {
                                item = {
                                    t: l,
                                    y: 0
                                }
                            }
                            xdata.push(item)
                        }
                    }
                }
                const res = {
                    label: text,
                    fill: false,
                    borderColor: colours[parseInt(i)],
                    pointBackgroundColor: colours[parseInt(i)],
                    backgroundColor: colours[parseInt(i)],
                    data: xdata
                }
                items.push(res)
            }
            labels = labels.map(x => moment(x).format('YYYY-MMM-DD HH:mm:00'))
            return {items, labels}
        } catch (err) { throw err }
    }

    async getYoutubeTrends (q) {
        try {
            let since = new Date(moment().subtract(7, 'd').format('YYYY-MM-DD HH:mm:00'))
            let until = new Date(moment().format('YYYY-MM-DD HH:mm:00'))
            if (typeof q === 'object') {
                since = q['since'] ? new Date(q['since'] + ' 00:00:00') : since
                until = q['until'] ? new Date(q['until'] + ' 23:59:59') : until
            }
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
            const allTrends = await database.YoutubeTrends
                .aggregate(aggregate)
            let items = []
            let labels = []
            // getting labels
            for (let i in allTrends) {
                // console.log(allTrends[i]['items'])
                const tren = allTrends[i]
                let ambil = 1
                for (const index in tren.items) {
                    const xd = tren.items[index]
                    const date = moment(xd.date).format('YYYY-MM-DD HH:00:00')
                    labels.push(date)
                    ambil += 1
                }
            }
            labels = labels.sort().map(x => `${x}`)
            labels = uniq(labels)
            for (let i in allTrends) {
                // if (parseInt(i) > 0) {
                    const tren = allTrends[i]
                    let xdata = []
                    const text = tren['_id']['text']
                    if (text) {
                        let ambil = 1
                        for (const index in tren.items) {
                            // if (ambil <= 10) {
                                const xd = tren.items[index]
                                const date = moment(xd.date).format('YYYY-MM-DD HH:00:00')
                                for (const l of labels) {
                                    let item = {}
                                    // console.log(`${date}`, l, `${date}` === l)
                                    if (`${date}` === l) {
                                        item = {
                                            t: new Date(l),
                                            y: xd.count / (1000 * 1000)
                                        }
                                    } else {
                                        item = {
                                            t: l,
                                            y: 0
                                        }
                                    }
                                    xdata.push(item)
                                }
                                ambil += 1
                            // }
                        }
                    }
                    const res = {
                        label: text,
                        fill: false,
                        borderColor: colours[parseInt(i)],
                        pointBackgroundColor: colours[parseInt(i)],
                        backgroundColor: colours[parseInt(i)],
                        data: xdata
                    }
                    items.push(res)
                // }
            }
            labels = labels.map(x => moment(x).format('YYYY-MMM-DD HH:00:00'))
            return {items, labels}
        } catch (err) { throw err }
    }
}

module.exports = TrendService