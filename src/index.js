'use strict'

const Express = require('express')
const Senpai = require('./bot')
const Config = require('./config')

let app = Express()

let server = app.listen(Config.PORT, (err) => {
  if (!err) {
      Senpai.startRTM((err, bot, payload) => {
          if (!err) {
              console.log("\nSenpaibot LIVES on PORT: " + Config.PORT)
              console.log("@senpaibot is listening in real-time\n") 
          }
      })
  }
})
