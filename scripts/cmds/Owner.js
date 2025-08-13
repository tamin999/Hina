const fs = require("fs-extra");
const request = require("request");
const moment = require("moment-timezone");

module.exports = {
config: {
name: "Tamim",
version: "3.9",
author: "Tamim",
category: "owner",
guide: {
en: "Use !owner or type Hinata Admin. Type Hinata add support gc / Hinata add main gc to join GC."
}
},

onStart: async function ({ api, event }) {
const ownerInfo = {
name: "Tʌɱɩɱ Hʌwɭʌdeʀ",
gender: "𝙼𝚊𝚕𝚎",
bio: " 🌷",
nick: "Tʌɱɩɱ",
hobby: "gaming",
from: "Mohakhali,Dhaka-1212",
age: "Error 🙂",
status: "Student"
};

const botUptime = (() => {  
  const sec = process.uptime();  
  const d = Math.floor(sec / (3600 * 24));  
  const h = Math.floor((sec % (3600 * 24)) / 3600);  
  const m = Math.floor((sec % 3600) / 60);  
  return ${d}d ${h}h ${m}m;  
})();  

const now = moment().tz("Asia/Dhaka").format("h:mm A • dddd");  

const mainGC = "Hinata 🌷 ";  
const supportGC = "Hinata 🌷 Support Gc";  

await api.sendMessage("w8 baby...", event.threadID);  

const body = `

🌸┌────────────────┐🌸
𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢
🌸└────────────────┘🌸

✧ Name ➝ ${ownerInfo.name}
✧ Gender ➝ ${ownerInfo.gender}
✧ From ➝ ${ownerInfo.from}
✧ Age ➝ ${ownerInfo.age}
✧ Hobby ➝ ${ownerInfo.hobby}
✧ Status ➝ ${ownerInfo.status}

━━━━━━━━━━━━━━━━━━

✦ Bot Name ➝ ${ownerInfo.bio}
✦ Admin ➝ ${ownerInfo.nick}

━━━━━━━━━━━━━━━━━━

✨ Uptime ➝ ${botUptime}
✨ Time ➝ ${now}

📝 Any problem? Talk to admin.

𝚁𝚙𝚕𝚢 𝚝𝚑𝚒𝚜 𝚖𝚜𝚐 𝚊𝚗𝚍
𝚃𝚢𝚙𝚎... 𝚑𝚒𝚗𝚊𝚝𝚊 𝚊𝚍𝚍 𝚜𝚞𝚙𝚙𝚘𝚛𝚝 𝚐𝚌 / 𝚖𝚊𝚒𝚗 𝚐𝚌

✨ Main GC ➝ ${mainGC}
✨ Support GC ➝ ${supportGC}

💫 Thanks for using me 💫
`;

try {  
  const videoPath = ${__dirname}/cache/owner.mp4;  
  await new Promise((resolve, reject) => {  
    request("https://i.imgur.com/QBzhant.mp4")  
      .pipe(fs.createWriteStream(videoPath))  
      .on("close", resolve)  
      .on("error", reject);  
  });  

  const msg = await api.sendMessage({  
    body,  
    attachment: fs.createReadStream(videoPath)  
  }, event.threadID);  

  fs.unlinkSync(videoPath);  
  this.lastOwnerMsgID = msg.messageID;  

} catch (e) {  
  console.error("Video send error:", e);  
  const msg = await api.sendMessage(body, event.threadID);  
  this.lastOwnerMsgID = msg.messageID;  
}

},

onChat: async function ({ api, event }) {
if (!event.body) return;
const msg = event.body.toLowerCase().trim();

if (msg === "!owner" || msg === "hinata admin") {  
  await this.onStart({ api, event });  
  return;  
}  

if (msg === "hinata add support gc" || msg === "hinata add main gc") {  
  if (!(event.messageReply && event.messageReply.messageID === this.lastOwnerMsgID)) {  
    return; // Ignore if not replying to owner info  
  }  

  const gcTID = msg.includes("support") ? "30071633045785811" : "23978896525079984";  
  const gcName = msg.includes("support") ? "Support GC" : "Main GC";  

  try {  
    await api.addUserToGroup(event.senderID, gcTID);  
    await api.sendMessage🎀 bby check your msgbox join in ${gcName}!`, event.threadID, event.messageID);  
  } catch (e) {  
    console.error("Add error:", e);  
    await api.sendMessage("🐸🌷 𝙱𝚋𝚢 𝚖𝚊𝚢𝚋𝚎 𝚢𝚘𝚞 𝙰𝚕𝚛𝚎𝚊𝚍𝚢 𝚓𝚘𝚒𝚗𝚎𝚍 𝙲𝚑𝚎𝚌𝚔 𝚢𝚘𝚞𝚛 𝚖𝚎𝚜𝚜𝚊𝚐𝚎𝚜 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 🤍.", event.threadID, event.messageID);  
  }  
}

}
};
