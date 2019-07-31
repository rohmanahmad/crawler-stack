'use strict'

const TimeConverter = require('./TimeConverter')
const YoutubeComments = require('./YoutubeComments')
const RequestOptions = require('./RequestOptions')
const DbAdapter = require('./DbAdapter')

class Core {
    constructor () {
        this.time_converter = TimeConverter
        this.db_adapter = DbAdapter
        this.req_options = RequestOptions
        this.comments = YoutubeComments
    }
}

module.exports = Core
