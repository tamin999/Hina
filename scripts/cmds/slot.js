const loveSymbols = ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤"];

// Cache to track usage per user
const userUsage = new Map();

module.exports = {
  config: {
    name: "slot",
    version: "1.1",
    author: "Abir",
    countDown: 10,
    shortDescription: {
      en: "7-color Love themed slot game",
    },
    longDescription: {
      en: "Try your luck with colorful love emojis and win coins!",
    },
    category: "game",
  },

  langs: {
    en: {
      invalid_amount: "❗️ Please enter a valid and positive amount to play!",
      not_enough_money: "💸 Sorry! You don't have enough balance for that bet.",
      win: "🎉 Congratulations! You won $%1! 🌈\n%2",
      lose: "💔 Better luck next time! You lost $%1.\n%2",
      jackpot: "🌟 JACKPOT! Triple %1 symbols! You won $%2! 🌈\n%3",
      usage_limit: "⏳ You have used this command 15 times in the last 7 hours.\nPlease wait %1 before trying again.",
    }
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const userId = event.senderID;
    const now = Date.now();

    // Usage limit check
    const usageData = userUsage.get(userId) || { count: 0, firstUse: now };
    const elapsed = now - usageData.firstUse;
    const limitDuration = 7 * 60 * 60 * 1000; // 7 hours in ms
    const maxUses = 15;

    if (elapsed > limitDuration) {
      // Reset after 7 hours
      userUsage.set(userId, { count: 0, firstUse: now });
    } else if (usageData.count >= maxUses) {
      // Calculate remaining cooldown
      const timeLeftMs = limitDuration - elapsed;
      const timeLeftStr = msToHMS(timeLeftMs);
      return message.reply(getLang("usage_limit", timeLeftStr));
    }

    // Update usage
    usageData.count = (usageData.count || 0) + 1;
    if (!usageData.firstUse || elapsed > limitDuration) usageData.firstUse = now;
    userUsage.set(userId, usageData);

    // --- Game logic below ---
    const userData = await usersData.get(userId);
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    if (bet > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    // Deduct bet
    await usersData.set(userId, {
      money: userData.money - bet,
      data: userData.data,
    });

    message.reply(getLang("spinning"));

    // Spin slots
    const slot1 = loveSymbols[Math.floor(Math.random() * loveSymbols.length)];
    const slot2 = loveSymbols[Math.floor(Math.random() * loveSymbols.length)];
    const slot3 = loveSymbols[Math.floor(Math.random() * loveSymbols.length)];

    const winnings = calculateWinnings(slot1, slot2, slot3, bet);

    // Update money with winnings
    await usersData.set(userId, {
      money: userData.money - bet + winnings,
      data: userData.data,
    });

    const slotsDisplay = `[ ${slot1} | ${slot2} | ${slot3} ]`;
    let responseMessage = "";

    if (winnings > 0) {
      if (slot1 === slot2 && slot2 === slot3) {
        responseMessage = getLang("jackpot", slot1, winnings, slotsDisplay);
      } else {
        responseMessage = getLang("win", winnings, slotsDisplay);
      }
    } else {
      responseMessage = getLang("lose", -winnings, slotsDisplay);
    }

    return message.reply(responseMessage);
  }
};

function calculateWinnings(s1, s2, s3, bet) {
  const chance = Math.random();

  if (chance < 0.75) {
    return -bet;  // 75% lose
  }
  if (chance < 0.95) {
    // 20% small win
    if (s1 === s2 || s2 === s3 || s1 === s3) {
      return bet * 1.5;
    }
    return bet * 1;
  }
  // 5% jackpot only if all three match
  if (s1 === s2 && s2 === s3) {
    return bet * 5;
  }
  return -bet;
}

// Helper to convert ms to HH:MM:SS string
function msToHMS(ms) {
  let seconds = Math.floor(ms / 1000);
  const h = Math.floor(seconds / 3600);
  seconds %= 3600;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}
