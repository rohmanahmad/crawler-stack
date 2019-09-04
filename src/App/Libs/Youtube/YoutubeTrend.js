'use strict'

const moment = require('moment')
const request = require('request')
const {writeFileSync} = require('fs')
const trendUrl = 'https://www.youtube.com/feed/trending?gl=ID&hl=en'

class YoutubeTrend {
    constructor () { }
    async run () {
        try {
            const ytTrend = await this.getTrendings()
            return ytTrend
        } catch (err) { throw err }
    }

    getTrendings () {
        return new Promise((resolve, reject) => {
            request({
                type: 'GET',
                url: trendUrl
            }, (error, response, body) =>{
                if (error) return reject(error)
                body = body.replace(/[ +|\n]/img, ' ')
                if (body.indexOf('expanded-shelf-content-item-wrapper') === -1) {
                    console.log(body)
                    return reject('No response')
                }
                // writeFileSync('/tmp/yotube.html', body, {encoding: 'utf8'})
                // const m = body.split(/<li class="expanded-shelf-content-item-wrapper">/g)
                const contents = body.match(/<li class="expanded-shelf-content-item-wrapper">(.*?)<\/div><\/div><\/li>/img)
                let position = 1
                let data = []
                for(let c of contents) {
                    if (position <= 10) {
                        // console.log('\n', '-'.repeat(100))
                        let vidId = c.match(/data-context-item-id="(.*?)"/img)
                            vidId = vidId ? vidId[0].replace(/data-context-item-id=|\"| +/img, '') : ''
                        let image = c.match(/data-thumb="(.*?)"/img)
                        let title = c.match(/<a href="\/watch(.*?)" aria-describedby=/img)
                            title = title ? title[0] : ''
                            title = title.match(/title="(.*?)"/img) || ['']
                            title = (title[0] || '')
                                .replace(/title="|\"$| {2}/img, '')
                                .replace(/&amp;/g, '&')
                        let duration = c.match(/aria-hidden="true">(.*?)<\/span>/img) || ['']
                            duration = (duration[0] || '')
                                .replace(/aria-hidden=|>|<\/span>|\"|duration|true| {2}/img, '')
                        const link = 'https://youtube.com/' + vidId
                        let channelName = c.match(/<a href="\/cha(.*?)" >(.*?)<\/a>/img)
                            channelName = channelName ? channelName[0] : ''
                            channelName = channelName.replace(/<(.*?)>/img, '')
                        let channelUrl = c.match(/<a href="\/cha(.*?)"/img)
                            channelUrl = channelUrl ? channelUrl[0] : ''
                            channelUrl = 'https://youtube.com' + channelUrl.replace(/<a href=|\"/img, '')
                        let groupView = c.match(/<ul class="yt-lockup-meta-info">(.*?)<\/ul>/img)
                            groupView = groupView ? groupView[0] : ''
                            groupView = groupView
                            .replace(/<(.*?)>/img, '|')
                            .split('|')
                            .filter(x => x.trim().length > 0)
                        const uploadedAt = (groupView ? groupView[0] : '')
                            .replace(/hour(.*?) ago/g, 'h')
                            .replace(/week(.*?) ago/g, 'w')
                            .replace(/day(.*?) ago/g, 'd')
                            .replace(/month(.*?) ago/g, 'm')
                            .replace(/year(.*?) ago/g, 'm')
                            .replace(/Streamed/g, '')
                            .split(' ')
                            .filter(x => x.trim().length > 0)
                        const views = parseInt((groupView ? groupView[1] : '')
                            .replace(/\,|view?s/g, '')
                            .trim())
                        let description = c.match(/dir="ltr">(.*?)<\/div><\/div>/img)
                            description = description ? description[0] : ''
                            description = description
                                .replace(/dir="ltr">|<(.*?)>/img, ' ')
                                .replace(/&amp;/g, '&')
                                .replace(/&nbsp;/g, ' ')
                                .replace(/ +/g, ' ')
                                .trim()
                        if (!image) {
                            image = c.match(/" src="(.*?)"/img) || ['']
                        }
                        if (!image || (image && !image[0])) image = ['']
                        image = (image[0] || '').replace(/data-thumb=|\"|src=| +/img, '')
                        if (uploadedAt.length > 2) console.log(groupView[0])
                        const uploadedFormat = moment()
                            .subtract(parseInt(uploadedAt[0]), uploadedAt[1])
                            .toDate()
                        const mapped = {
                            source: 'youtube',
                            position,
                            date: new Date(),
                            tren_id: vidId,
                            text: title,
                            post: {
                                count: 1,
                                images: [image],
                                link,
                                description,
                                published_at: uploadedFormat,
                                likes: 0,
                                views,
                                shares: 0
                            },
                            raw: {
                                duration,
                                channelName,
                                channelUrl,
                                groupView,
                                uploaded_at: {
                                    raw: uploadedAt,
                                    format: uploadedFormat
                                }
                            }
                        }
                        data.push(mapped)
                        position += 1
                    }
                    // writeFileSync('/tmp/yotub.html', body, {encoding: 'utf8'})
                }
                return resolve(data)
            })
        })
    }
}

module.exports = YoutubeTrend