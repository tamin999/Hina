const axios = require("axios");

module.exports = {
  config: {
    name: "emojimix",
    version: "1.0",
    author: "Raihan Fiba",
    countDown: 5,
    role: 0,
    description: {
      en: "Mix two emojis into one cool image"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      if (args.length < 2) {
        return api.sendMessage("𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝘁𝘄𝗼 𝗲𝗺𝗼𝗷𝗶𝘀 𝘁𝗼 𝗺𝗶𝘅.\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: !emojimix 🙂 🎉", event.threadID, event.messageID);
      }

      const emoji1 = encodeURIComponent(args[0]);
      const emoji2 = encodeURIComponent(args[1]);

      const processingMsg = await api.sendMessage("𝗪𝗮𝗶𝘁 𝗺𝗶𝘅𝗶𝗻𝗴 𝗲𝗺𝗼𝗷𝗶...", event.threadID);

      const res = await axios.get(`https://kaiz-apis.gleeze.com/api/emojimix?emoji1=${emoji1}&emoji2=${emoji2}&apikey=f2ce3b96-a3a7-4693-a19e-3daf4aa64675`, {
        responseType: "arraybuffer"
      });

      const imageBuffer = Buffer.from(res.data, "binary");

      api.unsendMessage(processingMsg.messageID);

      return api.sendMessage({
        body: `𝗛𝗲𝗿𝗲 𝗶𝘀 𝘆𝗼𝘂𝗿 𝗘𝗺𝗼𝗷𝗶𝗠𝗶𝘅!`,
        attachment: imageBuffer
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗲 𝗘𝗺𝗼𝗷𝗶𝗠𝗶𝘅.\n𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿.", event.threadID, event.messageID);
    }
  }
};
