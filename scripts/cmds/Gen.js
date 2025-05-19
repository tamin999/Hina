module.exports = {
  config: {
    name: "gen",
    aliases: [""],
    version: "0.1",
    role: 0,
    author: "AB IR",
    description: "Generate images",
    category: "Image Generator",
    countDown: 10,
  },

  onStart: async function ({ message, event, args, api }) {
    try {
      const prompt = args.join(" ").trim();
      if (!prompt) return message.reply("⚠️ Please provide a prompt for the image.");

      const startTime = Date.now();
      const waitingMessage = await message.reply("⏳ Generating image, please wait...");

      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      // Fixed the URL by using backticks for template literals
      const apiUrl = `http://www.arch2devs.ct.ws/api/weigen?prompt=${encodeURIComponent(prompt)}`;
      
      // Fetch image response
      const attachment = await global.utils.getStreamFromURL(apiUrl);

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      await message.unsend(waitingMessage.messageID);

      const endTime = Date.now();
      await message.reply({
        body: `✅ Here's your generated image!\n🕒 Time Taken: ${(endTime - startTime) / 1000} seconds.`,
        attachment,
      });

    } catch (error) {
      console.error("❌ Error generating image:", error);
      message.reply("❌ Error: " + error.message);
    }
  },
};
