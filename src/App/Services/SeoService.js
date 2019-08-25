'use strict'

const { MongoAdapter } = use('Libs/DbAdapter')
const database = new MongoAdapter()
    .setURI('MONGODB_URI_TRENDS')
    .models([
        'WebMetas'
    ])
    .setup()

class SeoService {
    construtor (path) { this.path = path }
    setPath (path) { this.path = path }
    async getMetas(path) {
        path = path || this.path
        return database.WebMetas.findOne({path})
    }
}

module.exports = SeoService