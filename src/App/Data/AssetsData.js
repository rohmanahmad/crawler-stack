'use strict'

const cssBracketDefault = [
    '/bootstrap/css/bootstrap.min.css',
    '/css/bracket.css',
    '/css/bracket.oreo.min.css',
    'fontawesome/css/all.min.css',
    'ionicons/css/ionicons.min.css'
]
const customTrendStyle = [
    '/css/trend-style.css'
]
const jsBracketDefault = [
    '/perfect-scrollbar/perfect-scrollbar.min.js',
    '/jquery/jquery.min.js',
    '/moment/min/moment.min.js',
    '/bootstrap/js/bootstrap.min.js',
    '/scripts/bracket.js'
]

let AssetsData = {}

AssetsData['default'] = {
    theme: 'bracket',
    css: cssBracketDefault,
    js: jsBracketDefault
}

AssetsData['/trendings'] = {
    theme: 'bracket',
    css: [
        ...cssBracketDefault,
        ...customTrendStyle,
        // '/morris.js/morris.css',
        '/chartjs/Chart.min.css'
    ],
    js: [
        ...jsBracketDefault,
        // '/morris.js/morris.min.js',
        '/chartjs/Chart.bundle.min.js'
    ]
}

module.exports = function (route = '') {
    const assets = AssetsData[route] || AssetsData['default']
    return assets
}