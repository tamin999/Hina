const Jimp = require("jimp");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
    config: {
        name: "arrest",
        aliases: ["ar"],
        version: "1.4",
        author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎ & Raihan Fiba",
        countDown: 5,
        role: 0,
        shortDescription: "arrest",
        longDescription: "Arrest someone with style",
        category: "fun",
        guide: "{pn} tag or reply"
    },

    onStart: async function ({ api, message, event, usersData }) {
        const uid = event.senderID;
        const mention = Object.keys(event.mentions);
        const uid1 = mention[0];
        const uid2 = event.messageReply ? event.messageReply.senderID : null;
        const uids = uid1 || uid2;

        if (!uids) return message.reply("😤 | Tag or reply to someone you want to arrest.");

        let two = uid, one = uids;
        if (mention.length === 2) {
            one = mention[1];
            two = mention[0];
        }

        try {
            const avatarURL1 = await usersData.getAvatarUrl(one);
            const avatarURL2 = await usersData.getAvatarUrl(two);

            if (!avatarURL1 || !avatarURL2) {
                return message.reply("Couldn't fetch user avatars.");
            }

            const avatar1 = await Jimp.read((await axios({ url: avatarURL1, responseType: "arraybuffer" })).data);
            const avatar2 = await Jimp.read((await axios({ url: avatarURL2, responseType: "arraybuffer" })).data);

            const background = await Jimp.read("https://i.ibb.co/LXG5dGRZ/image.jpg");
            background.resize(645, 475);

            avatar1.resize(100, 100).circle();
            avatar2.resize(110, 110).circle();

            background.composite(avatar1, 175, 50);
            background.composite(avatar2, 375, 20);

            const imagePath = path.join(__dirname, "tmp", `${one}_${two}_arrest.png`);
            await background.writeAsync(imagePath);

            // Premium bold serif style text
            const premiumText = "🎀 𝗽𝗼𝗼𝗸𝗶𝗲 𝗮𝗿𝗿𝗲𝘀𝘁𝗲𝗱";

            message.reply({
                body: premiumText,
                attachment: fs.createReadStream(imagePath)
            }, () => fs.unlinkSync(imagePath));

        } catch (error) {
            console.error(error);
            message.reply("Something went wrong while generating the image.");
        }
    }
};
