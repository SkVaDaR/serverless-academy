const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });

const cache = new NodeCache({ stdTTL: 60 });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    if (messageText === '/start') {
        bot.sendMessage(chatId, 'Welcome to the Bot! Please select an option:', {
            reply_markup: {
                keyboard: [[{ text: 'Weather Forecast' }], [{ text: 'Exchange Rates' }]],
                resize_keyboard: true,
            },
        });
    } else if (messageText === 'Weather Forecast') {
        sendWeatherForecast(chatId);
    } else if (messageText === 'Exchange Rates') {
        sendExchangeRatesMenu(chatId);
    }
});

function sendWeatherForecast(chatId) {
    bot.sendMessage(chatId, 'Select a time interval:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Every 3 Hours', callback_data: '3' }],
                [{ text: 'Every 6 Hours', callback_data: '6' }],
            ],
        },
    });
}

function sendExchangeRatesMenu(chatId) {
    bot.sendMessage(chatId, 'Select a currency:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'USD (Monobank)', callback_data: 'USD_MONO' }],
                [{ text: 'EUR (Monobank)', callback_data: 'EUR_MONO' }],
                [{ text: 'USD (PrivatBank)', callback_data: 'USD_PRIVAT' }],
                [{ text: 'EUR (PrivatBank)', callback_data: 'EUR_PRIVAT' }],
            ],
        },
    });
}

function sendWeatherData(chatId, interval) {
    const city = 'Nice'; // Change this to your preferred city
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    axios
        .get(url)
        .then((response) => {
            const weatherData = response.data;
            const forecastData = interval === '3' ? weatherData.list.slice(0, 8) : weatherData.list.filter((item, index) => index % 2 === 0);

            let message = `Weather forecast for ${city} every ${interval} hours:\n`;

            forecastData.forEach((item) => {
                const date = new Date(item.dt * 1000).toLocaleString();
                const temperature = (item.main.temp - 273.15).toFixed(2);
                const weather = item.weather[0].main;
                message += `\nDate: ${date}\nTemperature: ${temperature} °C\nWeather: ${weather}\n`;
            });

            bot.sendMessage(chatId, message);
        })
        .catch((error) => {
            console.error('Error fetching weather data:', error);
            bot.sendMessage(chatId, 'Failed to fetch weather data. Please try again later.');
        });
}

function getExchangeRateFromMonobank(currency, chatId, messageId) {
    const monobankUrl = 'https://api.monobank.ua/bank/currency';
    axios
        .get(monobankUrl)
        .then((response) => {
            const rates = response.data;
            let selectedRate;
            if (currency === 'USD_MONO') {
                selectedRate = rates.find((rate) => rate.currencyCodeA === 840 && rate.currencyCodeB === 980); // USD to UAH
            } else if (currency === 'EUR_MONO') {
                selectedRate = rates.find((rate) => rate.currencyCodeA === 978 && rate.currencyCodeB === 980); // EUR to UAH
            }
            const message = `Monobank Exchange Rate: 1 ${currency} = ${selectedRate.rateSell} UAH`;
            cache.set(currency.toLowerCase(), message);
            bot.sendMessage(chatId, message, { reply_to_message_id: messageId });
        })
        .catch((error) => {
            console.error('Error fetching Monobank exchange rates:', error);
            bot.sendMessage(chatId, 'Failed to fetch exchange rates from Monobank. Please try again later.', { reply_to_message_id: messageId });
        });
}

function getExchangeRateFromPrivatBank(currency, chatId, messageId) {
    const privatBankUrl = 'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5';
    axios
        .get(privatBankUrl)
        .then((response) => {
            const rates = response.data;
            let selectedRate;
            if (currency === 'USD_PRIVAT') {
                selectedRate = rates.find((rate) => rate.ccy === 'USD');
            } else if (currency === 'EUR_PRIVAT') {
                selectedRate = rates.find((rate) => rate.ccy === 'EUR');
            }
            const message = `PrivatBank Exchange Rate: 1 ${selectedRate.ccy} = ${selectedRate.sale} UAH`;
            cache.set(currency.toLowerCase(), message);
            bot.sendMessage(chatId, message, { reply_to_message_id: messageId });
        })
        .catch((error) => {
            console.error('Error fetching PrivatBank exchange rates:', error);
            bot.sendMessage(chatId, 'Failed to fetch exchange rates from PrivatBank. Please try again later.', { reply_to_message_id: messageId });
        });
}

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const { data } = query;

    if (data === 'weather') {
        sendWeatherForecast(chatId);
    } else if (data === 'exchange') {
        sendExchangeRatesMenu(chatId);
    } else if (data === '3' || data === '6') {
        sendWeatherData(chatId, data);
    } else if (data.includes('MONO')) {
        getExchangeRateFromMonobank(data, chatId, messageId);
    } else if (data.includes('PRIVAT')) {
        getExchangeRateFromPrivatBank(data, chatId, messageId);
    }
});
