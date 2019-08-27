'use strict'

let components = {}

components['default'] = {
    logo: true,
    header: true,
    leftpanel: true,
    chats: true
}

module.exports = function (route = '') {
    const c = components[route] || components['default']
    return c
}