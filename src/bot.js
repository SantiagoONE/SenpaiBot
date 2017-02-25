'use strict'

const Fs = require('fs')
const Botkit = require('botkit')
const Core = require('./core')
const Config = require('./config')

let controller = Botkit.slackbot({})

let bot = controller.spawn({
  token: Config.BOT_TOKEN
})

let patterns = null

function sendOops(message) {
    bot.reply(message, 'Oops! Something went wrong :face_with_head_bandage:')
}

patterns = ['help(.*)']
controller.hears(patterns, Config.USE_CASES, (bot, message) => {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: Config.ICON_EMOJI_TO_REACT,
    }, (err, res) => {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err)
        }
    })

    Fs.readFile(__dirname + '/../README.md', (err, data) => {
        if (!err) {
             bot.api.files.upload({
                timestamp: message.ts,
                channels: message.channel,
                content: data,
                filetype: 'markdown',
                title: "SenpaiBot's README",
                filename: 'README.md'
            }, (err, res) => {
                if (err) {
                    bot.botkit.log('Failed to send a file :(', err)
                    sendOops(message)
                }
            })
        } else {
            bot.botkit.log('Error Fs.readFile: ' + err)
            sendOops(message)
        }
    })
})

patterns = ['next master(.*)', 'quien sigue(.*)', 'dame amor']
controller.hears(patterns, Config.USE_CASES, (bot, message) => {
    let master = Core.tellMeWhoIsMaster()
    let reply = {
        user: bot.identity.id,
        text: "*Your master is:* <@" + master.id + "|" + master.name + ">",
        mrkdwn: true
    }
    bot.reply(message, reply, (err, res) => {
        if (err) {
            bot.botkit.log('Failed to reply :(', err)
        }
    })
})

patterns = ['dame tu lista(.*)', 'give me(.*)', 'tell me(.*)', 'dame']
controller.hears(patterns, Config.USE_CASES, (bot, message) => {
    let members = Core.listMembersByPriority()
    let preText = ["List of members by priority:"]
    for(let index in members) {
        let member = members[index]
        if (index == 0)
            preText.push((parseInt(index) + 1) + ". <@" + member.id + "|" + member.name + "> (I'm your master :smirk:)")
        else 
            preText.push((parseInt(index) + 1) + ". <@" + member.id + "|" + member.name + ">")
    }
    let reply = {
        user: bot.identity.id,
        text: preText.join('\n'),
        mrkdwn: true
    }
    bot.reply(message, reply, (err, res) => {
        if (err) {
            bot.botkit.log('Failed to reply :(', err)
        }
    })
})

patterns = ['kill the master']
controller.hears(patterns, Config.USE_CASES, (bot, message) => {    
    let user = Core.getMemberById(message.user)
    let master = Core.tellMeWhoIsMaster()
    if (!user || !master){
        bot.botkit.log('ERROR: user or master cannot be undefined.')
        sendOops(message)
        return
    }
    if (user.id === master.id) {
        Core.updateNextMaster().then(() => {
            bot.reply(message, 'Done! Thanks for your collaboration :ok_hand:')
        })
    } else {
        let originalMessage = Object.assign({}, message)
        message.user = master.id
        bot.startPrivateConversation(message, (err, convo) => {
            if (!err) {
                let question = "<@" + user.id + "|" + user.name + "> wants to kill you. :see_no_evil:\nDo you want to proceed?"
                convo.ask(question, [
                    {
                        pattern: Config.PATTERN.no,
                        default: true,
                        callback: (res, convo) => {
                            convo.say("Okay, no problem. You're still the master. :smirk:")
                            bot.reply(originalMessage, "The master practically said: fak u. :joy:")
                            convo.next()
                        }
                    },
                    {
                        pattern: Config.PATTERN.yes,
                        callback: (res, convo) => {
                            Core.updateNextMaster().then(() => {
                                convo.say('Done! :ok_hand:')
                                bot.reply(originalMessage, "You have a new master. :fire:")
                                convo.next()
                            })
                        }
                    }
                ])
            }
        })
    }
})

module.exports = bot