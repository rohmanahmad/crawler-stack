'use strict'

const modules = {}

modules['default'] = []

module.exports = function (route = '') {
    const m = modules[route] || modules['default']
    return m
}