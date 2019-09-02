'use strict'

let components = {}

components['default'] = {
    logo: true,
    header: {
        main: true,
        search: true,
        chats: true,
        account: true
    },
    leftpanel: true,
    body: {
        title: true,
        content: true
    }
}
components['/trendings'] = {
    logo: true,
    header: {
        main: true,
        search: false,
        chats: false,
        account: false,
        rightnav: true
    },
    leftpanel: false,
    body: {
        title: false,
        content: true
    }
}
components['/dashboard'] = {
    logo: true,
    header: {
        main: true,
        search: true,
        chats: true,
        account: true
    },
    leftpanel: true,
    body: {
        title: true,
        content: true
    }
}

module.exports = function (route = '') {
    const c = components[route] || components['default']
    return c
}