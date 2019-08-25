'use strict'

function getAssets () {
    try {
        return {
            theme: 'bracket',
            css: [
                '/bootstrap/css/bootstrap.min.css',
                '/css/bracket.css',
                '/css/bracket.oreo.min.css',
                'fontawesome/css/all.min.css',
                'ionicons/css/ionicons.min.css'
            ],
            js: [
                '/perfect-scrollbar/perfect-scrollbar.min.js',
                '/jquery/jquery.min.js',
                '/moment/min/moment.min.js',
                '/bootstrap/js/bootstrap.min.js',
                '/scripts/bracket.js'
            ]
        }
    } catch (err) { throw err }
}

function getComponents () {
    try {
        return {
            logo: true,
            header: true,
            leftpanel: true,
            chats: true
        }
    } catch (err) { throw err }
}

class AssetsManager {
    constructor () {  }
    handle (req, res, next) {
        try {
            if (!req.resources) req.resources = {}
            req.resources['assets'] = getAssets()
            req.resources['components'] = getComponents()
            next()
        } catch (err) { next(err) }
    }
}

module.exports = new AssetsManager().handle