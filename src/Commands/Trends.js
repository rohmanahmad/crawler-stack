'use strict'

if (typeof use !== 'function') require('../App/Bootstrap')

const { MongoAdapter } = use('Libs/DbAdapter')
const TwitterTrend = use('Libs/Twitter/TwitterTrend')
const YoutubeTrend = use('Libs/Youtube/YoutubeTrend')

class Trends {
    constructor () {
        this.db = new MongoAdapter()
            .setURI('MONGODB_URI_TRENDS')
            .models([
                'TwitterTrends',
                'YoutubeTrends'
            ])
            .setup()
    }

    async startTwitter (nloop = 0) {
        try {
            const twTrends = new TwitterTrend()
            const data = await twTrends.run()
            for (const row of data) {
                await this.db
                    .TwitterTrends
                    .create(row)
            }
            console.log(`[twitter] Finish crawl #${nloop}`)
        } catch (err) { throw err }
    }

    async startYoutube (nloop = 0) {
        try {
            const ytTrends = new YoutubeTrend()
            const data = await ytTrends.run()
            for (const row of data) {
                await this.db
                    .YoutubeTrends
                    .create(row)
            }
            console.log(`[youtube] Finish crawl #${nloop}`)
        } catch (err) { throw err }
    }

    startWithTimer (time = 60, nloop = 1) {
        console.log('start with timer', time, 's')
        setInterval(async () => {
            try {
                await this.startTwitter(nloop++)
                await this.startYoutube(nloop++)
            } catch (err) {
                console.log(err)
            }
        }, time * 1000)
    }

    startOnce () {
        try {
            this.startTwitter()
                .catch(console.error)
            this.startYoutube()
                .catch(console.error)
            return this
        } catch (err) {
            console.log(err)
        }
    }
}

new Trends()
    .startOnce()
    .startWithTimer(parseInt(process.env.TRENDS_LOOP_INTERVAL || 15 * 60))