'use strict'

const pattern = {
    'menit': 60,
    'minute': 60,
    'minutes': 60,
    'jam': 60 * 60,
    'hour': 60 * 60,
    'hours': 60 * 60,
    'hari': 24 * 60 * 60,
    'day': 24 * 60 * 60,
    'days': 24 * 60 * 60
}


module.exports = {
    /* 
        ex:
            str = '12 minute ago' 
            str = '12 menit yang lalu'
    */
    getDate (str = '') {
        const arr = str.split(' ')
        const currentTime = new Date().getTime()
        const n = parseInt(arr[0])
        const type = pattern[arr[1]]
        if (!n || !type) {
            return new Date()
        }
        const pengurang = (n * type) * 1000
        const validTime = currentTime - pengurang
        // console.log({pengurang, currentTime, validTime, type, n})
        return new Date(validTime)
    }
}
