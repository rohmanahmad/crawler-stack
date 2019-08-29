'use strict'

const { result } = require('./node_modules/lodash')
const Filter = require('../StreamFilter')
const md5 = require('./node_modules/md5')

const domain = 'https://twitter.com'

const monthList = {
    'jan': '01',
    'feb': '02',
    'mar': '03',
    'apr': '04',
    'mei': '05',
    'jun': '06',
    'jul': '07',
    'aug': '08',
    'sept': '09',
    'oct': '10',
    'nov': '11',
    'dec': '12',
}

class DataMapper {
    async mappingDataStreams (data = [] , project = {}) {
        try {
            const {keyword , id : projectId, client, include, exclude} = project
            let streams = []
            let index = 0
            for (const x of data) {
                index += 1
                if(x){
                    let id = x.match(/data-tweet-id=\"(.*?)"/img)
                        id = result(id, '[0]', '')
                        .replace('data-tweet-id="', '')
                        .replace('"', '')
                    let source = x.match(/data-permalink-path=\"(.*?)"/img)
                        source  = result(source, '[0]', '')
                            .replace('data-permalink-path="', '')
                            .replace('"', '')
    
                    let username = x.match(/data-screen-name=\"(.*?)"/img)
                        username  = result(username, '[0]', '')
                            .replace('data-screen-name="', '')
                            .replace('"', '')
    
                    let realName = x.match(/data-name=\"(.*?)"/img)
                        realName  = result(realName, '[0]', '')
                            .replace('data-name="', '')
                            .replace('"', '')
    
                    let dates = x.match(/="tweet-timestamp js-permalink js-nav js-tooltip" title=\"(.*?)"/img)
                    dates  = result(dates, '[0]', '')
                    .replace('="tweet-timestamp js-permalink js-nav js-tooltip" title="', '')
                    .replace('"', '')
                    .replace('-', '')
                    .replace('.', ':')
                    .replace('Agu', 'Aug')
                        
                    let avatar = x.match(/"avatar js-action-profile-avatar" src=\"(.*?)"/img)
                        avatar  = result(avatar, '[0]', '')
                            .replace('"avatar js-action-profile-avatar" src="', '')
                            .replace('"', '')
    
                    let text = x.match(/<p class="TweetTextSize(.*?)<\/p>/img)
                    text = result(text, '[0]', '')
                    let hashtags = text.match(/href=\"\/hashtag\/(.*?)\?src/img) || []
                    hashtags = hashtags.map(h => h.replace(/href="\/hashtag\//g, '').replace(/\?src/g, ''))
                    text = text.replace(/<p class="TweetTextSize(.*?)>/img, '').replace(/<\/p>/img, '').replace(/<a(.*?)<\/a>/img, '')
                    const emots = (text.match(/ alt="(.*?)"/img) || [])
                        .map(emot => emot.replace(' alt="', '').replace('"', ''))
                    text = text.replace(/<img(.*?)>/img, '{=img}')
                        .replace(/<(\/?)strong>/img, '')

                        // console.log('----',text)
                    for (let em of emots) {
                        text = text.replace('{=img}', em + ' ')
                    }
                    
                    const streamsId = md5(`${id}_${projectId}`)
                    const pubPecah = dates.replace(/\s\s+/g, ' ')
                        .split(' ')
                    const objDate = {
                        jam: pubPecah[0] + ':00',
                        DD: parseInt(pubPecah[1]) < 10 ? `0${pubPecah[1]}` : pubPecah[1],
                        MM: monthList[(pubPecah[2] || '').toLowerCase()],
                        YY: pubPecah[3]
                    }
                    const format = `${objDate['MM']}-${objDate['DD']}-${objDate['YY']} ${objDate['jam']}`
                    const pubDate = new Date(format)
                    const stream = {
                        hashuniqeid: `${streamsId}`, 
                        stream_id: `${streamsId}`,
                        source : `${domain}${source}`,
                        user :{
                            id:id,
                            real_name : realName,
                            username : username,
                            avatar 
                        },
                        text,
                        hashtags,
                        date: pubDate,
                        dates: format,
                        type :'post',
                        keyword :projectId,
                        client ,
                        brand: 0,
                        is_trash: 0,
                        service: 'twitter',
                        sentiment: {
                            status: false,
                            value: 0
                        },
                        query: keyword || ''
                    }
                    streams.push(stream)
                }
            }
            console.log(streams.map(x => x.stream_id).join())
            console.log({
                key_in: include,
                key_ex: exclude,
                keyword: [keyword]
            })
            streams = await new Filter({
                key_in: include,
                key_ex: exclude,
                keyword: [keyword]
            })
            .filter(streams)
            console.log('filtered:', streams.length, 'rows')
            // console.log({streams})
            return streams
        } catch (err) {
            throw err
        }
    }
}

module.exports = DataMapper
