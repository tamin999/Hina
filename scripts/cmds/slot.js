module.exports = {
  config: {
    name: "slot",
    version: "1.0",
    author: "Raihan",
    countDown: 10,
    cooldowns: 5, // 5 seconds cooldown
    shortDescription: {
      en: "Slot game",
    },
    longDescription: {
      en: "Gamble at the risk of losing or winning.",
    },
    category: "Game",
  },
  langs: {
    en: {
      invalid_amount: "Enter a valid and positive amount to have a chance to win double.",
      limit_amount: "Minimum bet amount is 200.",
      not_enough_money: "Check your balance to ensure you have that amount.",
      spin_message: "Spinning...",
      win_message: "You won $%1, buddy!",
      lose_message: "You lost $%1, buddy.",
      jackpot_message: "Jackpot! You won $%1 with three %2 symbols, buddy!",
      daily_limit: "You can only use this command 15 times per day.",
      cooldown_message: "Please wait %1 seconds before using the slot game again.",
    },
  },
  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);

    // Get usage data
    const today = new Date().toDateString();
    const slotData = userData.data.slotDaily || { date: today, count: 0 };

    // Reset count if the date has changed
    if (slotData.date !== today) {
      slotData.date = today;
      slotData.count = 0;
    }

    // Check if the user has exceeded the 15 use limit for today
    if (slotData.count >= 15) {
      return message.reply(getLang("daily_limit"));
    }

    // Cooldown check
    const currentTime = Date.now();
    const lastUsedTime = userData.data.lastSlotUse || 0;
    const cooldown = 5000; // 5 seconds cooldown in milliseconds

    if (currentTime - lastUsedTime < cooldown) {
      const remainingTime = Math.ceil((cooldown - (currentTime - lastUsedTime)) / 1000);
      return message.reply(getLang("cooldown_message", remainingTime));
    }

    // Minimum amount check
    if (isNaN(amount) || amount < 200) {
      return message.reply(getLang("limit_amount"));
    }

    // Balance check
    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    // Slot roll
    const slots = ["💚", "💛", "💙", "💛", "💚", "💙", "💙", "💛", "💚"];
    const slot1 = slots[Math.floor(Math.random() * slots.length)];
    const slot2 = slots[Math.floor(Math.random() * slots.length)];
    const slot3 = slots[Math.floor(Math.random() * slots.length)];

    // Calculate winnings (win = double the bet)
    const winnings = calculateWinnings(slot1, slot2, slot3, amount);

    // Update user data with winnings/losses
    userData.money += winnings;

    // Increment the daily usage count
    slotData.count++;
    userData.data.slotDaily = slotData;
    userData.data.lastSlotUse = currentTime; // Update the last used time

    // Save user data
    await usersData.set(senderID, userData);

    // Final result message
    const messageText = getSpinResultMessage(slot1, slot2, slot3, winnings, getLang);
    return message.reply(messageText);
  },
};

function calculateWinnings(slot1, slot2, slot3, betAmount) {
  const randomOutcome = Math.random(); // Generate a random number between 0 and 1

  // 55% chance to win
  if (randomOutcome < 0.55) {
    // If user wins, they get double the bet amount (winning rate applied)
    return betAmount * 2; // Double the bet amount
  } else {
    return -betAmount; // 45% chance to lose
  }
}

function getSpinResultMessage(slot1, slot2, slot3, winnings, getLang) {
  const slotsDisplay = `[ ${slot1} | ${slot2} | ${slot3} ]`;
  if (winnings > 0) {
    if (slot1 === "💙" && slot2 === "💙" && slot3 === "💙") {
      return getLang("jackpot_message", winnings, "💙") + ` ${slotsDisplay}`;
    } else {
      return getLang("win_message", winnings) + ` ${slotsDisplay}`;
    }
  } else {
    return getLang("lose_message", -winnings) + ` ${slotsDisplay}`;
  }
}
