const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "affect",
    version: "1.1",
    author: "NIB",
    countDown: 5,
    role: 0,
    shortDescription: "Affect image",
    longDescription: "Affect image",
    category: "fun",
    guide: "{pn} [@tag]"
  },

  langs: {
    en: {
      noTag: "⚠️ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗮𝗴 𝘀𝗼𝗺𝗲𝗼𝗻𝗲 𝘆𝗼𝘂 𝘄𝗮𝗻𝘁 𝘁𝗼 𝘁𝗿𝘆! 🙏"
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {
    const uid = Object.keys(event.mentions)[0];
    if (!uid) return message.reply(getLang("noTag"));

    const avatarURL = await usersData.getAvatarUrl(uid);
    const img = await new DIG.Affect().getImage(avatarURL);
    const pathSave = `${__dirname}/tmp/${uid}_Affect.png`;
    fs.writeFileSync(pathSave, Buffer.from(img));

    message.reply(
      {
        body: "🐸 𝐭𝐨𝐫 𝐛𝐨𝐛𝐢𝐬𝐬𝐡𝐨𝐭",
        attachment: fs.createReadStream(pathSave)
      },
      () => fs.unlinkSync(pathSave)
    );
  }
};
