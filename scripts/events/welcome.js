const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "welcomeimg",
  version: "1.0.2",
  hasPermission: 0,
  credits: "Raihan",
  description: "Premium welcome image with glowing circle and member tag",
  commandCategory: "group",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, Users, Threads }) {
  const threadID = event.threadID;
  const threadInfo = await Threads.getData(threadID) || await api.getThreadInfo(threadID);
  const addedByID = event.senderID;
  const newUserID = event.logMessageData.addedParticipants?.[0]?.userFbId || event.participantID;

  if (!newUserID) return;

  const newUserName = await Users.getNameUser(newUserID);
  const adderName = await Users.getNameUser(addedByID);
  const memberCount = threadInfo.participantIDs.length;
  const groupName = threadInfo.threadName;
  const time = new Date().toLocaleTimeString("en-BD", { timeZone: "Asia/Dhaka", hour12: true });

  const backgroundURL = "https://files.catbox.moe/bjs825.jpe";
  const avatarURL = `https://graph.facebook.com/${newUserID}/picture?width=512&height=512&access_token=EAA...`;

  const canvas = createCanvas(1280, 720);
  const ctx = canvas.getContext("2d");

  // Draw background
  const bg = await loadImage(backgroundURL);
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  // Glowing circle colors
  const centerX = canvas.width / 2;
  const centerY = 260;
  const radius = 110;

  const gradient = ctx.createRadialGradient(centerX, centerY, 70, centerX, centerY, 130);
  gradient.addColorStop(0.2, "#8000ff");  // Purple
  gradient.addColorStop(0.4, "#0050ff");  // Blue
  gradient.addColorStop(0.6, "#73eaff");  // Light Blue
  gradient.addColorStop(1, "#ff0033");    // Red

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 20, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw avatar
  const avatar = await loadImage(avatarURL);
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, centerX - radius, centerY - radius, radius * 2, radius * 2);
  ctx.restore();

  // Write texts
  ctx.textAlign = "center";
  ctx.fillStyle = "white";

  ctx.font = "bold 40px Arial";
  ctx.fillText("🕌 Assalamu Alaikum", centerX, 460);

  ctx.font = "bold 38px Arial";
  ctx.fillText(`✨ Welcome to our ${groupName}`, centerX, 510);

  ctx.font = "bold 32px Arial";
  ctx.fillText(`👤 ${newUserName}`, centerX, 560);
  ctx.fillText(`🙋‍♂️ Added by: ${adderName}`, centerX, 605);
  ctx.fillText(`👥 Total Members: ${memberCount}`, centerX, 650);
  ctx.fillText(`🕒 ${time}`, centerX, 690);

  const outputPath = path.join(__dirname, `welcome-${newUserID}.png`);
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputPath, buffer);

  // Send message with tag
  api.sendMessage({
    body: `👋 Welcome to our group ${groupName}, ${newUserName} ❤️`,
    mentions: [{
      tag: newUserName,
      id: newUserID
    }],
    attachment: fs.createReadStream(outputPath)
  }, threadID, () => fs.unlinkSync(outputPath));
};
