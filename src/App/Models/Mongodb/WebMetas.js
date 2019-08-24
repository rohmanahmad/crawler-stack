'use strict'

const mongoose = require('mongoose')
const {result, transform} = require('lodash')

const Schema = mongoose.Schema

const CurrentSchema = new Schema({
    path: String,
    name: Date,
    title: String,
    metas: []
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

mongoose.model('WebMetas', CurrentSchema, 'web_metas')
