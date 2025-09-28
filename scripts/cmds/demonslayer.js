
const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');
const { shortenURL } = global.utils;

async function animeSong(api, event, args, message) {
    api.setMessageReaction("🤍", event.messageID, (err) => {}, true);
    try {
        const animeSongResponse = await axios.get("https://demon-slayer-nu.vercel.app/kshitiz");
        const videoUrl = animeSongResponse.data.videoUrl;

        const downloadResponse = await axios.get(`https://youtube-kshitiz.vercel.app/download?id=${encodeURIComponent(videoUrl)}`);
        if (downloadResponse.data.length === 0) {
            message.reply("Failed to retrieve download link for the video.");
            return;
        }

        const videoDownloadUrl = downloadResponse.data[0];

        const writer = fs.createWriteStream(path.join(__dirname, "cache", `ds.mp4`));
        const response = await axios({
            url: videoDownloadUrl,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        writer.on('finish', async () => {
            const audioFile = path.join(__dirname, "cache", "ds.mp4");
            const audioReadStream = fs.createReadStream(audioFile);
            const shortUrl = await shortenURL(videoDownloadUrl);
            message.reply({ body: `🎧 demon slayer\nDownload Link: ${shortUrl}`, attachment: audioReadStream });
            api.setMessageReaction("✅", event.messageID, () => {}, true);
        });

        writer.on('error', (error) => {
            console.error("Error:", error);
            message.reply("Error occurred while downloading the video.");
        });
    } catch (error) {
        console.error("Error:", error);
        message.reply("Error occurred.");
    }
}

module.exports = {
    config: {
        name: "ds",
        aliases: ["demonslayer"],
        version: "1.0",
        author: "Vex_Kshitiz",
        countDown: 10,
        role: 0,
        shortDescription: "demon slayer",
        longDescription: "get demon slayer anime edits",
        category: "anime",
        guide: "{p}ds"
    },
    onStart: function ({ api, event, args, message }) {
        return animeSong(api, event, args, message);
    }
};
