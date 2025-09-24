const axios = require("axios");

module.exports = {
  config: {
    name: "fflike",
    aliases: ["ffl"],
    version: "1.0",
    author: "Raihan Fiba",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Check Free Fire like info"
    },
    longDescription: {
      en: "Check Free Fire like info using UID and Region"
    },
    category: "games",
    guide: {
      en: "{pn} <uid> <region>\n\nExample:\n{pn} 1135313661 IND"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      if (args.length < 2) {
        return api.sendMessage(
          "❌ Please provide both UID and Region.\nExample: !fflike 1135313661 IND",
          event.threadID,
          event.messageID
        );
      }

      const uid = args[0];
      const region = args[1];

      const res = await axios.get(
        https://api-like-i699.onrender.com/like?uid=${uid}&region=${region}
      );

      const msg = res.data;

      return api.sendMessage(msg, event.threadID, event.messageID);

    } catch (e) {
      console.error(e);
      return api.sendMessage(
        "❌ Failed to fetch Free Fire like info.",
        event.threadID,
        event.messageID
      );
    }
  }
};
