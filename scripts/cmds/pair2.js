const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair2",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Get to know your partner",
    },
    longDescription: {
      en: "Know your destiny and who you will complete your life with",
    },
    category: "love",
    guide: {
      en: "{pn}",
    },
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const { threadID, messageID, senderID } = event;
      const { loadImage, createCanvas } = require("canvas");
      const path = require("path");

      let pathImg = path.join(__dirname, "assets", "background.png");
      let pathAvt1 = path.join(__dirname, "assets", "any.png");
      let pathAvt2 = path.join(__dirname, "assets", "avatar.png");

      const id1 = senderID;
      const name1 = await usersData.getName(id1);
      const threadInfo = await api.getThreadInfo(threadID);
      const all = threadInfo.userInfo;
      let gender1;
      for (const c of all) {
        if (c.id == id1) gender1 = c.gender;
      }
      const botID = api.getCurrentUserID();

      let candidates = [];
      if (gender1 === "FEMALE") {
        candidates = all.filter(u => u.gender === "MALE" && u.id !== id1 && u.id !== botID).map(u => u.id);
      } else if (gender1 === "MALE") {
        candidates = all.filter(u => u.gender === "FEMALE" && u.id !== id1 && u.id !== botID).map(u => u.id);
      } else {
        candidates = all.filter(u => u.id !== id1 && u.id !== botID).map(u => u.id);
      }

      if (candidates.length === 0) {
        return api.sendMessage("😕 No matching partner found!", threadID, messageID);
      }

      const id2 = candidates[Math.floor(Math.random() * candidates.length)];
      const name2 = await usersData.getName(id2);

      const rd1 = Math.floor(Math.random() * 100) + 1;
      const cc = ["0", "-1", "99,99", "-99", "-100", "101", "0,01"];
      const djtme = Array(7).fill(rd1).concat([cc[Math.floor(Math.random() * cc.length)]]);
      const tile = djtme[Math.floor(Math.random() * djtme.length)];

      const background = [
        "https://i.ibb.co/RBRLmRt/Pics-Art-05-14-10-47-00.jpg"
      ];

      // Download avatars & background images properly (without utf-8 encoding)
      let getAvt1 = (
        await axios.get(
          https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662,
          { responseType: "arraybuffer" }
        )
      ).data;
      await fs.writeFile(pathAvt1, Buffer.from(getAvt1));

      let getAvt2 = (
        await axios.get(
          https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662,
          { responseType: "arraybuffer" }
        )
      ).data;
      await fs.writeFile(pathAvt2, Buffer.from(getAvt2));

      let getBackground = (
        await axios.get(background[0], { responseType: "arraybuffer" })
      ).data;
      await fs.writeFile(pathImg, Buffer.from(getBackground));

      // Compose canvas
      const baseImage = await loadImage(pathImg);
      const baseAvt1 = await loadImage(pathAvt1);
      const baseAvt2 = await loadImage(pathAvt2);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseAvt1, 111, 175, 330, 330);
      ctx.drawImage(baseAvt2, 1018, 173, 330, 330);

      const imageBuffer = canvas.toBuffer();
      await fs.writeFile(pathImg, imageBuffer);

      // Remove avatar temp files
      await fs.remove(pathAvt1);
      await fs.remove(pathAvt2);

      // Send message
      return api.sendMessage(
        {
          body: 🎀 Congratulations ${name1} 🎀\n❤️ Looks like your destiny brought you together with ${name2} ❤️\n🔗 Your link percentage is ${tile}% 🔗,
          mentions: [
            { tag: name2, id: id2 },
            { tag: name1, id: id1 },
          ],
          attachment: fs.createReadStream(pathImg),
        },
        threadID,
        () => fs.unlinkSync(pathImg),
        messageID
      );

    } catch (error) {
      console.error("pair2 error:", error);
      return api.sendMessage("❌ An error occurred while processing your request.", event.threadID, event.messageID);
    }
  },
};
