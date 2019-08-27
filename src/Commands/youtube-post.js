'use strict'

require('../App/Bootstrap')
const request = require('request')
const md5 = require('md5')
const {result, map , each} = require('lodash')
const {writeFileSync} = require('fs')
const Core = use('App/Libs/youtube/Core')
const Filter = use('App/Libs/StreamFilter')

const domain = 'https://www.youtube.com'
const url = `${domain}/results`
const qconfig = 'CAISBAgCEAE%253D'

let firstResultId = ''
// let dataAllJson = []
// https://stackoverflow.com/questions/9768444/possible-eventemitter-memory-leak-detected/26176922
process.setMaxListeners(0)

class App extends Core {
    constructor () {
        super(Core)
        // initial mongo connection
        this
            .db_adapter
            .initMongoModels()
            .mongoModels(['Streams'])
        // initial mysql connection
        this
            .db_adapter
            .initMysql(['RippleClientKeyword'])
    }

    async generateContentStream (content = [], project = {}) {
        if (content.length <= 0) {
            return null
        }
        let unFilteredStreams = []
        let vd = {}
        for (const d of content) {
            // if (d < 5) writeFileSync(`/tmp/data${d}.txt`, JSON.stringify(content[d]), {encoding: 'utf-8'})
            const {
                videoId,
                thumbnail,
                title,
                ownerText,
                publishedTimeText,
                descriptionSnippet
            } = d.videoRenderer || {}
            if (videoId) {
                const keyword = parseInt(project.id)
                const client = parseInt(project.client)
                const uniqid = md5(videoId + keyword)
                const titleText = result(title, 'runs[0].text', '')
                let text = titleText + ' - ' + result(descriptionSnippet, 'runs', [])
                    .map(t => t.text)
                    .join(' ')
                const owner = result(ownerText, 'runs[0]', {})
                const realname = result(owner, 'text', `Youtube User (${videoId})`)
                const userid = result(owner, 'browseEndpoint.browseId', `ytb_${videoId}`)
                const image = result(thumbnail, 'thumbnails[0].url', '')
                const publishDate = result(publishedTimeText, 'simpleText', '')
                const data = {
                    hashuniqeid: uniqid,
                    stream_id: uniqid,
                    source: `${domain}/watch?v=${videoId}`,
                    date: this.time_converter.getDate(publishDate),
                    text: text.trim(),
                    user: {
                        id: userid,
                        name: realname,
                        real_name: realname,
                        avatar: ''
                    },
                    type: 'post',
                    timestamp: new Date(),
                    image,
                    title: titleText.trim(),
                    keyword,
                    client,
                    brand: 0,
                    is_trash: 0,
                    service: 'youtube',
                    sentiment: {
                        status: false,
                        value: 0
                    },
                    query: project.keyword || ''
                }
                unFilteredStreams.push(data)
                vd[data.stream_id] = videoId
            } else {
                console.log(d.videoRenderer)
            }
        }
        const {keyword, include, exclude} = project
        const streams = await new Filter({
            key_in: include,
            key_ex: exclude,
            keyword: [keyword]
        })
            .filter(unFilteredStreams)
        const videos = streams.map(x => ({id: vd[x.stream_id], parent: {id: x.stream_id, text: x.text}}))
        console.log('...[filter]', streams.length, 'data')
        return {streams, videos}
    }
    
    getNextPage(args = {}) {
        console.log('getting next page....')
        return new Promise((resolve, reject) => {
            try {
                const {query, patch, project} = args
                const requestOptions = this.req_options.getReqOptions(args)
                request(requestOptions, async (err, res, resBody) => {
                    if (err) console.log(err)
                    const JsonBody = JSON.parse(resBody)
                    const itemBody = result(JsonBody, '[1].response.continuationContents.itemSectionContinuation', {})
                    const contentBody = result(itemBody, 'contents')
                    const continueToken = result(itemBody, 'continuations[0].nextContinuationData.continuation', '')
                    // mapping all content to stream schema
                    const {streams, videos} = await this.generateContentStream(contentBody, project)
                    // save data to collection "streams"
                    this.db_adapter.saveStreamToCollection(streams).then()
                    // get comments from main post
                    this.comments.getComments(videos, {patch, project})
                        .then((comments) => {
                            console.log(`[finish] : count ${comments.length} row`)
                            this.db_adapter.saveStreamToCollection(comments).then()
                            // dataAllJson = dataAllJson.concat(streams, comments)
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                    resolve({
                        cToken: continueToken,
                        sToken: result(JsonBody, '[1].xsrf_token'),
                        query,
                        patch,
                        hasNext: (continueToken.length > 0)
                    })
                })
            } catch (err) {
                reject(err)
            }
        })
    }

    getFirstPage (args = {}){
        console.log('getting first page...')
        return new Promise((resolve, reject) => {
            try {
                const {query, patch, project} = args
                const reqOtps = this.req_options.getReqOptions(args)
                request(reqOtps, async (err, res, resBody) => {
                    if (err) console.log(err)
                    const JsonBody = JSON.parse(resBody)
                    const itemBody = result(JsonBody, '[1].response.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer', {})
                    const contentBody = result(itemBody, 'contents')
                    const continueToken = result(itemBody, 'continuations[0].nextContinuationData.continuation', '')
                    // mapping all content to stream schema
                    const {streams, videos} = await this.generateContentStream(contentBody, project)
                    // save data to collection "streams"
                    this.db_adapter.saveStreamToCollection(streams).then()
                    // get comments from main post
                    this.comments.getComments(videos, {patch, project})
                        .then((comments) => {
                            console.log(`[finish] : count ${comments.length} row`)
                            this.db_adapter.saveStreamToCollection(comments).then()
                            // dataAllJson = dataAllJson.concat(streams, comments)
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                    // return imediately
                    resolve({
                        cToken: continueToken,
                        sToken: result(JsonBody, '[1].xsrf_token'),
                        query,
                        patch,
                        hasNext: (continueToken.length > 0)
                    })
                })
            } catch (err) {
                reject(err)
            }
        })
    }

    sleep (timeout = 10) {
        return new Promise((resolve) => {
            console.log('do sleep...')
            setTimeout(resolve, timeout * 1000)
        })
    }

    doSearching (options = {}) {
        return new Promise((resolve, reject) => {
            const {qsearch, keyid, client, include, exclude} = options
            const patch = this.req_options.randomPatch()
            const opt = {
                method: 'GET',
                url,
                qs: {
                    search_query: qsearch,
                    sp: qconfig,
                },
                headers: {
                    'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3774${patch} Safari/537.36`,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3'
                }
            };
            console.log(`[search]: searching keyword (${keyid}: ${qsearch})`)
            request(opt, (error, response, body) =>{
                try {
                    if (error) throw new Error(error)
                    let continueToken = body.match(/"continuation":"(.*?)"/img)
                    let sessionToken = body.match(/"XSRF_TOKEN":"(.*?)"/img) // xsrf
                    // writeFileSync('/tmp/text-html.html', body, {encode: 'utf-8'})
                    if (!sessionToken || !continueToken) {
                        throw new Error('Invalid Session or Continue Token!')
                    }
                    continueToken = result(continueToken, '[0]', '')
                        .replace('"continuation":"', '')
                        .replace('"', '')
                    sessionToken = result(sessionToken, '[0]', '')
                        .replace('"XSRF_TOKEN":"', '')
                        .replace('"', '')
        
                    // ambil data 20 pertama di pencarian
                    const firstArgs = {
                        project: {
                            id: keyid,
                            client,
                            keyword: qsearch,
                            include,
                            exclude
                        },
                        cToken: '',
                        sToken: sessionToken,
                        query: qsearch,
                        patch
                    }
    
                    this.getFirstPage(firstArgs)
                        .then(async (res) => {
                            let {hasNext, cToken, sToken, query, patch} = res;
                            while(hasNext) {
                                try {
                                    const nextArgs = {
                                        cToken,
                                        sToken,
                                        query,
                                        patch,
                                        project: {
                                            id: keyid,
                                            client,
                                            keyword: query,
                                            include,
                                            exclude
                                        }
                                    }
                                    await this.sleep(10)
                                    const next = await this.getNextPage(nextArgs)
                                    hasNext = next.hasNext
                                    cToken = next.cToken
                                    sToken = next.sToken
                                } catch (err) {
                                    console.log(err)
                                }
                            }
                            await this.sleep(10)
                            resolve()
                            // writeFileSync('/tmp/allstreams.json', JSON.stringify(dataAllJson), {encoding: 'utf-8'})
                        })
                        .catch((err) => {throw err})
                } catch (err) {
                    reject(err)
                }
            });
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

new App().start('55')