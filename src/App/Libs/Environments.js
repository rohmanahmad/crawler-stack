'use strict'

exports.getEnv = function (d, def = null) {
    return process.env[d] || def
}