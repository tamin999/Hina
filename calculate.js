module.exports = {
  config: {
    name: "calculate",
    version: "1.0",
    author: "OtinXSandip",
    role: 0,
    countDown: 5, // fixed typo here
    shortDescription: "Perform basic arithmetic calculations.",
    category: "study",
    guide: "{pn} <expression>",
  },

  onStart: async function ({ message, args }) {
    const expression = args.join(" ");

    if (!expression) {
      return message.reply("Please provide an expression to calculate!");
    }

    // Allow only digits, operators, parentheses, dots, and spaces for safety
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
      return message.reply("Invalid characters detected. Please use only numbers and arithmetic operators (+ - * / ( )).");
    }

    let result;
    try {
      // Use eval carefully; here we trust input after regex check
      // eslint-disable-next-line no-eval
      result = eval(expression);
    } catch (error) {
      console.error(error);
      return message.reply("Oops! Something went wrong while calculating your expression.");
    }

    message.reply(`The result of ${expression} is ${result}.`);
  },
};
