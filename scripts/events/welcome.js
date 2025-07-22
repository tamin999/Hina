const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

// Bangladesh event calendar (month-based)
const bangladeshEvents = {
	January: ["Ekushey Book Fair Preparation"],
	February: ["Ekushey Book Fair", "International Mother Language Day"],
	March: ["Independence Day Preparation"],
	April: ["Bengali New Year (Pohela Boishakh)", "Mujib Year Celebration"],
	May: ["Buddha Purnima", "Monsoon Preparation"],
	June: ["Monsoon Festival", "Pitha Utshob"],
	July: ["Dhaka Rain Festival", "Eid-ul-Adha"],
	August: ["National Mourning Month", "Krishna Janmashtami"],
	September: ["Durga Puja Preparation", "Tea Festival"],
	October: ["Durga Puja", "Nobel Prize Celebration"],
	November: ["Victory Day Preparation", "Folk Music Festival"],
	December: ["Victory Day", "Christmas Celebration"]
};

module.exports = {
	config: {
		name: "welcome",
		version: "3.1",
		author: "NTKhang & Bangladesh Special by AI",
		category: "events"
	},

	langs: {
		vi: {
			// ... keep Vietnamese version
		},
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			welcomeMessage: "Thank you for inviting me!\nBot prefix: %1\nCommands: %1help",
			multiple1: "you",
			multiple2: "you guys",
			defaultWelcomeMessage: `
🌸┏━━━━━━━━━━━━━━━━━━━━━━━┓🌸
    🎀  𝗔𝗦𝗦𝗔𝗟𝗔𝗠𝗨𝗔𝗟𝗔𝗜𝗞𝗨𝗠  🎀
🌸┗━━━━━━━━━━━━━━━━━━━━━━━┛🌸

💖 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗧𝗢 𝗢𝗨𝗥  𝗙𝗔𝗠𝗜𝗟𝗬 💖

✨ 𝗡𝗔𝗠𝗘: {userNameTag}
🌸 𝗚𝗥𝗢𝗨𝗣: {boxName}
🕰️ 𝗧𝗜𝗠𝗘: {time} ({session})
📆 𝗗𝗔𝗧𝗘: {date}

👑 𝗔𝗗𝗗𝗘𝗗 𝗕𝗬: {adderName}

💌 𝗪𝗲 𝗵𝗼𝗽𝗲 𝘆𝗼𝘂 𝗲𝗻𝗷𝗼𝘆 𝘆𝗼𝘂𝗿 𝘀𝘁𝗮𝘆 𝗵𝗲𝗿𝗲!
🌷 𝗣𝗹𝗲𝗮𝘀𝗲 𝗶𝗻𝘁𝗿𝗼𝗱𝘂𝗰𝗲 𝘆𝗼𝘂𝗿𝘀𝗲𝗹𝗳 𝗮𝗻𝗱 𝗺𝗮𝗸𝗲 𝗳𝗿𝗶𝗲𝗻𝗱𝘀!
			`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;
				const adderId = event.author;
				
				// Get adder's name
				let adderName = "✨ 𝗨𝗻𝗸𝗻𝗼𝘄𝗻 𝗔𝗻𝗴𝗲𝗹 ✨";
				try {
					const adderInfo = await api.getUserInfo(adderId);
					adderName = `👑 ${adderInfo[adderId].name}`;
				} catch (e) {
					console.error("Error getting adder info", e);
				}

				// if new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}
				
				// if new member:
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				// push new member to array
				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				// if timeout is set, clear it
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				// set new timeout
				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false)
						return;
					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [],
						mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1)
						multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId))
							continue;
						userName.push(`✨ ${user.fullName} ✨`);
						mentions.push({
							tag: `✨ ${user.fullName} ✨`,
							id: user.userFbId
						});
					}
					if (userName.length == 0) return;
					let { welcomeMessage = getLang("defaultWelcomeMessage") } =
						threadData.data;
					const form = {
						mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
					};
					
					// Get current time
					const timeString = `🕰️ ${getTime("HH:MM:ss")}`;
					
					// Get date with month name
					const currentDate = new Date();
					const monthName = getTime("MM");
					const dateString = `📆 ${getTime("DD")} ${monthName} ${getTime("YYYY")}`;
					
					// Get Bangladesh events
					const events = bangladeshEvents[monthName] || ["Cultural Festivals"];
					const bangladeshEventsString = events.map(event => `• ${event}`).join("\n");
					
					// Get session with emoji
					let session;
					if (hours <= 10) session = `🌅 ${getLang("session1")}`;
					else if (hours <= 12) session = `☀️ ${getLang("session2")}`;
					else if (hours <= 18) session = `🌇 ${getLang("session3")}`;
					else session = `🌙 ${getLang("session4")}`;

					welcomeMessage = welcomeMessage
						.replace(/\{userName\}/g, userName.join(", "))
						.replace(/\{userNameTag\}/g, mentions.map(m => m.tag).join("\n"))
						.replace(/\{boxName\}|\{threadName\}/g, `🌸 ${threadName}`)
						.replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
						.replace(/\{adderName\}/g, adderName)
						.replace(/\{time\}/g, timeString)
						.replace(/\{session\}/g, session)
						.replace(/\{date\}/g, dateString)
						.replace(/\{currentMonth\}/g, monthName)
						.replace(/\{bangladeshEvents\}/g, bangladeshEventsString);

					form.body = welcomeMessage;

					if (threadData.data.welcomeAttachment) {
						const files = threadData.data.welcomeAttachment;
						const attachments = files.reduce((acc, file) => {
							acc.push(drive.getFile(file, "stream"));
							return acc;
						}, []);
						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}
					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
