'use strict'

const SeoService = use('Services/SeoService')
const Services = new SeoService()

class Seo {
    constructor () {
    }

    async handle (req, res, next) {
        try {
            // code here
            if (!req.resources) req.resources = {}
            const data = await Services.getMetas(req.originalUrl)
            req.resources['seo'] = data
            next()
        } catch (err) { next(err) }
    }
}

module.exports = new Seo().handle