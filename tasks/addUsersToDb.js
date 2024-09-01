const User = require("../models/User"); // Импорт модели User из файла user.js
const config = require("../config.json");
const { setIntervalInSeconds } = require("../handlers/utils"); // Импорт функции
const connectMongoDB = require("../db"); // Импорт функции подключения к MongoDB

async function addUsersToDb(client) {
  const guild = client.guilds.cache.get(config.guildId); // Извлекаем ID сервера из конфигурации
  if (!guild) {
    console.error("Guild not found");
    return;
  }

  const members = await guild.members.fetch();

  for (const member of members.values()) {
    if (member.user.bot) {
      // console.log(
      //  `Skipping bot user: ${member.user.username}#${member.user.discriminator}`
      //);
      continue;
    }

    const user = new User({
      userId: member.user.id,
      username: member.user.username,
      profile: {}, // Пустой профиль, который будет заполнен значениями по умолчанию
    });

    try {
      await user.save();
      // console.log(
      //   `Added ${member.user.username}#${member.user.discriminator} to the database`
      // );
    } catch (err) {
      if (err.code === 11000) {
        //  console.log(
        //    `User ${member.user.username}#${member.user.discriminator} already exists in the database`
        // );
      } else {
        console.error(
          `Failed to add ${member.user.username}#${member.user.discriminator} to the database`,
          err
        );
      }
    }
  }
}

module.exports = async (client) => {
  await connectMongoDB(config.mongoURI); // Подключение к MongoDB

  addUsersToDb(client);

  setIntervalInSeconds(() => {
    addUsersToDb(client);
  }, 30); // 30 секунд
};
