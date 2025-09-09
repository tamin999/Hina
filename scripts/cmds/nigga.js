
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "nigga", // ✅ renamed
    aliases: ["burn"],
    version: "1.2",
    author: "nexo_here",
    countDown: 2,
    role: 0,
    description: "Send a roast image using UID",
    category: "fun",
    guide: {
      en: "{pn} @mention\nOr use without mention to roast yourself."
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const mention = Object.keys(event.mentions || {});
      const targetUID = mention.length > 0 ? mention[0] : event.senderID;

      // ✅ fixed URL with backticks
      const url = `https://betadash-api-swordslush-production.up.railway.app/roast?userid=${targetUID}`;
      const response = await axios.get(url, { responseType: "arraybuffer" });

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const filePath = path.join(cacheDir, `roast_${targetUID}.jpg`);
      fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

      api.sendMessage(
        {
          body: "🔥 Here's a roast just for you 😂",
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error("Failed to delete cache file:", err.message);
          }
        },
        event.messageID
      );
    } catch (e) {
      console.error("Error:", e.message);
      api.sendMessage(
        "❌ Couldn't generate roast image. Try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
