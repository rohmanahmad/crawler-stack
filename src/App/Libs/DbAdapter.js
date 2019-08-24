'use strict'

const {result} = require('lodash')
const {join} = require('path')
const {readFileSync, readdirSync} = require('fs')
const mongoose = require('mongoose')
const Sequelize = require('sequelize')
const { getEnv } = require('./Environments')

const mongoModels = join(__dirname, '../Models/Mongodb')
const mysqlModels = join(__dirname, '../Models/Mysql')

class Adapter {
    /* 
    * models (Array)
    *  - optionals : if not, all models are included
    */
    models (models = []) {
        this.models = models
        return this
    }
    /* 
    * URI (String)
    *  - MONGODB_URI_TRENDS
    *  - MONGODB_URI_RIPPLE10
    *  - MYSQL_URI_RIPPLE10
    */
    setURI (URI = '') {
        if (URI.length <= 0) throw new Error('URI include db_uri')
        this.currentURI = getEnv(URI)
        return this
    }
    setup () {
        if (!this.connectionType) throw new Error('TYPE must "mongo" or "mysql", please add .setConnection([TYPE]) before .setup()')
        if (!this.currentURI) throw new Error('Invalid CURRENT_URI, please add .setURI([CURRENT_URI]) before .setup()')
        if (this.connectionType === 'mongo') return this.setupMongoModels()
        if (this.connectionType === 'mysql') return this.mysqlSetup()
    }
}

class MongoAdapter extends Adapter {
    constructor () {
        super()
        this.connectionType = 'mongo'
    }

    checkConnection () {
        console.log('listening mongo connection')
        if (mongoose.connection.readyState === 0) this.mongoConnect()
        mongoose.connection
            .on('error', (err) => console.error(err))
            .on('disconnected', e => {
                console.log('mongo disconnected!')
                this.mongoConnect()
            })
            .on('close', e => {
                console.log('mongo closed!')
                this.mongoConnect()
            })
            .on('connected', () => console.log('open connection'))
    }

    mongoConnect () {
        console.log('connecting to MongoDB server:', this.currentURI)
        mongoose
            .connect(this.currentURI, { keepAlive: 1, useNewUrlParser: true })
            .catch(console.error)
    }

    setupMongoModels() {
        console.log('setting up mongodb models')
        let m = {}
        readdirSync(mongoModels)
            .filter(file => ~file.search(/^[^.].*.js$/))
            .filter(file => {
                if (this.models.length > 0) {
                    const filename = file.replace('.js', '')
                    return this.models.indexOf(filename) > -1
                }
                return true
            })
            .forEach(file => {
                require(join(mongoModels, file))
                const filename = file.replace('.js', '')
                m[filename] = mongoose.model(filename)
            })
        // try connecting to mongodb via mongoosejs
        this.checkConnection()
        return m
    }
}

class MysqlAdapter extends Adapter {
    constructor () {
        super()
        this.connectionType = 'mysql'
    }
    mysqlSetup () {
        console.log('connecting to mysql server...')
        const sequel = new Sequelize(getEnv(this.mysqlURI))
        let m = {}
        readdirSync(mysqlModels)
            .filter(file => ~file.search(/^[^.].*.js$/))
            .filter(file => {
                if (this.models.length > 0) {
                    const filename = file.replace('.js', '')
                    return this.models.indexOf(filename) > -1
                }
                return true
            })
            .forEach(file => {
                const name = file.replace('.js', '')
                const sc = require(join(mysqlModels, file))
                m[name] = sequel.define(
                    sc.table,
                    sc.schema,
                    {
                        timestamps: false,
                        freezeTableName: true // Model tableName will be the same as the model name
                    })
            })
        return m
    }
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

module.exports = {
    MongoAdapter,
    MysqlAdapter
}