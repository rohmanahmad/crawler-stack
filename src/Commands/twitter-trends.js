'use strict'

require('../App/Bootstrap')
const request = require('request')
const { MongoAdapter, MysqlAdapter } = use('Libs/DbAdapter')
const trendsUrl = 'https://twitter.com/i/trends'

class TwitterTrends {
    constructor () {
        this.db = new MongoAdapter()
            .setURI('MONGODB_URI_TRENDS')
            .models([
                'TwitterTrends'
            ])
            .setup()
    }

    run () {
        console.log('running')
        this.getTrends()
                .then((data) => {
                    for (const row of data) {
                        this.db.TwitterTrends.create(row)
                            .then(console.log)
                            .catch(console.error)
                    }
                })
        setInterval(() => {
            console.log('run...')
            this.getTrends()
                .then((data) => {
                    for (const row of data) {
                        this.db.TwitterTrends.create(row)
                            .then(console.log)
                            .catch(console.error)
                    }
                })
        }, 5 * 60 * 1000)
    }

    getTrends () {
        return new Promise((resolve, reject) => {
            let data = []
            request({
                method: 'GET',
                url: trendsUrl
            }, async (error, response, body) =>{
                if (error) return reject(error)
                if (body) {
                    const json = JSON.parse(body)
                    const htmlString = json['module_html']
                    const html = htmlString
                        .replace(/\u003c/g, '<')
                        .replace(/\u003e/g, '>')
                        .replace(/\n/g, '')
                        .replace(/ +/g, ' ')
                    const list = html.match(/<ul class="trend-items js-trends">(.*?)<\/ul>/)[0]
                    const allList = list.match(/<li(.*?)<\/li>/g)
                    for (const l of allList) {
                        const text = l.match(/data-trend-name="(.*?)"/)[1]
                        const id = l.match(/data-trends-id="(.*?)"/)[1]
                        const token = l.match(/data-trend-token="(.*?)"/)[1]
                        const src = l.match(/href="(.*?)"/)[1]
                        const totalTweet = l.match(/<div class="js-nav trend-item-stats js-ellipsis">(.*?)<\/div>/)[1]
                        const isKoma = totalTweet.indexOf(',') > -1
                        let tweets = parseInt(
                            totalTweet
                                .replace(/rb/i, '000')
                                .replace(/k/i, '000')
                                .replace(/[^0-9]/g, '-')
                                .replace(/\-/g, '')
                        )
                        if (isKoma) tweets = tweets / 100
                        data.push({
                            source: 'twitter',
                            date: new Date(),
                            tren_id: id,
                            text,
                            post: {
                                count: tweets || 0
                            },
                            raw: {
                                token,
                                src,
                                countText: totalTweet.trim()
                            }
                        })
                    }
                    resolve(data)
                }
            })
        })
    }
}

new TwitterTrends().run()