const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

const bot = new TelegramBot(botToken, { polling: true });

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Weather Forecast Bot. Enter /help for a list of available commands.');
});

bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Use the following commands: \n /forecast3 - to get the weather forecast every 3 hours \n /forecast6 - to get the weather forecast every 6 hours');
});

bot.onText(/\/forecast3/, (msg) => {
    sendWeatherForecast(msg.chat.id, 3);
});

bot.onText(/\/forecast6/, (msg) => {
    sendWeatherForecast(msg.chat.id, 6);
});

function sendWeatherForecast(chatId, interval) {
    const city = 'Lviv';
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `${weatherApiUrl}?q=${city}&appid=${apiKey}`;

    axios
        .get(url)
        .then((response) => {
            const weatherData = response.data;
            const forecastData = interval === 3 ? weatherData.list.slice(0, 8) : weatherData.list.filter((item, index) => index % 2 === 0);

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