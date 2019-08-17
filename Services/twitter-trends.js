'use strict'

const request = require('request')
const {writeFileSync} = require('fs')
const {join} = require('path')
const trendsUrl = 'https://twitter.com/i/trends'

class TwitterTrends {
    constructor () {
    }

    run () {
        return new Promise((resolve, reject) => {
            this.getTrends()
        })
    }

    getTrends () {
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
                    const name = l.match(/data-trend-name="(.*?)"/)[1]
                    const id = l.match(/data-trends-id="(.*?)"/)[1]
                    const token = l.match(/data-trend-token="(.*?)"/)[1]
                    const src = l.match(/href="(.*?)"/)[1]
                    const totalTweet = l.match(/<div class="js-nav trend-item-stats js-ellipsis">(.*?)<\/div>/)[1]
                    const isKoma = totalTweet.indexOf(',') > -1
                    let tweets = parseInt(
                        totalTweet
                            .replace(/rb/i, '000')
                            .replace(/k/i, '000')
                            .replace('.', '')
                            .replace(',', '')
                            .replace(/ /g, '')
                    )
                    if (isKoma) tweets = tweets / 100
                    console.log({
                        name,
                        id,
                        token,
                        src,
                        tweet: {
                            original: totalTweet.trim(),
                            total: tweets
                        }
                    })
                }
                // writeFileSync(join(__dirname, '../dummy/twitter-trends.html'), list, {encoding: 'utf-8'})
            }
        })
    }
}

new TwitterTrends().run()