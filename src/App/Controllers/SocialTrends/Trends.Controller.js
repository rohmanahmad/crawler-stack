'use strict'

const { MongoAdapter } = use('Libs/DbAdapter')

const database = new MongoAdapter()
    .setURI('MONGODB_URI_TRENDS')
    .models([
        'TwitterTrends'
    ])
    .setup()

class TrendsController {
    constructor () {
        this.db = database
    }

    dashboard (req, res, next) {
        try {
            const seo = req.seo || []
            res.render('pages/dashboard', {seo})
        } catch (err) {
            next(err)
        }
    }
}

module.exports = new TrendsController()