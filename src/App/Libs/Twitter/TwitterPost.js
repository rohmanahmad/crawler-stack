'use strict'

if (typeof use !== 'function') require('../../Bootstrap')

const request = require('request')
const { result } = require('lodash')
const domain = 'https://twitter.com'
const url = `${domain}/search?`

class TwitterPost {
    constructor (config = {}) {
        super()

        this.keyids = config['keyids']
        this.since = config['since'] ? 'since:' + config['since'] : ''
        this.until = config['until'] ? 'until:' + config['until'] : ''

        /* this
            .db_adapter
            .initMongoModels()
            .mongoModels(['Streams'])
        // initial mysql connection
        this
            .db_adapter
            .initMysql(['RippleClientKeyword']) */
    }

    run () {
        const keyids = this.keyids.split(',')
        const ids = keyids.map(x => parseInt(x)).filter(x => x > 0)
        this.db_adapter.getClientKeyword(ids)
            .then(async (keywordData) =>{
                for(const key of keywordData){
                    const options = key.key_word
                        .split(',')
                        .map(x => x.trim())
                        .filter(x => x.length > 0)
                        .map(x => ({
                            keyword: x,
                            qsearch: [
                                x,
                                this.since,
                                this.until
                            ].join(' '),
                            keyid: key.keyId,
                            client: key.clientId,
                            include: key.KeyInclude,
                            exclude: key.KeyExclude
                        }))
                    for(const opt of options){
                        console.log(opt)
                        await this.doSearching(opt)
                    }
                }
                process.exit(0)
            })
            .catch(console.error)
    }

    options (maxPosition = '' , qsearch = '', value = ''){
        const options = { 
            method: 'GET',
            url: 'https://twitter.com/i/search/timeline',
            qs: 
                { vertical: 'default',
                q: `${qsearch}`,
                src: 'typd',
                include_available_features: '1',
                include_entities: '1',
                // max_position: `${maxPosition}`,
                reset_error_state: 'false' ,
                latent_count: 362
                },
        }

        if(value === 'max'){
            options.qs.max_position = `${maxPosition}`
            // options.qs.min_position =``
        } else {
            options.qs.min_position =`${maxPosition}`
            // options.qs.max_position = ``
        }

        return options
    }

    nextPage (project = {} , minPosition = '') {
        return new Promise((resolve, reject) => {
            console.log('getting Next Post...')
            const {keyword : qsearch, keyid, client, include, exclude} = project
            let options = this.options (minPosition , qsearch)
            request(options, async (error, response, body) =>{
                console.log('next page')
                try {
                    if (error) console.log(error)
                    body = JSON.parse(body)
                    const maxPosition = body.max_position
                    body = body.items_html
                    body = body
                        .replace(/\&quot;/img, '"')
                        .replace(/\↵/g, ' ')
                        .replace(/ +/g, ' ')
                        .replace(/\&amp;/g, '&')
                        .replace(/\&nbsp;/, ' ')
                        .trim()
                    let  dataValue =  body.split('<li class="js-stream-item stream-item stream-item')
                    const dataTwitter = await this.mapper.mappingDataStreams(dataValue ,project)
                    console.log({maxPosition})
                    this.db_adapter.saveStreamToCollection(dataTwitter).then()
                    if(maxPosition){
                        await this.nextPage(project, maxPosition)
                    }
                    resolve()
                } catch (err){
                    console.log(err)
                    reject(err)
                }
            })

        })
    }

    doSearching (options = {}) {
        return new Promise((resolve, reject) => {
            console.log('getting Post...')
            const {qsearch, keyid, client, include, exclude, keyword} = options
            const patch = `${Math.random()}`.substr(0, 5)
            const opt = {
                method: 'GET',
                url,
                headers: {},
                qs:{
                    'q': encodeURI(qsearch),
                    'src':'typd'
                }
            }
            let project = {
                id: keyid,
                client,
                keyword,
                include,
                exclude
            }
            request(opt, (error, response, body) =>{
                if(error) console.log(error)
                let maxPosition = body.match(/data-max-position=\"(.*?)"/img)
                maxPosition = result(maxPosition, '[0]', '')
                    .replace('data-max-position="', '')
                    .replace('"', '')

                   let options = this.options (maxPosition , qsearch , 'max')
                    request(options, async (error, response, body) => {
                        try {
                            if (error) console.log(error)
                            body = JSON.parse(body)
                            const minPosition = body.min_position
                            body = body.items_html
                            body = body
                                .replace(/\&quot;/img, '"')
                                .replace(/\↵/g, ' ')
                                .replace(/\n/g, ' ')
                                .replace(/ +/g, ' ')
                                .replace(/\&amp;/g, '&')
                                .replace(/\&nbsp;/, ' ')
                                .trim()

                            let  dataValue =  body.split('<li class="js-stream-item stream-item stream-item')
                            console.log(`total Post ${dataValue.length}`)      
                            const dataTwitter = await this.mapper.mappingDataStreams(dataValue ,project)
                            this.db_adapter.saveStreamToCollection(dataTwitter).then((r) => {
                                console.log(r)
                            }).catch(console.log)
                            if(minPosition){
                               await this.nextPage(project, minPosition)
                            }
                            resolve()
                        } catch (err) {
                            console.log(err)
                            reject(err)
                        }
                    })
            })
        })
    }

    setQuery(config = {}) {
        this.keyids = config['keyids']
        this.since = config['since'] ? 'since:' + config['since'] : ''
        this.until = config['until'] ? 'until:' + config['until'] : ''
        return this
    }
}

module.exports = TwitterPost

new twitter().setQuery({
    keyids: '55',
    since: '2019-07-01',
    until: '2019-07-05'
}).start()