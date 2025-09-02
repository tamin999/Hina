const os = require("os");
const fs = require("fs-extra");

const startTime = new Date(); // Track uptime start

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "1.0",
    author: "ArYAN",
    countDown: 0,
    role: 0,
    shortDescription: "Show system uptime and info",
    longDescription: "Get system uptime, memory, users, threads, and ping details.",
    category: "system",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, threadsData, usersData }) {
    try {
      const uptimeInSeconds = (new Date() - startTime) / 1000;

      const days = Math.floor(uptimeInSeconds / (3600 * 24));
      const hours = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
      const secondsLeft = Math.floor(uptimeInSeconds % 60);
      const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${secondsLeft}s`;

      const totalMemoryGB = (os.totalmem() / 1024 ** 3).toFixed(2);
      const freeMemoryGB = (os.freemem() / 1024 ** 3).toFixed(2);
      const usedMemoryGB = (totalMemoryGB - freeMemoryGB).toFixed(2);

      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const currentDate = new Date();
      const date = currentDate.toLocaleDateString("en-US");
      const time = currentDate.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: true
      });

      const timeStart = Date.now();
      await api.sendMessage("🔎 Checking...", event.threadID);
      const ping = Date.now() - timeStart;

      let pingStatus = "⛔ Bad System";
      if (ping < 1000) pingStatus = "✅ Smooth System";

      const systemInfo = `♡   ∩_∩
 （„• ֊ •„)♡
╭─∪∪────────────⟡
│ 𝗨𝗣𝗧𝗜𝗠𝗘 𝗜𝗡𝗙𝗢
├───────────────⟡
│ ⏰ Runtime: ${uptimeFormatted}
│ 💻 Memory: ${usedMemoryGB} GB / ${totalMemoryGB} GB
│ 📅 Date: ${date}
│ ⏲ Time: ${time}
│ 👥 Users: ${allUsers.length}
│ 💬 Threads: ${allThreads.length}
│ 📡 Ping: ${ping}ms
│ Status: ${pingStatus}
╰───────────────⟡`;

      api.sendMessage(systemInfo, event.threadID, event.messageID);
    } catch (error) {
      console.error("Error retrieving system information:", error);
      api.sendMessage(
        "❌ Unable to retrieve system information.",
        event.threadID,
        event.messageID
      );
    }
  }
};
