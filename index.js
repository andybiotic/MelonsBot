const Discord = require("discord.js");
const config = require("./config.json");
const client = new Discord.Client();

const botCheckString = "!bot";

const channelBot = "851879147001348119";
const channelRaceControl = "845976526747074581"

const messageBotOperational = "MelonsBot is running!"
const messageBotStart = "MelonsBot has started..."

const messageRaceControl1 = "Race Control is actively monitoring this channel. When reporting incidents, please remember to include the car number, lap number and any other details you feel are important. Race Control will not comment on incidents, except when a penalty is applied.";
const messageRaceControl2 = "Please remember that Race Control will not comment on individual incidents, except when a penalty is applied.";
const messageRaceControl3 = "Fun fact: Melons closest relatives are squashes and cucumbers.";
const messageRaceControl4 = "The stewards are easily startled. Please do not tap on the glass...";

const messageDict = {
  0: "Race Control is actively monitoring this channel. When reporting incidents, please remember to include the car number, lap number and any other details you feel are important.",
  1: "Please remember that Race Control will not comment on individual incidents, except when a penalty is applied.",
  2: "Fun fact: Melons closest relatives are squashes and cucumbers.",
  3: "The stewards are easily startled. Please do not tap on the glass...",
  4: "If we're investigating an incident, we'll add the melon emoji to the message.",
  5: "Warnings and penalties will be posted in the race-updates channel."
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

console.log("MelonsBot: Up and running!");


client.on("ready", () => {
  console.log("MelonsBot: Ready and waiting!");
  client.channels.cache.get(channelBot).send(messageBotStart);
});

var messageCounter = 0;

client.on("message", function(message) {
  console.log("MelonsBot: Analysing incoming message.")

  if (message.author.bot) {
    console.log("MelonsBot: Message was sent by bot. Discarding.");
    return;
  }

  if (message.channel.id === channelBot) {
    console.log("MelonsBot: Message received in Bot channel.");
    if (message.content.startsWith(botCheckString)) {
      console.log("MelonsBot: Bot check.");
      client.channels.cache.get(channelBot).send(messageBotOperational);
      return
    }
    return
  }

  if (message.channel.id === channelRaceControl) {
    console.log("MelonsBot: Message sent by user in Race Control channel.");
    messageCounter += 1;

    if (messageCounter % 5 === 0) {
      client.channels.cache.get(channelRaceControl).send(messageDict[getRandomInt(6)]);
      console.log("MelonsBot: Sent race control message.");
    }
  }
});

client.on("guildMemberAdd", function(member){
    console.log("MelonsBot: User has joined - ");
    member.send("Hello, and welcome to the Melons 24h! Please take a moment to set your nickname to match your name in iRacing (Go to the channel menu > tap Melons 24h at the top > Change Nickname). Once you've done that, come and join us in the paddock!")
});

client.login(config.BOT_TOKEN);
