'use strict'

const Sequelize = require('sequelize')

exports.table = 'ripple_client_keyword'
exports.schema = {
    keyId: {
        type: Sequelize.NUMBER,
        field: 'key_id',
        primaryKey: true
    },
    key_word: {
        type: Sequelize.STRING,
        field: 'key_word'
    },
    KeyInclude: {
        type: Sequelize.STRING,
        field: 'key_word_in'
    },
    KeyExclude: {
        type: Sequelize.STRING,
        field: 'key_word_not'
    },
    isTrash: {
        type: Sequelize.NUMBER,
        field: 'is_trash'
    },
    clientId: {
        type: Sequelize.NUMBER,
        field: 'key_client_id'
    }
}