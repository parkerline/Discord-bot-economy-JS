const fs = require("fs");
const path = require("path");
const { Collection } = require("discord.js");

module.exports = (client) => {
  client.commands = new Collection();
  const commandFiles = fs
    .readdirSync(path.join(__dirname, "../client"))
    .filter((file) => file.endsWith(".js"));

  const commands = [];

  for (const file of commandFiles) {
    const commandArray = require(`../client/${file}`);
    for (const command of commandArray) {
      client.commands.set(command.data.name, command);
      commands.push(command.data);
    }
  }

  return commands;
};
