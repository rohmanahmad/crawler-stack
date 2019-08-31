'use strict'

require('../App/Bootstrap')

const { join } = require('path')

const express = require('express')

const app = express()

const options = {
    // dotfiles: 'ignore',
    // etag: false,
    // index: false,
    // maxAge: '1d',
    // redirect: false,
    // setHeaders: function (res, path, stat) {
    //   res.set('x-timestamp', Date.now())
    // }
}

app.use(express.static(join(__dirname, 'Public/trends/assets'), options))
app.use(express.static(join(__dirname, 'Public/themes/bracket'), options))
app.use(express.static(join(__dirname, 'Public/themes/vendors'), options))
app.set('view engine', 'pug')
app.set('views', join(__dirname, '../App/Views/SocialTrends'))

/* app modules */
// controllers
const SocialController = use('Controllers/SocialTrends/Trends.Controller')

// middlewares
const AssetsManager = use('Middlewares/AssetsManager')
const SeoMiddleware = use('Middlewares/Seo')

app.use(AssetsManager)
app.get(['/'], [SeoMiddleware], SocialController.index)
app.get(['/dashboard'], [SeoMiddleware], SocialController.dashboard)
app.get(['/trendings'], [SeoMiddleware], SocialController.trendings)

app.listen(3000)

console.log('server listen on port 3000')