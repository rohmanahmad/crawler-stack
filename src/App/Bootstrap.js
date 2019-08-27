'use strict'

global.use = function (dep) {
    try {
        if (!dep || (dep && dep.length === 0)) throw new Error('Invalid Dependency')
        return require('./' + dep)
    } catch (err) {
        console.log(err)
    }
}