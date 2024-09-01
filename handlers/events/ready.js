const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const config = require("../../config.json");

module.exports = (client, commands) => {
  client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const rest = new REST({ version: "9" }).setToken(config.token);

    try {
      console.log("Started refreshing application (/) commands.");

      await rest.put(
        Routes.applicationGuildCommands(client.user.id, config.guildId),
        { body: commands }
      );

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  });
};
