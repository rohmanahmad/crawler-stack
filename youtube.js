const request = require('request')
const md5 = require('md5')
const {result, map , each} = require('lodash')
const {writeFileSync} = require('fs')
const Core = require('./Libs/Core')

const domain = 'https://www.youtube.com'
const url = `${domain}/results`
const qconfig = 'CAISBAgCEAE%253D'

let firstResultId = ''
let dataAllJson = []

class App extends Core {
    constructor () {
        super(Core)
    }

    generateContentStream (content = [], project = {}) {
        if (content.length <= 0) {
            return null
        }
        let streams = []
        let videos = []
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
                    service: 'youtube',
                    sentiment: {
                        status: false,
                        value: 0
                    },
                    query: project.keyword || ''
                }
                streams.push(data)
                videos.push({id: videoId, parent: {id: data.stream_id, text: data.text}})
            } else {
                console.log(d.videoRenderer)
            }
        }
    
        // console.log({streams})
        return {streams, videos}
    }
    
    getNextPage(args = {}) {
        console.log('getting next page....')
        return new Promise((resolve, reject) => {
            try {
                const {query, patch, project} = args
                const requestOptions = this.req_options.getReqOptions(args)
                request(requestOptions, (err, res, resBody) => {
                    if (err) console.log(err)
                    const JsonBody = JSON.parse(resBody)
                    const itemBody = result(JsonBody, '[1].response.continuationContents.itemSectionContinuation', {})
                    const contentBody = result(itemBody, 'contents')
                    const continueToken = result(itemBody, 'continuations[0].nextContinuationData.continuation', '')
                    // mapping all content to stream schema
                    const {streams, videos} = this.generateContentStream(contentBody, project)
                    // save data to collection "streams"
                    this.db_adapter.saveStreamToCollection(streams).then()
                    // get comments from main post
                    this.comments.getComments(videos, {patch, project})
                        .then((comments) => {
                            console.log(`[finish] : count ${comments.length} row`)
                            this.db_adapter.saveStreamToCollection(comments).then()
                            dataAllJson = dataAllJson.concat(streams, comments)
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
                request(reqOtps, (err, res, resBody) => {
                    if (err) console.log(err)
                    const JsonBody = JSON.parse(resBody)
                    const itemBody = result(JsonBody, '[1].response.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer', {})
                    const contentBody = result(itemBody, 'contents')
                    const continueToken = result(itemBody, 'continuations[0].nextContinuationData.continuation', '')
                    // mapping all content to stream schema
                    const {streams, videos} = this.generateContentStream(contentBody, project)
                    // save data to collection "streams"
                    this.db_adapter.saveStreamToCollection(streams).then()
                    // get comments from main post
                    this.comments.getComments(videos, {patch, project})
                        .then((comments) => {
                            console.log(`[finish] : count ${comments.length} row`)
                            this.db_adapter.saveStreamToCollection(comments).then()
                            dataAllJson = dataAllJson.concat(streams, comments)
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

    start (options = {}) {
        const {qsearch, keyid, client} = options
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
                        keyword: qsearch
                    },
                    cToken: '',
                    sToken: sessionToken,
                    query: qsearch,
                    patch
                }

                this.getFirstPage(firstArgs)
                    .then(async (res) => {
                        // console.log({keyid,client})
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
                                        client
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
                        writeFileSync('/tmp/allstreams.json', JSON.stringify(dataAllJson), {encoding: 'utf-8'})
                    })
                    .catch((err) => {throw err})
            } catch (err) {
                console.log(err)
            }
        });
    }
}

new App().start({
    qsearch: 'indomie',
    keyid: 820,
    client: 15
})