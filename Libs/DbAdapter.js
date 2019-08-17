'use strict'

const {result} = require('lodash')
const {join} = require('path')
const {readFileSync, readdirSync} = require('fs')
const mongoose = require('mongoose')
const Sequelize = require('sequelize')

const mongoModels = join(__dirname, '../Models/Mongodb')
const mysqlModels = join(__dirname, '../Models/Mysql')

mongoose.connection
    .on('error', console.log)
    .on('disconnected', connectMongo)
    .on('connected', () => console.log('open connection'))

function connectMongo () {
    return mongoose.connect('mongodb://localhost:27018/ripple10', { keepAlive: 1, useNewUrlParser: true })
}

function connectMysql (models) {
    console.log('connecting to mysql server...')
    // mysql://root:punt3n123@localhost:3306/r10
    const sequel = new Sequelize('mysql://root:punt3n123@localhost:3306/r10')
    let m = {}
    readdirSync(mysqlModels)
        .filter(file => ~file.search(/^[^.].*.js$/))
        .forEach(file => {
            const name = file.replace('.js', '')
            if (models.indexOf(name) > -1) {
                const sc = require(join(mysqlModels, file))
                m[name] = sequel.define(
                    sc.table,
                    sc.schema,
                    {
                        timestamps: false,
                        freezeTableName: true // Model tableName will be the same as the model name
                    })
            }
        })
    return m
}

const adapter = {
    initMongoModels() {
        readdirSync(mongoModels)
            .filter(file => ~file.search(/^[^.].*.js$/))
            .forEach(file => require(join(mongoModels, file)))
        // try connecting to mongodb via mongoosejs
        connectMongo()
        return this
    },
    mongoModels (models = []) {
        this.mongomodels = []
        for (const m of models) {
            this.mongoModels[m] = mongoose.model(m)
        }
    },
    initMysql (models = []) {
        if (models.length < 1) throw new Error('need models definition atlease 1 model')
        this.mysqlModel = connectMysql(models)
    },
    saveStreamToCollection (streamdata = []) {
        return new Promise((resolve, reject) => {
            console.log('save colections')
            if (streamdata.length <= 0) return resolve()
            const query = result(streamdata, '[0].query', '')
            const keyword = result(streamdata, '[0].keyword', '')
            const logger = `[${keyword}: ${query}]`
            this.mongoModels.Streams
                .bulkupsert([
                    'hashuniqeid',
                    'keyword',
                    'client',
                    'service'
                ], streamdata)
                .then((r) => {
                    console.log(`${logger}: ${result(r, 'result.nUpserted', '')} new record from ${streamdata.length} results`)
                    resolve(r)
                })
                .catch((e) => {
                    // console.log(e)
                    reject(e)
                })
        })
    },
    getClientKeyword (keyids = []) {
        return new Promise((resolve, reject) => {
            this
                .mysqlModel
                .RippleClientKeyword
                .findAll({
                    where: {
                        'keyId': keyids
                    }
                })
                .then(r => resolve(r.map(x => x.dataValues)))
                .catch(reject)
        })
    }
}

module.exports = adapter

// testing
// let streams = readFileSync(join(__dirname, '../dummy/streams.json'), {encoding: 'utf-8'})
// streams = JSON.parse(streams)
// // connecting and mapping models
// adapter.initMongoModels().mongoModels(['Streams'])
// // saving data to collection
// adapter.saveStreamToCollection(streams)
// // connecting to mysql server
// adapter.initMysql()
// adapter.getClientKeyword([820, 80])
//     .then(console.log)
//     .catch(console.error)