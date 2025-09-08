module.exports = {
  config: {
    name: "gcinfo",
    aliases: ["groupinfo", "threadinfo"],
    version: "1.2",
    author: "StarBoy",
    description: "Show detailed info of any group using its UID",
    usage: "[gcinfo] or [gcinfo <group_uid>]",
    cooldown: 5,
    permissions: [0],
  },

  onStart: async function ({ api, event, args }) {
    const threadID = args[0] || event.threadID;

    try {
      const threadInfo = await api.getThreadInfo(threadID);

      const threadName = threadInfo.threadName || "Unnamed Group";
      const emoji = threadInfo.emoji || "❔";
      const approvalMode = threadInfo.approvalMode ? "On ✅" : "Off ❌";
      const messageCount = threadInfo.messageCount || "Unknown";
      const adminIDs = threadInfo.adminIDs.map(a => a.id) || [];
      const participantIDs = threadInfo.participantIDs || [];
      const participantCount = participantIDs.length;
      const adminCount = adminIDs.length;

      // Fetch admin names
      const adminInfos = await api.getUserInfo(adminIDs);
      const adminNames = adminIDs.map(id => adminInfos[id]?.name || "Unknown");

      const infoMsg = `
🌐 Group Chat Info
━━━━━━━━━━━━━━
📌 Name: ${threadName}
🆔 ID: ${threadID}
👥 Members: ${participantCount}
🛡️ Admins (${adminCount}): ${adminNames.join(", ")}
💬 Messages: ${messageCount}
😀 Emoji: ${emoji}
✅ Approval Mode: ${approvalMode}
━━━━━━━━━━━━━━
      `.trim();

      return api.sendMessage(infoMsg, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Couldn't fetch info. Make sure the UID is valid and the bot is in that group.", event.threadID, event.messageID);
    }
  }
};
