const Discord = require("discord.js");
const config = require("./config.json");
const client = new Discord.Client();
const { MessageEmbed } = require('discord.js');

const botCheckString = "!bot";
const botTestString = "!test";
const botAdvertString = "!ad";

const channelBot = "851879147001348119";
const channelRaceControl = "845976526747074581"
const channelPaddock = "788509056880738307"

const messageBotOperational = "MelonsBot is running!"
const messageBotStart = "MelonsBot has started..."

const totalMessageCount = 8
const totalAdvertCount = 15

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

console.log("MelonsBot: Up and running!");


client.on("ready", () => {
  console.log("MelonsBot: Ready and waiting!");
  client.channels.cache.get(channelBot).send(messageBotStart);
});

var messageCounter = 1;
var advertCounter = 1;

client.on("message", function(message) {

  console.log("MelonsBot: Analysing incoming message.");

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
    } else if (message.content.startsWith(botTestString)) {
      // POST TEST TO BOT CHANNEL - CAN CHANGE TEST MESSAGE HERE.
      postChannelMessage(channelBot, 8);
    } else if (message.content.startsWith(botAdvertString)) {
      // POST ADVERT TO CHANNEL - SET CHANNEL HERE.
      postAdvertMessage(channelBot);
    }
    return
  }

  if (message.channel.id === channelRaceControl) {
    console.log("MelonsBot: Message sent by user in Race Control channel.");
    lastMessageAuthor = "Test Author";
    messageCounter += 1;

    if (messageCounter % 5 === 0) {
      // AUTO POST RACE CONTROL MESSAGE HERE. ADJUST INT ABOVE FOR POSTING FREQUENCY.
      postChannelMessage(channelRaceControl, getRandomInt(totalMessageCount));
      console.log("MelonsBot: Sent race control message.");
    }
  }

  function setSassyString() {
    let str = ", it's called a motor race. We went car racing."
    return str;
  }

  function mergeSassyString(nickname, sassyString) {
    const str = nickname + sassyString
    return str;
  }

  async function setNickname() {
    try {
      const member = await message.guild.members.fetch(message.author)
      return member.nickname;
    } catch {
      return message.author.username;
    }
  }

  function editNickName(nickname) {
    const nameComponents = nickname.split(" ");
    return nameComponents[0]
  }

  async function postChannelMessage(channel, int) {
    var messageDict = {
      0: "Race Control is actively monitoring this channel. When reporting incidents, please remember to include the car number, lap number and any other details you feel are important.",
      1: "Please remember that Race Control will not comment on individual incidents, except when a penalty is applied.",
      2: "Fun fact: Melons closest relatives are squashes and cucumbers.",
      3: "The stewards are easily startled. Please do not tap on the glass...",
      4: "If we're investigating an incident, we'll add the melon emoji to the message.",
      5: "Warnings and penalties will be posted in the race-updates channel.",
      6: "Racers may send diagrams depicting racing incidents to the stewards using the Melons 24h email. These diagrams will be stuck on the refrigerator so we can admire them.",
      7: "Fun fact: The inaugral Melons 24h event was won by Rust Bucket Racing and Was Cookin Racing Adventures.",
    }
    
    try {
      const nickname = await setNickname()
      const firstName = editNickName(nickname)
      const sassyString = setSassyString(firstName)
      messageDict[8] = mergeSassyString(firstName, sassyString);
      client.channels.cache.get(channel).send(messageDict[int]);
      console.log("MelonsBot: Sent auto-message.")
    } catch {
      console.log("Error sending bot message.")
    }
  }

  async function createEmbeddedAdvert() {
    var currentAdvert = advertCounter;
    if (currentAdvert > totalAdvertCount) {
      advertCounter = 1
    }

    try {
      const attachment = new Discord.MessageAttachment(`./melonsbot/images/discordimage_${advertCounter}.png`, `discordimage_${advertCounter}.png`);
      const embeddedAdvert = new MessageEmbed()
      .setColor('#0099ff')
	    .setTitle('A Message From Our Sponsors')
      .attachFiles(attachment)
      .setImage(`attachment://discordimage_${advertCounter}.png`);
      advertCounter += 1
      return embeddedAdvert
    } catch {
      console.log("Error creating embedded advert.")
      return
    }
  }

  async function postAdvertMessage(channel) {
    try {
      const embed = await createEmbeddedAdvert()
      client.channels.cache.get(channel).send(embed)
      console.log("MelonsBot: Sent advert message.")
    } catch {
      console.log("Error.")
    }
  }
});

client.on("guildMemberAdd", function(member){
    console.log("MelonsBot: User has joined - ");
    member.send("Hello, and welcome to the Melons 24h! Please take a moment to set your nickname to match your name in iRacing (Go to the channel menu > tap Melons 24h at the top > Change Nickname). Once you've done that, come and join us in the paddock!")
});

client.login(config.BOT_TOKEN);
