const axios = require('axios');

module.exports = {
	config: {
		name: "activemember",
		aliases: ["am"],
		version: "1.2",
		author: "kshitiz & premium look by Raihan Fiba",
		countDown: 5,
		role: 0,
		shortDescription: "Top active members",
		longDescription: "Show the top 15 most active users in the current chat based on message count.",
		category: "fun",
		guide: "{p}{n}",
	},
	onStart: async function ({ api, event }) {
		const threadId = event.threadID;

		try {
			const participants = await api.getThreadInfo(threadId, { participantIDs: true });

			const messageCounts = {};
			participants.participantIDs.forEach(id => {
				messageCounts[id] = 0;
			});

			const messages = await api.getThreadHistory(threadId, 1000);

			messages.forEach(msg => {
				if (messageCounts[msg.senderID] !== undefined) {
					messageCounts[msg.senderID]++;
				}
			});

			const topUsers = Object.entries(messageCounts)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 15);

			let rank = 1;
			let userList = [];

			for (const [userId, count] of topUsers) {
				const userInfo = await api.getUserInfo(userId);
				const name = userInfo[userId].name;

				let medal = "";
				if (rank === 1) medal = "🥇";
				else if (rank === 2) medal = "🥈";
				else if (rank === 3) medal = "🥉";

				userList.push(
					`${medal} 𝗥𝗮𝗻𝗸 #${rank}\n👤 𝗡𝗮𝗺𝗲: ${name}\n💬 𝗠𝗲𝘀𝘀𝗮𝗴𝗲𝘀: ${count}\n${rank === topUsers.length ? "" : "━━━━━━━━━━━━━━"}`
				);
				rank++;
			}

			const messageText = 
`🌟 𝗧𝗢𝗣 𝟭𝟱 𝗔𝗖𝗧𝗜𝗩𝗘 𝗠𝗘𝗠𝗕𝗘𝗥𝗦 🌟

${userList.join("\n")}

🏆 Keep chatting to climb the leaderboard!`;

			api.sendMessage(messageText, threadId);

		} catch (error) {
			console.error(error);
			api.sendMessage("❌ An error occurred while fetching active members.", threadId);
		}
	},
};
