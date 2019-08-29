'use strict'

if (typeof use !== 'function') require('../../Bootstrap')

const DataMapper = use('App/Libs/Twitter/MappingData')
const DbAdapter = use('App/Libs/DbAdapter')

class R10TwitterPostExample {
    constructor () {
        this.mapper = new DataMapper
        this.db_adapter = DbAdapter
    }
    async handle (args = {}) {
        try {
            // 
        } catch (err) { throw err }
    }
}

// running app R10TwitterPostExample
new R10TwitterPostExample()
    .handle()
        .then(console.log)
        .catch(console.error)