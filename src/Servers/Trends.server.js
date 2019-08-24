'use strict'

require('../App/Bootstrap')

const { join } = require('path')

const express = require('express')

const app = express()

const options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['htm', 'html'],
    index: false,
    maxAge: '1d',
    redirect: false,
    setHeaders: function (res, path, stat) {
      res.set('x-timestamp', Date.now())
    }
}

app.use(express.static(join('./Public/trends/assets'), options))
app.set('view engine', 'pug')
app.set('views', join(__dirname, '../App/Views/SocialTrends'))

/* app modules */
// controllers
const SocialController = use('Controllers/SocialTrends/Trends.Controller')

// middlewares
const SeoMiddleware = use('Middlewares/Seo')

app.get(['/', '/dashboard'], [SeoMiddleware], SocialController.dashboard)

app.listen(3000)

console.log('server listen on port 3000')