'use strict'

const modules = {}

modules['default'] = []

modules['/trendings'] = [
    '/js-modules/twitter-trend-chart.js'
]

module.exports = function (route = '') {
    const m = modules[route] || modules['default']
    return m
        .map(x => x + '?c=' + `${(new Date().getTime() / 9227374)}`.replace(/\./, '-'))
}