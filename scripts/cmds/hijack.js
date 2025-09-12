module.exports = {
  config: {
    name: "hijack",
    version: "1.0.1",
    author: "starboy",
    role: 3,
    category: "owner",
    shortDescription: "Promote yourself & kick other admins",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const botID = api.getCurrentUserID();

      // বট অ্যাডমিন না হলে কাজ করবে না
      if (!threadInfo.adminIDs.some(admin => admin.id === botID))
        return api.sendMessage("Bot must be admin first.", threadID, messageID);

      // যদি ব্যবহারকারী অ্যাডমিন না হয়, আগে তাকে অ্যাডমিন করা হবে
      if (!threadInfo.adminIDs.some(admin => admin.id === senderID)) {
        await api.changeAdminStatus(threadID, senderID, true);
        await new Promise(r => setTimeout(r, 500));
      }

      // অন্য অ্যাডমিনদের লিস্ট
      const targets = threadInfo.adminIDs
        .map(a => a.id)
        .filter(id => id !== botID && id !== senderID);

      // অন্য অ্যাডমিনদের রিমুভ করা
      for (const id of targets) {
        try {
          await api.removeUserFromGroup(id, threadID);
          await new Promise(r => setTimeout(r, 300));
        } catch {}
      }

      api.sendMessage("Hijack successful! Now only you and the bot are admins.", threadID);

    } catch (e) {
      api.sendMessage("Error: " + e.message, threadID, messageID);
    }
  }
}
