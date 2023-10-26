require('dotenv').config();
const { Command } = require('commander');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

const program = new Command();
const botToken = process.env.BOT_TOKEN;
const bot = new TelegramBot(botToken);

program
    .command('m <message>')
    .description('Send a message to your Telegram bot')
    .action((message) => {
        bot.sendMessage(process.env.USER_ID, message).then(() => process.exit(0))
            .catch((err) => {
                console.error('Error sending message: ', err);
                process.exit(1);
            });
    });

program.command('p <path>')
    .description('Send a photo to your Telegram bot')
    .action((path) => {
        const photo = fs.readFileSync(path);
        bot.sendPhoto(process.env.USER_ID, photo)
            .then(() => process.exit(0))
            .catch((err) => {
                console.error('Error sending photo: ', err);
                process.exit(1);
            });
    });

program.parse(process.argv)