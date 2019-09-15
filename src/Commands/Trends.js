'use strict'

if (typeof use !== 'function') require('../App/Bootstrap')

const md5 = require('md5')
const { schedule } = require('node-cron')
const { MongoAdapter } = use('Libs/DbAdapter')
const TwitterTrend = use('Libs/Twitter/TwitterTrend')
const YoutubeTrend = use('Libs/Youtube/YoutubeTrend')
const GoogleTrend = use('Libs/Google/GoogleTrend')

class Trends {
    constructor () {
        this.db = new MongoAdapter()
            .setURI('MONGODB_URI_TRENDS')
            .models([
                'TwitterTrends',
                'YoutubeTrends',
                'GoogleTrends'
            ])
            .setup()
    }

    async run (args = {}) {
        try {
            const interval = args.interval || process.env.TRENDS_LOOP_INTERVAL || 15 * 60
            this
                .startOnce()
                .startWithTimer(parseInt(interval))
        } catch (err) { throw err }
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

    async startGoogle (config = {}, nloop = 0) {
        try {
            const ggTrends = new GoogleTrend(config)
            const data = await ggTrends.run()
            if (data) {
                let position = 1
                for (const raw of data) {
                    const data = {
                        source: 'google',
                        position,
                        date: raw.date,
                        tren_id: md5(raw.title),
                        text: raw.title,
                        post: {
                            count: raw.total,
                            images: [raw.image],
                            link: raw.source,
                            description: '',
                            published_at: raw.date,
                            likes: 0,
                            views: 0,
                            shares: 0
                        },
                        raw
                    }
                    await this.db
                        .GoogleTrends
                        .create(data)
                    position += 1
                }
            }
            console.log(`[google] Finish crawl #${nloop}`)
        } catch (err) { throw err }
    }

    startWithTimer (time = 60, nloop = 1) {
        console.log('start with timer', time, 's')
        schedule('0 * * * *', async () => { // every hour
            try {
                await this.startYoutube(nloop++)
            } catch (err) {
                console.log(err)
            }
        })
        schedule('0 * * * *', async () => {
            try {
                await this.startTwitter(nloop++)
            } catch (err) {
                console.log(err)
            }
        })
        schedule('0 20 * * *', async () => { // every at 20:00
            try {
                await this.startGoogle(nloop++)
            } catch (err) {
                console.log(err)
            }
        })
    }

    startOnce () {
        try {
            this.startTwitter()
                .catch(console.error)
            this.startYoutube()
                .catch(console.error)
            this.startGoogle({
                date: new Date(),
                geo: 'ID'
            })
                .catch(console.error)
            return this
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = Trends