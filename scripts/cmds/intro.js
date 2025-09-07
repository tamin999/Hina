const fs = require("fs-extra");
const https = require("https");
const path = require("path");

const imgUrl = "https://i.imgur.com/5euxmJE.jpeg";
const imgPath = path.join(__dirname, "cache", "intro.jpg");

fs.ensureDirSync(path.dirname(imgPath));

const introCaptions = [
  "তুই কেডা?",
  "পরিচয় দে!",
  "তোর নাম কী রে?",
  "এতদিন কোথায় ছিলি?",
  "চিনতে পারছি না, কে তুই?",
  "বন্ধু হবি?",
  "তুই কি আগেও আসছিলি?",
  "বস তোর নামটা বল!",
  "কে রে তুই?",
  "নতুন মুখ দেখতেছি!"
];

async function downloadImage(url, dest) {
  const file = fs.createWriteStream(dest);
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`Failed to get ${url}, status: ${res.statusCode}`));
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

module.exports = {
  config: {
    name: "intro",
    aliases: [],
    version: "1.2",
    author: "Azad",
    countDown: 2,
    role: 0,
    shortDescription: { en: "Send intro image (no prefix)" },
    longDescription: { en: "Send a styled intro image with Bangla caption. Mention works via tag or reply." },
    category: "fun",
    guide: { en: "Say: intro | intro @tag | reply intro" },
    usePrefix: true,
    useChat: true
  },

  onStart: async function () {},

  onChat: async function ({ event, message, api }) {
    const body = event.body?.toLowerCase().trim();
    if (!body || !/^intro(\s|$)/.test(body)) return;

    if (!fs.existsSync(imgPath)) await downloadImage(imgUrl, imgPath);

    const caption = introCaptions[Math.floor(Math.random() * introCaptions.length)];
    let finalCaption = `🧸 ${caption}`;
    const mentions = [];

    if (event.mentions && Object.keys(event.mentions).length > 0) {
      for (const [uid, name] of Object.entries(event.mentions)) {
        finalCaption += ` ${name}`;
        mentions.push({ tag: name, id: uid });
      }
    } else if (event.type === "message_reply" && event.messageReply?.senderID) {
      const uid = event.messageReply.senderID;
      let name = "Unknown";
      try {
        const userInfo = await api.getUserInfo(uid);
        name = userInfo?.[uid]?.name || "Unknown";
      } catch (e) {
        console.error("Failed to fetch user info:", e.message);
      }
      finalCaption += ` ${name}`;
      mentions.push({ tag: name, id: uid });
    }

    return message.reply({
      body: finalCaption,
      attachment: fs.createReadStream(imgPath),
      mentions
    });
  }
};
