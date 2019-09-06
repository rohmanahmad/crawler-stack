'use strict'

const moment = require('moment')
const request = require('request')
const { result } = require('lodash')
const {writeFileSync} = require('fs')
// ex: https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=-420&ed=20190831&geo=ID&ns=15
const trendUrl = 'https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=-420&ed=<date>&geo=ID&ns=15'

class GoogleTrends {
    constructor (config = {}) {
        const d = config.date || new Date()
        const date = moment(d).format('YYYYMMDD') // 20190831
        this.geo = config.geo || 'ID'
        this.url = trendUrl.replace('<date>', date)
    }
    async run () {
        try {
            const gTrends = await this.getTrendings()
            return gTrends
        } catch (err) { throw err }
    }

    getTrendings () {
        return new Promise((resolve, reject) => {
            request({
                type: 'GET',
                url: this.url
            }, (error, response, body) =>{
                try {
                    if (error) return reject(error)
                    body = body.replace(')]}\',', '')
                    // writeFileSync('/tmp/google-trends.json', body, {encoding: 'utf8'})
                    let json = JSON.parse(body)['default']
                    json = result(json, 'trendingSearchesDays', [])
                    this.getList(json)
                        .then(resolve)
                        .catch(reject)
                } catch (err) {
                    reject(err)
                }
            })
        })
    }

    async getList (data = []) {
        try {
            if (!data || (data && data.length === 0)) return []
            let streams = []
            for (let d of data) {
                const trendSearch = result(d, 'trendingSearches')
                const dateArr = [
                    result(d, 'date', '').substr(0, 4),
                    result(d, 'date', '').substr(4, 2),
                    result(d, 'date', '').substr(6, 10)
                ]
                const date = new Date(dateArr.join('-') + ' 00:00:00')
                if (trendSearch && trendSearch.length > 0) {
                    for (const ts of trendSearch) {
                        const title = result(ts, 'title.query', '')
                        let total = result(ts, 'formattedTraffic', '0').replace('+', '')
                        if (total.indexOf('K') > -1) {
                            total = parseFloat(total) * 1000
                        } else if (total.indexOf('M') > -1) {
                            total = parseFloat(total) * 1000 * 1000
                        }
                        const image = result(ts, 'image.imageUrl', '')
                        const exploreLink = result(ts, 'title.exploreLink', '')
                        const source = result(ts, 'shareUrl', '')
                        const articles = result(ts, 'articles', [])
                        streams.push({
                            date,
                            title,
                            total,
                            image,
                            exploreLink,
                            source,
                            articles
                        })
                    }
                }
            }
            return streams
        } catch (err) { throw err }
    }
}

module.exports = GoogleTrends