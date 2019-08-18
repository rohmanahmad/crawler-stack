'use strict'

require('dotenv').config()

exports.getEnv = function (d, def = null) {
    return process.env[d] || def
}