require('dotenv').config()
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
const app = express()

// init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

// intit db
require('./dbs/init.mongodb')
// init routes
app.use('/', require('./routes'))
// inti handling error

module.exports = app

