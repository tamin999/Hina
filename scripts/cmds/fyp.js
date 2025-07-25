const ytdl = require("ytdl-core");
const YouTubeAPI = require("simple-youtube-api");
const fs = require("fs-extra");

module.exports.config = {
  name: "fyp",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Raihan",
  description: "Search and send 1 YouTube video directly (FYP style)",
  commandCategory: "media",
  usages: "[keywords]",
  cooldowns: 10,
  dependencies: {
    "ytdl-core": "",
    "simple-youtube-api": "",
    "fs-extra": ""
  },
  envConfig: {
    YOUTUBE_API: "AIzaSyB6pTkV2PM7yLVayhnjDSIM0cE_MbEtuvo"
  }
};

module.exports.run = async function ({ api, event, args }) {
  const youtube = new YouTubeAPI(global.configModule[this.config.name].YOUTUBE_API);

  if (!args[0]) return api.sendMessage("🔎 Please enter keywords to search video.", event.threadID, event.messageID);

  const keyword = args.join(" ");

  try {
    const results = await youtube.searchVideos(keyword, 1);
    if (!results.length) return api.sendMessage("❌ No results found!", event.threadID, event.messageID);

    const video = results[0];
    const id = video.id;
    const title = video.title;
    const filePath = __dirname + `/cache/${id}.mp4`;

    const stream = ytdl(id, { quality: "highestvideo" }).pipe(fs.createWriteStream(filePath));

    stream.on("finish", () => {
      const fileSize = fs.statSync(filePath).size;
      if (fileSize > 26214400) {
        fs.unlinkSync(filePath);
        return api.sendMessage("⚠️ File too large to send on Messenger (over 25MB).", event.threadID, event.messageID);
      }

      return api.sendMessage(
        {
          body: `🎬 ${title}`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );
    });

    stream.on("error", (err) => {
      console.error(err);
      return api.sendMessage("❌ Failed to download video.", event.threadID, event.messageID);
    });
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Error while searching or downloading video.", event.threadID, event.messageID);
  }
};
