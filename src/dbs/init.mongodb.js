'use strict'

const mongoose = require("mongoose")

const connectString = `mongodb://0.0.0.0:27017/shopDEV`

// strategy pattern
class Database {

    constructor() {
        this.connect()
    }

    // connect
    connect(type = 'mongodb') {
        // dev
        if(1 === 1) {
            mongoose.set('debug', true)
            mongoose.set('debug', {color: true})
        }
        mongoose.connect(connectString).then( _ => console.log('Connected Mongodb Success'))
        .catch(err => console.log(err))
    }

    static getInstance() {
        if(!Database.instance) {
            Database.instance = new Database()
        }
        return Database.instance
    }
}
const instanceMongodb = Database.getInstance()
module.exports = instanceMongodb