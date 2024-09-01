const { Client, GatewayIntentBits, Collection } = require("discord.js");
const config = require("./config.json");
require("./db"); // Подключение к MongoDB

// Создаем экземпляр клиента
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// Загрузка команд
const loadCommands = require("./handlers/loadCommands");
const commands = loadCommands(client);

// Обработка событий
const handleEvents = require("./handlers/events/ready");
handleEvents(client, commands);

// Авторизация бота
client.login(config.token);
