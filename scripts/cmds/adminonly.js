const fs = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
	config: {
		name: "adminonly",
		aliases: ["adonly", "onlyad", "onlyadmin"],
		version: "1.5",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		description: {
			vi: "bật/tắt chế độ chỉ admin mới có thể sử dụng bot",
			en: "turn on/off only admin can use bot"
		},
		category: "admin",
		guide: {
			vi: "   {pn} [on | off]: bật/tắt chế độ chỉ admin mới có thể sử dụng bot"
				+ "\n   {pn} noti [on | off]: bật/tắt thông báo khi người dùng không phải là admin sử dụng bot",
			en: "   {pn} [on | off]: turn on/off the mode only admin can use bot"
				+ "\n   {pn} noti [on | off]: turn on/off the notification when user is not admin use bot"
		}
	},

	langs: {
		vi: {
			turnedOn: "𝐃𝐚̃ 𝐛𝐚̣̂𝐭 𝐜𝐡𝐞̂́ 𝐝𝐨̣̂ 𝐜𝐡𝐢̉ 𝐚𝐝𝐦𝐢𝐧 𝐦𝐨̛́𝐢 𝐜𝐨́ 𝐭𝐡𝐞̂̉ 𝐬𝐮̛̉ 𝐝𝐮̣𝐧𝐠 𝐛𝐨𝐭 ⚜️",
			turnedOff: "𝐃𝐚̃ 𝐭𝐚̆́𝐭 𝐜𝐡𝐞̂́ 𝐝𝐨̣̂ 𝐜𝐡𝐢̉ 𝐚𝐝𝐦𝐢𝐧 𝐦𝐨̛́𝐢 𝐜𝐨́ 𝐭𝐡𝐞̂̉ 𝐬𝐮̛̉ 𝐝𝐮̣𝐧𝐠 𝐛𝐨𝐭 ❌",
			turnedOnNoti: "𝐃𝐚̃ 𝐛𝐚̣̂𝐭 𝐭𝐡𝐨̂𝐧𝐠 𝐛𝐚́𝐨 𝐤𝐡𝐢 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐝𝐮̀𝐧𝐠 𝐤𝐡𝐨̂𝐧𝐠 𝐩𝐡𝐚̉𝐢 𝐥𝐚̀ 𝐚𝐝𝐦𝐢𝐧 𝐬𝐮̛̉ 𝐝𝐮̣𝐧𝐠 𝐛𝐨𝐭 🛎️",
			turnedOffNoti: "𝐃𝐚̃ 𝐭𝐚̆́𝐭 𝐭𝐡𝐨̂𝐧𝐠 𝐛𝐚́𝐨 𝐤𝐡𝐢 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐝𝐮̀𝐧𝐠 𝐤𝐡𝐨̂𝐧𝐠 𝐩𝐡𝐚̉𝐢 𝐥𝐚̀ 𝐚𝐝𝐦𝐢𝐧 𝐬𝐮̛̉ 𝐝𝐮̣𝐧𝐠 𝐛𝐨𝐭 🚫"
		},
		en: {
			turnedOn: "𝗧𝘂𝗿𝗻𝗲𝗱 𝗼𝗻 𝘁𝗵𝗲 𝗺𝗼𝗱𝗲 𝗼𝗻𝗹𝘆 𝗮𝗱𝗺𝗶𝗻 𝗰𝗮𝗻 𝘂𝘀𝗲 𝗯𝗼𝘁 ⚜️",
			turnedOff: "𝗧𝘂𝗿𝗻𝗲𝗱 𝗼𝗳𝗳 𝘁𝗵𝗲 𝗺𝗼𝗱𝗲 𝗼𝗻𝗹𝘆 𝗮𝗱𝗺𝗶𝗻 𝗰𝗮𝗻 𝘂𝘀𝗲 𝗯𝗼𝘁 ❌",
			turnedOnNoti: "𝗧𝘂𝗿𝗻𝗲𝗱 𝗼𝗻 𝘁𝗵𝗲 𝗻𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻 𝘄𝗵𝗲𝗻 𝘂𝘀𝗲𝗿 𝗶𝘀 𝗻𝗼𝘁 𝗮𝗱𝗺𝗶𝗻 🛎️",
			turnedOffNoti: "𝗧𝘂𝗿𝗻𝗲𝗱 𝗼𝗳𝗳 𝘁𝗵𝗲 𝗻𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻 𝘄𝗵𝗲𝗻 𝘂𝘀𝗲𝗿 𝗶𝘀 𝗻𝗼𝘁 𝗮𝗱𝗺𝗶𝗻 🚫"
		}
	},

	onStart: function ({ args, message, getLang }) {
		let isSetNoti = false;
		let value;
		let indexGetVal = 0;

		if (args[0] == "noti") {
			isSetNoti = true;
			indexGetVal = 1;
		}

		if (args[indexGetVal] == "on")
			value = true;
		else if (args[indexGetVal] == "off")
			value = false;
		else
			return message.SyntaxError();

		if (isSetNoti) {
			config.hideNotiMessage.adminOnly = !value;
			message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
		}
		else {
			config.adminOnly.enable = value;
			message.reply(getLang(value ? "turnedOn" : "turnedOff"));
		}

		fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
	}
};
