//to run: node -r dotenv/config {script_name}.js
'use strict';

const BOT_TOKEN = process.env.BOT_TOKEN || '';

const Fs = require('fs');
const Core = require('./core');
const Botkit = require('botkit');

var controller = Botkit.slackbot({});

var bot = controller.spawn({
  token: BOT_TOKEN
}).startRTM();

var patterns = null;
const useCases = 'direct_message,direct_mention,mention';

patterns = ['help(.*)'];
controller.hears(patterns, useCases, (bot, message) => {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'heart',
    }, (err, res) => {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });

    Fs.readFile(__dirname + '/README.md', (err, data) => {
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
                    bot.botkit.log('Failed to send a file :(', err);
                }
            });
        }
    });
});

patterns = ['next god(.*)', 'quien sigue(.*)', 'dame amor'];
controller.hears(patterns, useCases, (bot, message) => {
    var god = Core.tellMeWhoIsGod();
    var reply = {
        user: bot.identity.id,
        text: "*Your master is:* <@" + god.id + "|" + god.name + ">",
        mrkdwn: true
    };
    bot.reply(message, reply, (err, res) => {
        if (err) {
            bot.botkit.log('Failed to reply :(', err);
        }
    });
});

patterns = ['dame tu lista(.*)', 'give me(.*)', 'tell me(.*)', 'dame'];
controller.hears(patterns, useCases, (bot, message) => {
    var members = Core.listMembersByPriority();
    var preText = ["List of members by priority:"];
    for(var index in members) {
        var member = members[index];
        if (index == 0)
            preText.push((parseInt(index) + 1) + ". <@" + member.id + "|" + member.name + "> (I'm your master :smirk:)");
        else 
            preText.push((parseInt(index) + 1) + ". <@" + member.id + "|" + member.name + ">");
    }
    var reply = {
        user: bot.identity.id,
        text: preText.join('\n'),
        mrkdwn: true
    };
    bot.reply(message, reply, (err, res) => {
        if (err) {
            bot.botkit.log('Failed to reply :(', err);
        }
    });
});

patterns = ['kill the master'];
controller.hears(patterns, useCases, (bot, message) => {    
    var user = Core.getMemberById(message.user);
    var god = Core.tellMeWhoIsGod();
    if (user.id === god.id) {
        Core.updateNextGod().then(() => {
            bot.reply(message, 'Done! Thanks for your collaboration :ok_hand:', (err, res) => {
                if (err) {
                    bot.botkit.log('Failed to reply :(', err);
                }
            });
        });
    } else {
        var original_message = Object.assign({}, message);
        message.user = god.id;
        bot.startPrivateConversation(message, (err, convo) => {
            if (!err) {
                var question = "<@" + user.id + "|" + user.name + "> wants to kill you. :see_no_evil:\nDo you want to proceed?";
                convo.ask(question, [
                    {
                        pattern: "yes|yea|yup|yep|ya|sure|ok|y|yeah|yah|aye|dale|yep|okay|ok",
                        callback: (res, convo) => {
                            Core.updateNextGod().then(() => {
                                convo.say('Done! :ok_hand:');
                                bot.reply(original_message, "You have a new master. :fire:");
                                convo.next();
                            })
                        }
                    },
                    {
                        pattern: "no|nah|nope|n|nop|nai|nel|fak u",
                        default: true,
                        callback: (res, convo) => {
                            convo.say("Okay, no problem. You're still the master. :smirk:");
                            bot.reply(original_message, "The master practically say: fak u. :joy:");
                            convo.next();
                        }
                    }
                ]);
            }
        });
    }
});