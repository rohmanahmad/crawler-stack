'use strict'

const AssetsData = use('Data/AssetsData')
const ComponentsData = use('Data/ComponentsData')
const ModulesData = use('Data/ModulesData')

function getAssets (route = '/') {
    try {
        return AssetsData(route)
    } catch (err) { throw err }
}

function getComponents (route = '/') {
    try {
        return ComponentsData(route)
    } catch (err) { throw err }
}

function getModules (route = '/') {
    return ModulesData(route)
}

class AssetsManager {
    constructor () {  }
    handle (req, res, next) {
        try {
            if (!req.resources) req.resources = {}
            req.resources['assets'] = getAssets(req.originalUrl)
            req.resources['components'] = getComponents(req.originalUrl)
            req.resources['modules'] = getModules(req.originalUrl)
            next()
        } catch (err) { next(err) }
    }
}

module.exports = new AssetsManager().handle