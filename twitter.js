'use strict'

const Core = require('./Libs/twitter/Core')
const request = require('request')
const {writeFileSync, readFileSync} = require('fs')
const {result} = require('lodash')
const domain = 'https://twitter.com'
const url = `${domain}/search?`
class twitter extends Core {
    constructor(){
        super(Core)
        this
            .db_adapter
            .initMongoModels()
            .mongoModels(['Streams'])
        // initial mysql connection
        this
            .db_adapter
            .initMysql(['RippleClientKeyword'])
    }

    doSearching (options = {}) {
        return new Promise((resolve, reject) => {

            const {qsearch, keyid, client, include, exclude} = options
            const patch = `${Math.random()}`.substr(0, 5)
            const opt = {
                method: 'GET',
                url,
                headers: {},
                qs:{
                    'q':'indofood',
                    'src':'typd'
                }
            }
            let project = {
                id: keyid,
                client,
                keyword: qsearch,
                include,
                exclude
            }
            request(opt, (error, response, body) =>{
                if(error) console.log(error)
                let maxPosition = body.match(/data-max-position=\"(.*?)"/img)
                maxPosition = result(maxPosition, '[0]', '')
                    .replace('data-max-position="', '')
                    .replace('"', '')
                    
                    var options = { 
                        method: 'GET',
                        url: 'https://twitter.com/i/search/timeline',
                        qs: 
                            { vertical: 'default',
                            q: 'indomie',
                            src: 'typd',
                            include_available_features: '1',
                            include_entities: '1',
                            max_position: 'thGAVUV0VFVBYBFoLAup2TsMWSIBIYtAESY8LrAAAB9D-AYk3S8an8AAAAFBASgot8F6ACEBH5IZnWwAEQEon2_VdQABASeB2S1sABEBKlJ12WwAAQEnIUbtRgABAOTe1_FBACEBKbk0xVUAAQEpe3i5bgABASisCZ11ABEBKQS5zWwAYQEqisG5bgABASjTkll6AAEA-Uvb1XoAAQDwaUKVVQBBASSFobVCAAEBIobQuUIAEQEm0gE5eQABAOdi9IF7ABEA59pn7VUAAVAhUAFQAlAFUAFQAA',
                            reset_error_state: 'false' 
                            },
                    }
                    request(options, (error, response, body) =>{
                        try {
                            if (error) console.log(error)
                            body = JSON.parse(body)
                            const minPosition = body.min_position
                            body = body.items_html
                            body = body
                                .replace(/\&quot;/img, '"')
                                .replace(/\↵/g, ' ')
                                .replace(/ +/g, ' ')
                                .replace(/\&amp;/g, '&')
                                .replace(/\&nbsp;/, ' ')
                                .trim()
                            let  dataValue =  body.split('<li class="js-stream-item stream-item stream-item')
                            this.mapper.mapingDataStreams(dataValue ,project)
                            resolve()
                        } catch (err) {
                            console.log(err)
                            reject(err)
                        }
                    })
            })
        })
    }

    start (keyids = '') {
        const ids = []
        keyids = keyids.split(',')
        for (const id of keyids){
            ids.push(parseInt(id))
        }
        this.db_adapter.getClientKeyword(ids)
            .then(async (keywordData) =>{
                for(const key of keywordData){
                    const options = key.key_word
                        .split(',')
                        .map(x => x.trim())
                        .filter(x => x.length > 0)
                        .map(x => ({
                            qsearch: x,
                            keyid: key.keyId,
                            client: key.clientId,
                            include: key.KeyInclude,
                            exclude: key.KeyExclude
                        }))
                    for(const opt of options){
                        await this.doSearching(opt)
                    }
                }
                process.exit(0)
            })
            .catch(console.error)
    }
}

new twitter().start('55')