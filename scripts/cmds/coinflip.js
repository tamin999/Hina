const axios = require('axios');

module.exports = {
  config: {
    name: "coinflip",
    aliases: ["cf"],
    version: "1.0",
    author: "Loid Butter",
    countDown: 5,
    role: 0,
    shortDescription: "Flip the coin",
    longDescription: "Flip the coin",
    category: "fun", // ✅ fixed quotes
    guide: {
      en: "{pn}"
    },
  },

  onStart: async function ({ message, args, api, event }) {
    const isFaceUp = Math.random() > 0.5;
    let link, body;

    if (isFaceUp) {
      const faceUpLinks = [
        "https://i.ibb.co/xSsMRL9/image.png",
        "https://i.ibb.co/4Zf3M07/image.png",
        "https://i.ibb.co/PCKdPg6/image.png"
      ];
      link = faceUpLinks[Math.floor(Math.random() * faceUpLinks.length)];
      body = "🪙 Coin landed on Heads!";
    } else {
      link = "https://i.ibb.co/FhMwzL9/image.png";
      body = "🪙 Coin landed on Tails!";
    }

    const msg = {
      body,
      attachment: await global.utils.getStreamFromURL(link)
    };

    api.sendMessage(msg, event.threadID, event.messageID);
  }
};
