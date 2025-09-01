module.exports = {
  config: {
    name: "neko",
    aliases: ["nk"],
    version: "3.0",
    author: "Starboy",
    countDown: 3,
    role: 0,
    shortDescription: "Get a neko anime girl 🐱",
    longDescription: "Sends a random neko anime image using multiple APIs",
    category: "fun",
    guide: "{pn} or {pn} nk"
  },

  onStart: async function ({ api, event }) {
    const axios = require("axios");

    const apis = [
      {
        name: "waifu.pics",
        url: "https://api.waifu.pics/sfw/neko",
        parse: res => res?.data?.url
      },
      {
        name: "waifu.im",
        url: "https://api.waifu.im/random/?is_nsfw=false&included_tags=neko",
        parse: res => res?.data?.images?.[0]?.url
      },
      {
        name: "neko-love",
        url: "https://neko-love.xyz/api/v1/neko",
        parse: res => res?.data?.url
      },
      {
        name: "nekos.best",
        url: "https://nekos.best/api/v2/neko",
        parse: res => res?.data?.results?.[0]?.url
      }
    ];

    // 🔀 Shuffle APIs to randomize
    const shuffledApis = apis.sort(() => 0.5 - Math.random());

    let imageUrl = null;
    let successApi = null;

    for (const apiEntry of shuffledApis) {
      try {
        const res = await axios.get(apiEntry.url);
        const parsedUrl = apiEntry.parse(res);

        if (parsedUrl) {
          imageUrl = parsedUrl;
          successApi = apiEntry.name;
          break;
        }
      } catch (err) {
        console.warn(`⚠️ ${apiEntry.name} failed:`, err.response?.data || err.message);
      }
    }

    if (!imageUrl) {
      return api.sendMessage(
        "😿 Couldn't fetch a neko image from any source.",
        event.threadID
      );
    }

    // ✅ Send image
    api.sendMessage(
      {
        body: `Here's your neko 🐱 (from ${successApi})`,
        attachment: await global.utils.getStreamFromURL(imageUrl)
      },
      event.threadID
    );
  }
};
