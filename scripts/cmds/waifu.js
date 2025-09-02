const axios = require('axios');

module.exports = {
  config: {
    name: "waifu",
    aliases: ["wife"],
    version: "1.0",
    author: "tas3n",
    countDown: 6,
    role: 0,
    shortDescription: "Get random waifu",
    longDescription: "Get waifu: waifu, neko, shinobu, megumin, bully, cuddle, cry, kiss, lick, hug, awoo, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe",
    category: "anime",
    guide: "{pn} <name>"
  }, // ✅ this comma is required

  onStart: async function ({ message, args }) {
    const name = args.join(" ");

    try {
      // If no category given, default to "waifu"
      const endpoint = name || "waifu";
      const res = await axios.get(`https://api.waifu.pics/sfw/${endpoint}`);
      const img = res.data.url;

      const form = {
        body: `   「 𝔀𝓪𝓲𝓯𝓾 」   `
      };

      if (img) {
        form.attachment = await global.utils.getStreamFromURL(img);
      }

      message.reply(form);

    } catch (e) {
      message.reply(
        `⚠️ Not Found\n\nAvailable categories:\nwaifu, neko, shinobu, megumin, bully, cuddle, cry, kiss, lick, hug, awoo, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe`
      );
    }
  }
};
