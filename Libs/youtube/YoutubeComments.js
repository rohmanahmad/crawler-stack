'use strict'

const {writeFileSync} = require('fs')
const request = require('request')
const md5 = require('md5')
const { map, result } = require('lodash')
const { getReqOptions } = require('./RequestOptions')
const domain = 'https://www.youtube.com'
const apiurl = 'https://www.googleapis.com/youtube/v3/commentThreads'
const tokenlist = [
    'AIzaSyB4EaIOPFobDcggNiwAbAPVcoP1BjZTsN4'
]

function getToken () {
    return tokenlist[0]
}

function requestData (url = '') {
    return new Promise((resolve, reject) => {
        request(url,
            (error, response, body) => {
                if (error) throw new Error(error)
                try {
                    const {items} = JSON.parse(body) || {}
                    resolve(items)
                } catch (err) {
                    reject(err)
                }
            })
    })
}

module.exports = {
    mappingCommentsToStreams (items = [], project = {}) {
        const {id: projectId, client, keyword, parent} = project
        let streams = []
        for (const itm of items) {
            const id = itm['id']
            const videoId = result(itm, 'snippet.videoId', '')
            const user = {
                id: result(itm, 'snippet.topLevelComment.snippet.authorChannelId.value', ''),
                name: result(itm, 'snippet.topLevelComment.snippet.authorDisplayName', ''),
                real_name: result(itm, 'snippet.topLevelComment.snippet.authorDisplayName', ''),
                avatar: result(itm, 'snippet.topLevelComment.snippet.authorProfileImageUrl', '')
            }
            const text = result(itm, 'snippet.topLevelComment.snippet.textOriginal', '')
            const date = result(itm, 'snippet.topLevelComment.snippet.publishedAt', '')
            const uniqid = md5(`${id}_${projectId}`)
            const data = {
                hashuniqeid: uniqid,
                stream_id: uniqid,
                source: `${domain}/watch?v=${videoId}`,
                date: new Date(date),
                text: text.trim(),
                user,
                type: 'comment',
                timestamp: new Date(),
                image: '',
                title: '',
                keyword: projectId,
                client,
                brand: 0,
                is_trash: 0,
                service: 'youtube',
                sentiment: {
                    status: false,
                    value: 0
                },
                parent,
                query: keyword || ''
            }
            streams.push(data)
        }
        return streams
    },
    async getComments (videos = [], opts = {}) {
        console.log('getting comments...')
        let allComments = []
        const project = opts.project
        const currentToken = getToken()
        for (const v of videos) {
            try {
                const vid = v.id
                const parent = {parent: v.parent}
                const curl = `${apiurl}?key=${currentToken}&textFormat=plainText&part=snippet&videoId=${vid}`
                const comments = await requestData(curl)
                const streams = this.mappingCommentsToStreams(comments, {...project, ...parent})
                console.log(`[comments] : found ${streams.length} data`)
                allComments = allComments.concat(streams)
            } catch (err) {
                console.log(err)
            }
        }
        return allComments
    },
    getNextComments (commentArg) {
        return new Promise((resolve, reject) => {
            console.log('get first comment...')
            console.log(commentArg)
            request(commentArg, (err, res, body) => {
                if (err) {
                    console.log(err)
                    return reject(err)
                }
                // console.log(res)
                console.log({response: res.statusCode, body})
                resolve()
            })
        })
    }
}
