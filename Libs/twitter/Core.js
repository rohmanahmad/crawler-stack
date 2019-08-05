'use strict'

const MappingData = require('./MappingData')
const DbAdapter = require('../DbAdapter')
class Core {
    constructor () {
        this.mapper = new MappingData
        this.db_adapter = DbAdapter
    }
}

module.exports = Core
