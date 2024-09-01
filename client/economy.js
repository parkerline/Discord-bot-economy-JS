const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const User = require("../models/User");
const emoji = require("../emoji.json");

const balanceCommand = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Показать баланс пользователя")
    .addUserOption((option) =>
      option
        .setName("пользователь")
        .setDescription("Пользователь, баланс которого нужно показать")
        .setRequired(false)
    ),
  async execute(interaction) {
    const user =
      interaction.options.getUser("пользователь") || interaction.user;

    try {
      const userdata = await User.findOne({ userId: user.id });

      if (!userdata) {
        return interaction.reply({
          content: "Пользователь не найден",
          ephemeral: true,
        });
      }
      const balance = userdata.profile.balance;
      const crystall = userdata.profile.crystall;
      const embed = new EmbedBuilder()
        .setTitle(`Баланс — ${user.username}`)
        .setTimestamp()
        .setThumbnail(user.displayAvatarURL())
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .addFields(
          {
            name: `${emoji.razd}Баланс${emoji.coin}`,
            value: `\`\`\`${balance}\`\`\``,
            inline: true,
          },
          {
            name: `${emoji.razd}Кристаллы${emoji.crystall}`,
            value: `\`\`\`${crystall}\`\`\``,
            inline: true,
          }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "Произошла ошибка при выполнении команды",
        ephemeral: true,
      });
    }
  },
};

const giveCommand = {
  data: new SlashCommandBuilder()
    .setName("give")
    .setDescription("Передать деньги другому пользователю")
    .addUserOption((option) =>
      option
        .setName("пользователь")
        .setDescription("Пользователь, которому нужно передать деньги")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("сумма")
        .setDescription("Сумма, которую нужно передать")
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("пользователь");
    const amount = interaction.options.getInteger("сумма");

    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: "Вы не можете передать деньги самому себе",
        ephemeral: true,
      });
    }

    if (amount <= 0) {
      return interaction.reply({
        content: "Сумма должна быть больше нуля",
        ephemeral: true,
      });
    }

    try {
      const senderData = await User.findOne({ userId: interaction.user.id });
      const receiverData = await User.findOne({ userId: user.id });
      const balance = senderData.profile.balance;
      if (balance < amount) {
        return interaction.reply({
          content: "У вас недостаточно денег для этой операции",
          ephemeral: true,
        });
      }

      const commission = Math.floor(amount * 0.05); // 5% комиссия
      const receiverAmount = amount - commission;
      const embed = new EmbedBuilder()
        .setTitle("Передача денег")
        .setDescription(
          `${interaction.user.username}, вы уверены, что хотите передать ${receiverAmount} ${emoji.coin} с учетом комиссии 5% пользователю ${user.username}?`
        )
        .setTimestamp()
        .setThumbnail(user.displayAvatarURL())
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL(),
        });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("accept")
          .setLabel("Принять")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("decline")
          .setLabel("Отклонить")
          .setStyle(ButtonStyle.Danger)
      );

      const message = await interaction.reply({
        embeds: [embed],
        components: [row],
        fetchReply: true,
      });

      const filter = (i) => i.user.id === interaction.user.id;
      const collector = message.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on("collect", async (i) => {
        if (i.customId === "accept") {
          senderData.profile.balance -= amount;
          receiverData.profile.balance += receiverAmount;
          await senderData.save();
          await receiverData.save();

          const acceptedEmbed = new EmbedBuilder()
            .setTitle("Передача денег")
            .setDescription(
              `Вы успешно передали ${receiverAmount} ${emoji.coin} пользователю ${user.username}.`
            )
            .setTimestamp()
            .setThumbnail(user.displayAvatarURL())
            .setAuthor({
              name: interaction.user.username,
              iconURL: interaction.user.displayAvatarURL(),
            });

          await i.update({ embeds: [acceptedEmbed], components: [] });
        } else if (i.customId === "decline") {
          const declinedEmbed = new EmbedBuilder()
            .setTitle("Передача денег")
            .setDescription(
              `Передача денег пользователю ${user.username} была отменена.`
            )
            .setTimestamp()
            .setThumbnail(user.displayAvatarURL())
            .setAuthor({
              name: interaction.user.username,
              iconURL: interaction.user.displayAvatarURL(),
            });

          await i.update({ embeds: [declinedEmbed], components: [] });
        }
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          const timeoutEmbed = new EmbedBuilder()
            .setTitle("Передача денег")
            .setDescription(`Время на подтверждение передачи денег истекло.`)
            .setTimestamp()
            .setThumbnail(user.displayAvatarURL())
            .setAuthor({
              name: interaction.user.username,
              iconURL: interaction.user.displayAvatarURL(),
            });

          interaction.editReply({ embeds: [timeoutEmbed], components: [] });
        }
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "Произошла ошибка при выполнении команды",
        ephemeral: true,
      });
    }
  },
};

module.exports = [balanceCommand, giveCommand];
