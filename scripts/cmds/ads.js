const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "ads",
    version: "1.0",
    author: "Samir B. Thakuri",
    countDown: 1,
    role: 0,
    shortDescription: "Advertisement!",
    longDescription: "",
    category: "fun",
    guide: "{pn} [mention|leave_blank]",
    envConfig: {
      deltaNext: 5
    }
  },

  langs: {
    vi: {
      noTag: "🔔 𝐁𝐚̣̂𝐭 𝐛𝐮̛́𝐭 𝐜𝐡𝐨 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐦𝐮𝐨̂́𝐧 𝐭𝐚́𝐭 𝐧𝐡𝐞́! 🚨"
    },
    en: {
      noTag: "🔔 𝗧𝗮𝗴 𝘁𝗵𝗲 𝗽𝗲𝗿𝘀𝗼𝗻 𝘆𝗼𝘂 𝘄𝗮𝗻𝘁 𝘁𝗼 𝗮𝗱𝘃𝗲𝗿𝘁𝗶𝘀𝗲! 🚨"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    let mention = Object.keys(event.mentions);
    let uid;

    if (event.type == "message_reply") {
      uid = event.messageReply.senderID;
    } else {
      if (mention[0]) {
        uid = mention[0];
      } else {
        uid = event.senderID;
      }
    }

    let url = await usersData.getAvatarUrl(uid);
    let avt = await new DIG.Ad().getImage(url);

    const pathSave = `${__dirname}/tmp/ads.png`;
    fs.writeFileSync(pathSave, Buffer.from(avt));

    let body;
    if (!mention[0]) {
      body = "✨ 𝐋𝐚𝐭𝐞𝐬𝐭 𝐁𝐫𝐚𝐧𝐝 𝐈𝐧 𝐓𝐡𝐞 𝐌𝐚𝐫𝐤𝐞𝐭 🥳";
    } else {
      body = `✨ 𝐀𝐝𝐯𝐞𝐫𝐭𝐢𝐬𝐢𝐧𝐠 𝐭𝐨: 𝗽𝗿𝗶𝗰𝗲𝗹𝗲𝘀𝘀 𝗯𝗿𝗮𝗻𝗱 𝗼𝗳 𝘁𝗵𝗲 𝘆𝗲𝗮𝗿! 🌟`;
    }

    // Send the image as a reply to the command message
    message.reply(
      {
        body: body,
        attachment: fs.createReadStream(pathSave),
      },
      () => fs.unlinkSync(pathSave)
    );
  },
};
