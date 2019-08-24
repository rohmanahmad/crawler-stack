'use strict'

const { MongoAdapter } = use('Libs/DbAdapter')
const database = new MongoAdapter()
    .setURI('MONGODB_URI_TRENDS')
    .models([
        'WebMetas'
    ])
    .setup()

class Seo {
    constructor () {
    }

    async handle (req, res, next) {
        try {
            // code here
            const data = await database.WebMetas.findOne({path: req.originalUrl})
            console.log(data)
            req.seo = data
            console.log('seo handle')
            next()
        } catch (err) { next(err) }
    }
}

module.exports = new Seo().handle