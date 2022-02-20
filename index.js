
const { Telegraf } = require('telegraf')

const bot = new Telegraf('5272155925:AAEujqTLXySZkIsAuElDpVjC1n7uPXcm34w')
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()