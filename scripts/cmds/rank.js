const { loadImage, createCanvas, registerFont } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

// ===== FONT LOAD WITH FALLBACK =====
const fontPath = path.join(__dirname, "fonts", "Montserrat-Bold.ttf");
let fontFamily = "sans-serif";
if (fs.existsSync(fontPath)) {
  try {
    registerFont(fontPath, { family: "Montserrat" });
    fontFamily = "Montserrat";
    console.log("Custom font loaded.");
  } catch (e) {
    console.warn("Failed to load custom font, using system font.");
  }
}

// ===== DEFAULT AVATAR =====
const defaultAvatarPath = path.join(__dirname, "default-avatar.png");
if (!fs.existsSync(defaultAvatarPath)) {
  console.warn("Warning: default-avatar.png not found. Avatar may fail.");
}

module.exports = {
  config: {
    name: "rank",
    aliases: ["profile", "level"],
    version: "0.8",
    author: "°Azad°",
    role: 0,
    shortDescription: { en: "Display user profile" },
    longDescription: { en: "Show user's level, EXP, money, and stats in image format with a subtle glow effect." },
    category: "info",
    guide: { en: "{p}rank" }
  },

  onStart: async ({ api, event, message, usersData }) => {
    try {
      const userID = event.senderID;
      const userData = (await usersData.get(userID)) || {};

      // ===== USER INFO =====
      const name = userData.name || "Unknown";
      const money = userData.money || 0;
      const exp = userData.exp || 0;
      const level = userData.level || 1;
      const messageCount = userData.messageCount || 0;

      // ===== EXP SYSTEM =====
      const expNeeded = level * 1000;
      const expProgress = Math.min(exp / expNeeded, 1);

      // ===== RANK SYSTEM =====
      const allUsers = (await usersData.getAll()) || [];
      const sortByStat = (arr, stat) => [...arr].sort((a, b) => (b[stat] || 0) - (a[stat] || 0));
      const getRank = (list, id) => {
        const idx = list.findIndex(u => (u.id || u.userID) === id);
        return idx !== -1 ? `#${idx + 1}` : "N/A";
      };
      const expRank = getRank(sortByStat(allUsers, "exp"), userID);
      const moneyRank = getRank(sortByStat(allUsers, "money"), userID);

      // ===== CANVAS =====
      const canvas = createCanvas(1000, 600);
      const ctx = canvas.getContext("2d");

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 1000, 600);
      gradient.addColorStop(0, "#0b0024");
      gradient.addColorStop(1, "#18003a");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();
      }

      // Border glow
      ctx.strokeStyle = "#00faff";
      ctx.lineWidth = 8;
      ctx.shadowColor = "#00faff";
      ctx.shadowBlur = 20;
      ctx.strokeRect(20, 20, 960, 560);
      ctx.shadowBlur = 0;

      // ===== ANIMATED LIGHT EFFECT =====
      const lightGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      const lightPos = Math.random();
      lightGradient.addColorStop(Math.max(0, lightPos - 0.1), "rgba(0,255,255,0)");
      lightGradient.addColorStop(lightPos, "rgba(0,255,255,0.2)");
      lightGradient.addColorStop(Math.min(1, lightPos + 0.1), "rgba(0,255,255,0)");
      ctx.fillStyle = lightGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ===== HEXAGON AVATAR =====
      const drawHexagon = (x, y, radius) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const px = x + radius * Math.cos(angle);
          const py = y + radius * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      };

      let avatar;
      try {
        const avatarURL = typeof usersData.getAvatarUrl === "function" ? await usersData.getAvatarUrl(userID) : null;
        avatar = await loadImage(avatarURL || defaultAvatarPath);
      } catch {
        avatar = await loadImage(defaultAvatarPath);
      }

      ctx.save();
      drawHexagon(500, 170, 110);
      ctx.clip();
      ctx.drawImage(avatar, 390, 60, 220, 220);
      ctx.restore();

      // Hex border glow
      ctx.strokeStyle = "#00cfff";
      ctx.lineWidth = 6;
      ctx.shadowColor = "#00cfff";
      ctx.shadowBlur = 15;
      drawHexagon(500, 170, 110);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ===== TEXT =====
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold 40px ${fontFamily}`;
      ctx.fillText(name, 500, 320);

      // ===== LEFT INFO =====
      ctx.textAlign = "left";
      ctx.fillStyle = "#00d8ff";
      ctx.font = `22px ${fontFamily}`;
      let infoY = 380;
      const leftX = 80;
      const lineGap = 40;

      const leftTexts = [
        `🆔 UID: ${userID}`,
        `💬 Nickname: ${name}`,
        `⭐ Level: ${level}`
      ];

      leftTexts.forEach(txt => {
        ctx.shadowColor = "#00d8ff";
        ctx.shadowBlur = 10;
        ctx.fillText(txt, leftX, infoY);
        ctx.shadowBlur = 0;
        infoY += lineGap;
      });

      // ===== RIGHT INFO =====
      ctx.textAlign = "right";
      ctx.fillStyle = "#ff9dff";
      ctx.font = `22px ${fontFamily}`;
      infoY = 380;
      const rightX = 920;

      const rightTexts = [
        `⚡ EXP: ${exp}`,
        `🏆 Rank: ${expRank}`,
        `💰 Money: ${money}`,
        `💲 Money Rank: ${moneyRank}`,
        `✉️ Messages: ${messageCount}`
      ];

      rightTexts.forEach(txt => {
        ctx.shadowColor = "#ff9dff";
        ctx.shadowBlur = 10;
        ctx.fillText(txt, rightX, infoY);
        ctx.shadowBlur = 0;
        infoY += lineGap;
      });

      // ===== EXP BAR =====
      const barX = 300;
      const barY = 520;
      const barWidth = 400;
      const barHeight = 20;

      ctx.fillStyle = "#222";
      ctx.fillRect(barX, barY, barWidth, barHeight);

      ctx.fillStyle = "#00ffcc";
      ctx.shadowColor = "#00ffcc";
      ctx.shadowBlur = 15;
      ctx.fillRect(barX, barY, barWidth * expProgress, barHeight);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = `18px ${fontFamily}`;
      ctx.fillText(`${exp} / ${expNeeded} EXP`, barX + barWidth / 2, barY - 10);

      // ===== FOOTER =====
      ctx.fillStyle = "#aaa";
      ctx.font = `16px ${fontFamily}`;
      ctx.fillText(`Updated: ${new Date().toLocaleString()}`, 500, 580);

      // ===== SAVE + SEND =====
      const imgBuffer = canvas.toBuffer("image/png");
      const tempDir = path.join(__dirname, "temp");
      fs.ensureDirSync(tempDir);
      const filePath = path.join(tempDir, `${userID}_rank.png`);
      await fs.promises.writeFile(filePath, imgBuffer);

      try {
        await message.reply({
          body: "",
          attachment: fs.createReadStream(filePath)
        });
      } finally {
        await fs.promises.rm(filePath, { force: true });
      }

    } catch (err) {
      console.error("Error generating rank image:", err);
      await message.reply(`Failed to generate rank image.\nError: ${err.message}`);
    }
  }
};
