const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "pair",
    author: 'Nyx x Ariyan',
    category: "tools"
  },

  onStart: async function({ api, event, usersData }) {
    try {
      const senderID = event.senderID;
      const senderData = await usersData.get(senderID);
      const senderName = senderData.name;

      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;

      const myData = users.find(user => user.id === senderID);
      if (!myData || !myData.gender) {
        return api.sendMessage("❌ Undefined gender, cannot find match.", event.threadID, event.messageID);
      }

      const myGender = myData.gender;
      let matchCandidates = [];

      if (myGender === "MALE") {
        matchCandidates = users.filter(user => user.gender === "FEMALE" && user.id !== senderID);
      } else if (myGender === "FEMALE") {
        matchCandidates = users.filter(user => user.gender === "MALE" && user.id !== senderID);
      } else {
        return api.sendMessage("❌ Undefined gender, cannot find match.", event.threadID, event.messageID);
      }

      if (matchCandidates.length === 0) {
        return api.sendMessage("😔 No suitable match found in the group.", event.threadID, event.messageID);
      }

      const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
      const matchName = selectedMatch.name;
      const lovePercentage = Math.floor(Math.random() * 100) + 1;

      // Create canvas
      const width = 800, height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      const background = await loadImage("https://i.postimg.cc/tRFY2HBm/0602f6fd6933805cf417774fdfab157e.jpg");

      const getAvatarBuffer = async (uid) => {
        const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
        return await loadImage(response.data);
      };

      const senderAvatar = await getAvatarBuffer(senderID);
      const matchAvatar = await getAvatarBuffer(selectedMatch.id);

      ctx.drawImage(background, 0, 0, width, height);
      ctx.drawImage(senderAvatar, 385, 40, 170, 170);
      ctx.drawImage(matchAvatar, width - 213, 190, 180, 170);

      const outputPath = path.join(__dirname, 'pair_output.png');
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on('finish', async () => {
        const message =
          `🥰 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 𝐏𝐚𝐢𝐫𝐢𝐧𝐠 🥰\n\n` +
          `🎀 ${senderName}\n` +
          `🎀 ${matchName}\n\n` +
          `💌 𝐖𝐢𝐬𝐡 𝐲𝐨𝐮 𝐛𝐨𝐭𝐡 𝐥𝐨𝐯𝐞 𝐚𝐧𝐝 𝐡𝐚𝐩𝐩𝐢𝐧𝐞𝐬𝐬 𝐟𝐨𝐫 𝐚 𝐡𝐮𝐧𝐝𝐫𝐞𝐝 𝐲𝐞𝐚𝐫𝐬!\n\n` +
          `💖 𝐋𝐨𝐯𝐞 𝐏𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞: ${lovePercentage}% 💖`;

        await api.sendMessage({
          body: message,
          attachment: fs.createReadStream(outputPath)
        }, event.threadID, async () => {
          await fs.promises.unlink(outputPath);
        }, event.messageID);
      });

    } catch (error) {
      console.error("pair error:", error);
      return api.sendMessage("❌ An error occurred: " + error.message, event.threadID, event.messageID);
    }
  }
};
