'use strict'

const mongoose = require('mongoose')
const {result, transform} = require('lodash')

const Schema = mongoose.Schema

const MySchema = new Schema({
    country_id: String,
    country_name: String,
    country_slug: String,
    created_at: Date,
    updated_at: Date
})

MySchema.statics = {
    bulkupsert: function (criteria = [], data = {}) {
        return new Promise((resolve, reject) => {
            // mongoose.connection
            //     .on('open', () => {
            if (data.length <= 0) return resolve()
            const bulk = this.collection.initializeUnorderedBulkOp()
            for (const d of data) {
                const c = transform(criteria, (r, x) => {
                    r[x] = result(d, x)
                    return r
                }, {})
                bulk
                    .find(c)
                    .upsert()
                    .updateOne({
                        $setOnInsert: d
                    })
            }
            bulk.execute((e, r) => {
                if (e) {
                    console.log(e)
                    return reject(e)
                }
                resolve(r)
            })
                // })
        })
    }
}

mongoose.model('InstagramLocationCountries', MySchema, 'ig_location_countries')
