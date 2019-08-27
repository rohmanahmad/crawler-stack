'use strict'

const domain = 'https://www.youtube.com'
const url = `${domain}/results`
const qconfig = 'CAISBAgCEAE%253D'

module.exports = {  
    randomPatch: function () {
        return `${Math.random()}`.substr(0, 5)
    },

    getReqOptions: function (opts = {}) {
        const {cToken, sToken, query, patch, cUrl} = opts
        let qObj = {}
        if (query) {
            qObj = {
                search_query: query,
                sp: 'CAISBAgCEAE%3D',
                pbj: '1',
            }
        }
        if (cToken) {
            qObj['ctoken'] = cToken
            qObj['continuation'] = cToken
        }
        let fData = {}
        if (sToken) {
            fData['session_token'] = sToken
        }
        return {
            method: 'POST',
            url: cUrl || url,
            headers: {
                'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.377${patch} Safari/537.36`,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
                'referer': `${url}?search_query=${query || ''}&sp=${qconfig}`,
                'x-spf-previous': `${url}?search_query=${query || ''}&sp=${qconfig}`,
                'x-spf-referer': `${url}?search_query=${query || ''}&sp=${qconfig}`,
                'x-youtube-ad-signals': 'dt=1564458773795&flash=0&frm&u_tz=420&u_his=2&u_java&u_h=900&u_w=1440&u_ah=873&u_aw=1440&u_cd=24&u_nplug=3&u_nmime=4&bc=31&bih=149&biw=1439&brdim=0%2C23%2C0%2C23%2C1440%2C23%2C1439%2C872%2C1439%2C149&vis=1&wgl=true&ca_type=image&bid=ANyPxKqMQiJNE1s0cplI1bdMuKo4qL1mhmZnVUU41ChiVY9qXQAt3bDdX6sGQG-FjjRxO-NyRrsOcbXGmVbzLrt3LDwIASxePA',
                'x-youtube-client-name': '1',
                'x-youtube-client-version': '2.20190727.08.00',
                'x-youtube-page-cl': '260257227',
                'x-youtube-page-label': 'youtube.ytfe.desktop_20190726_8_RC0',
                'x-youtube-utc-offset': '420',
                'x-youtube-variants-checksum': '653d3534b1887729ce5b4ed50dbceb98',
            },
            qs: qObj,
            formData: fData
        }
    }
}
