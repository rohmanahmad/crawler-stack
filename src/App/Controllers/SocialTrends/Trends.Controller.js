'use strict'

const TrendService = use('Services/TrendService')

const trendService = new TrendService()

class TrendsController {
    constructor () { }

    async index (req, res, next) {
        try {
            const {seo, assets, components} = req.resources
            const data = await trendService.getAllTrends(req.query)
            res.render('pages/homepage', {seo, data, assets, components})
        } catch (err) { next(err) }
    }

    dashboard (req, res, next) {
        try {
            const seo = req.seo
            res.render('pages/dashboard', {seo})
        } catch (err) {
            next(err)
        }
    }
}

module.exports = new TrendsController()