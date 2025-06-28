const os = require("os");
const fs = require("fs-extra");
const axios = require("axios");
const moment = require("moment-timezone");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "uptime",
    version: "1.8",
    author: "Raihan Fiba",
    countDown: 5,
    role: 0,
    shortDescription: "Cute uptime with red glowing circles",
    longDescription: "Show uptime, CPU, RAM with glowing red visuals at bottom",
    category: "system",
    guide: { en: "uptime" }
  },

  onStart: async function ({ api, event }) {
    const timeNow = moment.tz("Asia/Dhaka");
    const session = getTimeSession(timeNow.hour());
    const uptimeSeconds = process.uptime();
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimePercent = Math.min((uptimeHours / 24) * 100, 100);

    const gcInfo = await api.getThreadInfo(event.threadID);
    const gcName = gcInfo.threadName || "Group Chat";
    const botName = "Hinata 🌷";
    const groupImageUrl = `https://graph.facebook.com/${event.threadID}/picture?height=720&width=720&access_token=${global.GoatBot.config.FB_APPSTATE}`;
    const senderName = (await api.getUserInfo(event.senderID))[event.senderID]?.name || "User";

    const totalMem = os.totalmem() / 1024 / 1024 / 1024;
    const freeMem = os.freemem() / 1024 / 1024 / 1024;
    const usedMem = totalMem - freeMem;
    const cpuLoad = os.loadavg()[0];

    const bg = await loadImage("https://i.imgur.com/zY80wvR.jpeg");
    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Group Avatar
    try {
      const response = await axios.get(groupImageUrl, { responseType: 'arraybuffer' });
      const gcAvatar = await loadImage(response.data);
      ctx.save();
      ctx.beginPath();
      ctx.arc(100, 100, 60, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(gcAvatar, 40, 40, 120, 120);
      ctx.restore();
    } catch (e) {
      console.error("Group image load failed.");
    }

    // Text - Red
    ctx.font = "22px Arial";
    ctx.fillStyle = "#ff4444";
    let y = 200, lh = 36;
    ctx.fillText(`👥 Group: ${gcName}`, 40, y); y += lh;
    ctx.fillText(`🤖 Bot: ${botName}`, 40, y); y += lh;
    ctx.fillText(`👤 User: ${senderName}`, 40, y); y += lh;
    ctx.fillText(`🕓 Time: ${timeNow.format("hh:mm A")} (${session})`, 40, y); y += lh;
    ctx.fillText(`📅 Date: ${timeNow.format("DD MMM YYYY")}`, 40, y); y += lh;

    // Draw Glowing Circles in Center Bottom
    const baseY = 400;
    const radius = 40;
    drawGlowingCircle(ctx, 300, baseY, radius, uptimePercent, "Uptime", `${uptimeHours}h`);
    drawGlowingCircle(ctx, 400, baseY, radius, Math.min(cpuLoad * 10, 100), "CPU", `${cpuLoad.toFixed(1)}%`);
    drawGlowingCircle(ctx, 500, baseY, radius, (usedMem / totalMem) * 100, "RAM", `${usedMem.toFixed(1)}G`);

    // Save & Send
    const path = `${__dirname}/cache/uptime-${event.senderID}.png`;
    fs.writeFileSync(path, canvas.toBuffer());
    return api.sendMessage({
      body: `✨ Bot - Hinata 🌷\n👑 Admin - Raihan`,
      attachment: fs.createReadStream(path)
    }, event.threadID, () => fs.unlinkSync(path), event.messageID);
  }
};

function getTimeSession(hour) {
  if (hour >= 4 && hour < 10) return "Morning";
  if (hour >= 10 && hour < 14) return "Noon";
  if (hour >= 14 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 20) return "Evening";
  return "Night";
}

// Draw circle with red glow
function drawGlowingCircle(ctx, x, y, radius, percent, label, value) {
  const angle = (percent / 100) * Math.PI * 2;

  ctx.save();
  ctx.shadowColor = "#ff0000";
  ctx.shadowBlur = 20;

  // Background circle
  ctx.beginPath();
  ctx.strokeStyle = "#4c4c4c";
  ctx.lineWidth = 6;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Red arc
  ctx.beginPath();
  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 6;
  ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + angle);
  ctx.stroke();

  ctx.restore();

  // Label & value
  ctx.font = "15px Arial";
  ctx.fillStyle = "#ff4444";
  ctx.textAlign = "center";
  ctx.fillText(label, x, y - 10);
  ctx.font = "bold 18px Arial";
  ctx.fillText(value, x, y + 20);
}
