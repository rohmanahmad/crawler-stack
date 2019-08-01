'use strict'

const mongoose = require('mongoose')
const {result, transform} = require('lodash')

const Schema = mongoose.Schema

const StreamsSchema = new Schema({
    hashuniqeid: String,
    stream_id: String,
    source: String,
    date: Date,
    text: String,
    user: {
        id: String,
        name: String,
        real_name: String,
        avatar: String
    },
    type: String,
    timestamp: Date,
    image: String,
    title: String,
    keyword: Number,
    client: Number,
    brand: Number,
    service: String,
    is_trash: Number,
    sentiment: {
        status: Boolean,
        value: Number
    },
    query: String
})

StreamsSchema.statics = {
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

mongoose.model('Streams', StreamsSchema, 'streams')
