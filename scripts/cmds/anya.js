const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "anya",
    aliases: [],
    author: "kshitiz",
    version: "2.0",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: ""
    },
    longDescription: {
      en: "Chat with Anya Forger"
    },
    category: "ai",
    guide: {
      en: "{p}{n} [text]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const { createReadStream, unlinkSync } = fs;
      const { resolve } = path;
      const { threadID, senderID } = event;

      // Get user's first name
      const getUserInfo = async (api, userID) => {
        try {
          const userInfo = await api.getUserInfo(userID);
          return userInfo[userID]?.firstName || "";
        } catch (error) {
          console.error(Error fetching user info: ${error});
          return "";
        }
      };

      const greetingStart = "Konichiwa";
      const greetingEnd = "senpai";
      const userFirstName = await getUserInfo(api, senderID);
      const greetingMessage = ${greetingStart} ${userFirstName} ${greetingEnd};

      const chat = args.join(" ");

      if (!args[0]) {
        return message.reply(greetingMessage);
      }

      // Translate to Japanese using Google Translate API
      const tranChat = await axios.get(
        https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&q=${encodeURIComponent(chat)}
      );

      const translatedText = tranChat.data[0][0][0]; // Translated text
      const audioPath = resolve(__dirname, "cache", ${threadID}_${senderID}.wav);

      // Call Voicevox API for TTS
      const voiceRes = await axios.get(
        https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(translatedText)}&speaker=3
      );

      const audioUrl = voiceRes.data.mp3StreamingUrl;

      // Check for download function
      if (typeof global.utils.downloadFile !== "function") {
        throw new Error("global.utils.downloadFile is not defined");
      }

      await global.utils.downloadFile(audioUrl, audioPath);

      const audioStream = createReadStream(audioPath);

      message.reply(
        {
          body: translatedText,
          attachment: audioStream
        },
        threadID,
        () => unlinkSync(audioPath)
      );
    } catch (error) {
      console.error(error);
      message.reply("An error occurred while processing your request.");
    }
  }
};
