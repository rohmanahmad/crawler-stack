'use strict'

const TrendService = use('Services/TrendService')

const trendService = new TrendService()

class TrendsController {
    constructor () { }

    async index (req, res, next) {
        try {
            const {seo, assets, components} = req.resources
            const data = await trendService.getAllTrends(req.query)
            res.render('pages/landingpage', {seo, data, assets, components})
        } catch (err) { next(err) }
    }

    async trendings (req, res, next) {
        try {
            const {seo, assets, components, modules} = req.resources
            const data = await trendService.getAllTrendsData(req.query)
            res.render('pages/trendings', {seo, data, assets, modules, components})
        } catch (err) {
            next(err)
        }
    }

    async dashboard (req, res, next) {
        try {
            const {seo, assets, components} = req.resources
            const data = await trendService.getAllTrends(req.query)
            res.render('pages/dashboard', {seo, data, assets, components})
        } catch (err) {
            next(err)
        }
    }
}

module.exports = new TrendsController()