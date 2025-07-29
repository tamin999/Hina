const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair2",
    version: "1.0.0",
    author: "Starboy",
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
      en: "{pn}"
    }
  },

  onStart: async function({ api, event, usersData }) {
    const { loadImage, createCanvas } = require("canvas");

    const pathImg = __dirname + "/assets/background.png";
    const pathAvt1 = __dirname + "/assets/any.png";
    const pathAvt2 = __dirname + "/assets/avatar.png";

    const id1 = event.senderID;
    const name1 = await usersData.getName(id1);

    // Get thread info (users in the thread)
    const ThreadInfo = await api.getThreadInfo(event.threadID);
    const allUsers = ThreadInfo.userInfo;

    // Find gender of sender
    let gender1 = null;
    for (let user of allUsers) {
      if (user.id === id1) {
        gender1 = user.gender;
        break;
      }
    }

    const botID = api.getCurrentUserID();

    // Filter candidates based on gender preference
    let candidates = [];
    if (gender1 === "FEMALE") {
      candidates = allUsers.filter(u => u.gender === "MALE" && u.id !== id1 && u.id !== botID).map(u => u.id);
    } else if (gender1 === "MALE") {
      candidates = allUsers.filter(u => u.gender === "FEMALE" && u.id !== id1 && u.id !== botID).map(u => u.id);
    } else {
      candidates = allUsers.filter(u => u.id !== id1 && u.id !== botID).map(u => u.id);
    }

    if (candidates.length === 0) {
      return api.sendMessage("Sorry, no suitable partners found in the chat 😢", event.threadID);
    }

    // Pick random partner
    const id2 = candidates[Math.floor(Math.random() * candidates.length)];
    const name2 = await usersData.getName(id2);

    // Generate a "link percentage"
    const randomScores = ["0", "-1", "99,99", "-99", "-100", "101", "0,01"];
    const scoresPool = Array(10).fill(randomScores[Math.floor(Math.random() * randomScores.length)]);
    const tile = scoresPool[Math.floor(Math.random() * scoresPool.length)];

    // Background image URL
    const backgroundURL = "https://i.ibb.co/RBRLmRt/Pics-Art-05-14-10-47-00.jpg";

    // Download avatars and background images as buffers
    const avatar1Buffer = (await axios.get(
      `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    )).data;
    fs.writeFileSync(pathAvt1, Buffer.from(avatar1Buffer));

    const avatar2Buffer = (await axios.get(
      `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    )).data;
    fs.writeFileSync(pathAvt2, Buffer.from(avatar2Buffer));

    const backgroundBuffer = (await axios.get(backgroundURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(backgroundBuffer));

    // Load images into canvas
    const baseImage = await loadImage(pathImg);
    const baseAvt1 = await loadImage(pathAvt1);
    const baseAvt2 = await loadImage(pathAvt2);

    // Create canvas and draw images
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseAvt1, 111, 175, 330, 330);
    ctx.drawImage(baseAvt2, 1018, 173, 330, 330);

    // Write canvas to buffer and save to file
    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    // Remove avatars temporary files
    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    // Send message with image and mentions
    return api.sendMessage({
      body: `『💗』Congratulations ${name1} 『💗』\n❤️ Looks like your destiny brought you together with ${name2} ❤️\n🔗 Your link percentage is ${tile}% 🔗`,
      mentions: [
        { tag: name2, id: id2 },
        { tag: name1, id: id1 }
      ],
      attachment: fs.createReadStream(pathImg)
    }, event.threadID, () => {
      fs.unlinkSync(pathImg); // Delete the image file after sending
    }, event.messageID);
  }
};
