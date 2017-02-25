'use strict'

require('dotenv').load()

module.exports =  {
  PORT: process.env.PORT,
  BOT_TOKEN: process.env.BOT_TOKEN,

  ICON_EMOJI_TO_REACT: 'heart',
  USE_CASES: 'direct_message,direct_mention,mention',
  PATTERN: {
    yes: '(yes|yea|yup|yep|ya|sure|ok|y|yeah|yah|aye|dale|yep|okay|ok)(.*)',
    no: '(no|nah|nope|n|nop|nai|nel|fak u)(.*)'
  }
}