'use strict'

const mongoose = require('mongoose')
const {result, transform} = require('lodash')

const Schema = mongoose.Schema

const CurrentSchema = new Schema({
    source: String,
    position: Number,
    date: Date,
    date_detail: {},
    tren_id: String,
    text: String,
    post: {
        count: Number,
        images: [],
        link: String,
        description: String,
        published_at: Date,
        likes: Number,
        views: Number,
        shares: Number
    },
    raw: {}
})

CurrentSchema.statics = {
    bulkupsert: function (criteria = [], data = {}) {
        return new Promise((resolve, reject) => {
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
        })
    }
}

mongoose.model('TwitterTrends', CurrentSchema, 'trends_data')
