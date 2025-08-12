const axios = require('axios');

async function getStreamFromURL(url) {
  const response = await axios.get(url, { responseType: 'stream' });
  return response.data;
}

async function fetchTikTokVideos(query) {
  try {
    const response = await axios.get(`https://lyric-search-neon.vercel.app/kshitiz?keyword=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = {
  config: {
    name: "anisearch",
    aliases: ["animeedit", "ae"],
    author: "𝐕𝐞𝐱_𝐤𝐬𝐡𝐢𝐭𝐢𝐳 | 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐔𝐈 𝐛𝐲 𝐒𝐚𝐡𝐢𝐧",
    version: "1.3",
    shortDescription: {
      en: "✨ 𝐒𝐞𝐚𝐫𝐜𝐡 & 𝐬𝐞𝐧𝐝 𝐫𝐚𝐧𝐝𝐨𝐦 𝐚𝐧𝐢𝐦𝐞 𝐞𝐝𝐢𝐭 𝐯𝐢𝐝𝐞𝐨𝐬 𝐟𝐫𝐨𝐦 𝐓𝐢𝐤𝐓𝐨𝐤"
    },
    longDescription: {
      en: "𝐒𝐞𝐚𝐫𝐜𝐡 𝐚𝐧𝐢𝐦𝐞 𝐞𝐝𝐢𝐭 𝐯𝐢𝐝𝐞𝐨𝐬 𝐟𝐫𝐨𝐦 𝐓𝐢𝐤𝐓𝐨𝐤 𝐚𝐧𝐝 𝐬𝐞𝐧𝐝 𝐨𝐧𝐞 𝐫𝐚𝐧𝐝𝐨𝐦𝐥𝐲 𝐢𝐧 𝐭𝐡𝐞 𝐜𝐡𝐚𝐭."
    },
    category: "media",
    guide: {
      en: "{p}{n} <𝐚𝐧𝐢𝐦𝐞 𝐧𝐚𝐦𝐞>"
    },
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ").trim();
    if (!query) {
      return api.sendMessage(
        "❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚𝐧 𝐚𝐧𝐢𝐦𝐞 𝐧𝐚𝐦𝐞.\n📌 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: 𝐚𝐧𝐢𝐬𝐞𝐚𝐫𝐜𝐡 𝐧𝐚𝐫𝐮𝐭𝐨",
        event.threadID,
        event.messageID
      );
    }

    api.setMessageReaction("🎀", event.messageID, () => {}, true);
    const modifiedQuery = `${query} anime edit`;

    const videos = await fetchTikTokVideos(modifiedQuery);

    if (!videos || videos.length === 0) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage(
        `⚠️ 𝐍𝐨 𝐫𝐞𝐬𝐮𝐥𝐭𝐬 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫: ${query}`,
        event.threadID,
        event.messageID
      );
    }

    const selectedVideo = videos[Math.floor(Math.random() * videos.length)];
    const videoUrl = selectedVideo.videoUrl;

    if (!videoUrl) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage(
        "⚠️ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐞𝐭𝐜𝐡 𝐭𝐡𝐞 𝐯𝐢𝐝𝐞𝐨.",
        event.threadID,
        event.messageID
      );
    }

    try {
      const videoStream = await getStreamFromURL(videoUrl);

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      await api.sendMessage({
        body: `✨ 𝐀𝐧𝐢𝐦𝐞 𝐄𝐝𝐢𝐭 𝐅𝐨𝐮𝐧𝐝!\n\n📌 𝐒𝐞𝐚𝐫𝐜𝐡: ${query}\n🎥 𝐓𝐢𝐭𝐥𝐞: ${selectedVideo.title || "𝐔𝐧𝐭𝐢𝐭𝐥𝐞𝐝"}\n🔗 𝐒𝐨𝐮𝐫𝐜𝐞: 𝐓𝐢𝐤𝐓𝐨𝐤`,
        attachment: videoStream,
      }, event.threadID, event.messageID);

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage(
        "🚨 𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐭𝐡𝐞 𝐯𝐢𝐝𝐞𝐨.\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.",
        event.threadID,
        event.messageID
      );
    }
  }
};
