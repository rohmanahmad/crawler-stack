'use strict'

const modules = {}

modules['default'] = []

module.exports = function () {
    const m = modules[route] || modules['default']
    return m
}