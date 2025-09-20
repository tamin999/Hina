const math = require("mathjs");

module.exports = {
  config: {
    name: "calc",
    aliases: ["math", "calculator"],
    version: "2.0",
    author: "starboy",
    countDown: 3,
    role: 0,
    shortDescription: "All-in-one calculator",
    longDescription: "Solve both basic and scientific math (sin, cos, tan, log, sqrt, pi, e, etc.)",
    category: "Utility",
    guide: {
      en: "{pn} <expression>\nExample: {pn} 5*6+10\n{pn} sin(30 deg)+log(100)"
    }
  },

  onStart: async function ({ event, args, message }) {
    if (args.length === 0) {
      return message.reply(
        "❌ Please provide a math expression.\n" +
        "Examples:\n" +
        "!calc 5*10+20\n" +
        "!calc sin(30 deg) + cos(60 deg)\n" +
        "!calc sqrt(144) + log(100)"
      );
    }

    const expression = args.join(" ");

    try {
      // Evaluate expression with mathjs
      const result = math.evaluate(expression);
      return message.reply(`🧮 Expression: ${expression}\n✅ Result: ${result}`);
    } catch (e) {
      return message.reply("❌ Invalid expression. Please try again with a valid math formula.");
    }
  }
};
