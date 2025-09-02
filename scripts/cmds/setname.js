module.exports = {
  config: {
    name: "setnn",
    aliases: ["setnick", "changenick"],
    version: "2.2",
    author: "StarBoy",
    description: "Change nickname(s) of mentioned/replied users (GC admins & bot owners only, bot must be admin)",
    usage: "Reply: setnn NewNick\nMention multiple: setnn @user1 Nick1 @user2 Nick2",
    cooldown: 5,
    permissions: [],
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, mentions, messageReply, senderID } = event;
    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = threadInfo.adminIDs.map(i => i.id);
    const botID = api.getCurrentUserID();
    const botOwners = global.GoatBot?.config?.adminBot || [];

    // Bot must be admin
    if (!adminIDs.includes(botID))
      return api.sendMessage("⛔ The bot must be an admin in this group.", threadID, messageID);

    // Only GC admins or bot owners
    if (!adminIDs.includes(senderID) && !botOwners.includes(senderID))
      return api.sendMessage("⛔ Only group admins and bot owners can use this command.", threadID, messageID);

    // --- Reply case ---
    if (messageReply && messageReply.senderID) {
      const nickname = args.join(" ");
      if (!nickname) return api.sendMessage("❌ Provide a new nickname.", threadID, messageID);
      try {
        await api.changeNickname(nickname, threadID, messageReply.senderID);
        return api.sendMessage(`✅ Nickname changed to "${nickname}" for replied user.`, threadID, messageID);
      } catch {
        return api.sendMessage("❌ Failed to change nickname. Make sure the bot has admin permission.", threadID, messageID);
      }
    }

    // --- Mention case ---
    if (Object.keys(mentions).length > 0) {
      const mentionIDs = Object.keys(mentions);
      const mentionNames = Object.values(mentions);
      let success = [], failed = [];
      let i = 0;

      while (i < args.length) {
        if (args[i].startsWith("@")) {
          const targetID = mentionIDs.shift();
          const targetName = mentionNames.shift();
          let nickname = [];
          i++;
          while (i < args.length && !args[i].startsWith("@")) nickname.push(args[i++]);
          nickname = nickname.join(" ");
          if (!nickname) { failed.push(targetName || "User"); continue; }
          try { await api.changeNickname(nickname, threadID, targetID); success.push(`${targetName} → "${nickname}"`); }
          catch { failed.push(targetName || "User"); }
        } else i++;
      }

      let msg = "";
      if (success.length) msg += `✅ Changed:\n${success.join("\n")}\n`;
      if (failed.length) msg += `❌ Failed:\n${failed.join(", ")}`;
      return api.sendMessage(msg.trim(), threadID, messageID);
    }

    return api.sendMessage("❌ Reply to a user or mention them with new nickname(s).", threadID, messageID);
  }
};
