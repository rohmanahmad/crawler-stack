'use strict'

const mongoose = require('mongoose')
const {result, transform} = require('lodash')

const Schema = mongoose.Schema

const CurrentSchema = new Schema({
    group: String,
    uniqId: String,
    url: String,
    title: String,
    level: Number,
    user_crawled: Boolean,
    last_crawled_at: Date,
    created_at: Date,
    updated_at: Date
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

mongoose.model('TwProfileGroups', CurrentSchema, 'twitter_profile_groups')
