const Discord = require("discord.js");
const config = require("./config.json");
const client = new Discord.Client();
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

const messageInfoDict = require('./message_strings.js');
const botCommands = require('./bot_commands.js');

// Channel IDs. Do not change.
const channelBot = "851879147001348119";
const channelRaceControl = "845976526747074581";
const channelPaddock = "788509056880738307";

const messageBotOperational = "MelonsBot is running!";

const totalRaceControlMessageCount = Object.keys(messageInfoDict.messageInfoDict).length;
const totalPaddockMessageCount = Object.keys(messageInfoDict.paddockMessageStrings).length;
const totalAdvertCount = 20

async function postHelpMessage() {
  try {
    client.channels.cache.get(channelBot).send(botCommands.helpInformation);
    console.log("MelonsBot: Sent help message.")
  } catch {
    console.log("Error sending help message.")
  }
}

async function postReminderMessage(channel) {
  try {
    client.channels.cache.get(channel).send(botCommands.reminderInformation);
    console.log("MelonsBot: Sent reminder message.")
  } catch {
    console.log("Error sending reminder message.")
  }
}

function checkImagesAtStartup() {
  try {
    for (let i = 1; i <= totalAdvertCount; i++) {
      if (fs.existsSync(`./melonsbot/images/discordimage_${advertCounter}.png`)) {
        console.log(`Check ${i}/${totalAdvertCount} completed.`)
        advertCounter += 1
      } else {
      console.log(`Failed to load advert ${i}. Check name and file location.`)
      process.kill(process.pid, 'SIGTERM')
      }
    }
    advertCounter = 1
    console.log("All adverts loaded.") 
  } catch {
    console.log("Startup Error.")
  }
}

console.log("MelonsBot: Up and running!");

client.on("ready", () => {
  console.log("MelonsBot: Ready and waiting!");
  console.log(`MelonsBot: Loaded ${totalRaceControlMessageCount} messages.`)
  checkImagesAtStartup();
  postHelpMessage();
});

var raceControlMessageCounter = 1;
var paddockMessageCounter = 1;
var advertCounter = 1;

client.on("message", function(message) {

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  console.log("MelonsBot: Analysing incoming message.");

  if (message.author.bot) {
    console.log("MelonsBot: Message was sent by bot. Discarding.");
    return;
  }

  if (message.channel.id === channelBot) {
    console.log("MelonsBot: Message received in Bot channel.");
    if (message.content.startsWith(botCommands.botCheckString)) {
      console.log("MelonsBot: Bot check.");
      client.channels.cache.get(channelBot).send(messageBotOperational);
      return
    } else if (message.content.startsWith(botCommands.botTestString)) {
      // POST TEST TO BOT CHANNEL - CAN CHANGE TEST MESSAGE HERE.
      postChannelMessage(channelBot, 8);
    } else if (message.content.startsWith(botCommands.botAdvertString)) {
      // POST ADVERT TO CHANNEL - SET CHANNEL HERE.
      postAdvertMessage(channelBot);
    } else if (message.content.startsWith(botCommands.botRandomString)) {
      // POST RANDOM TEST MESSAGE TO BOT CHANNEL.
      postChannelMessage(channelBot, getRandomInt(totalMessageCount));
    } else if (message.content.startsWith(botCommands.botHelpString)) {
      // POST HELP MESSAGE TO BOT CHANNEL.
      postHelpMessage();
    } else if (message.content.startsWith(botCommands.botReminderString)) {
      // POST REMINDER TO CHANNEL - SET CHANNEL HERE.
      postReminderMessage(channelBot);
    } else if (message.content.startsWith(botCommands.botPaddockString)) {
      // POST MESSAGE TO PADDOCK - SET CHANNEL HERE.
      postPaddockMessage(channelBot);
    }
    return
  }

  if (message.channel.id === channelRaceControl) {
    console.log("MelonsBot: Message sent by user in Race Control channel.");
    raceControlMessageCounter += 1;

    if (raceControlMessageCounter % 5 === 0) {
      // AUTO POST RACE CONTROL MESSAGE HERE. ADJUST INT ABOVE FOR POSTING FREQUENCY.
      postRaceControlMessage(channelRaceControl, getRandomInt(totalRaceControlMessageCount));
      console.log("MelonsBot: Sent race control message.");
    }
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

  async function postRaceControlMessage(channel, int) {
    var messageDict = messageInfoDict
    
    try {
      const nickname = await setNickname()
      const firstName = editNickName(nickname)

      if (int == 6) {
        const specialMessage = mergeSassyString(firstName, messageDict[6]);
        client.channels.cache.get(channel).send(specialMessage);
      } else {
        client.channels.cache.get(channel).send(messageDict[int]);
      }
      console.log(`MelonsBot: Sent auto-message ${int}.`)
    } catch {
      console.log("Error sending bot message.")
    }
  }

  async function postPaddockMessage(channel) {
    var messageDict = messageInfoDict.paddockMessageStrings

    try {
      client.channels.cache.get(channel).send(messageDict[paddockMessageCounter]);
      if (paddockMessageCounter == totalPaddockMessageCount) {
        paddockMessageCounter = 1
      } else {
        paddockMessageCounter += 1
      }
    } catch {
      console.log("Error sending paddock message.")
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
    const number = advertCounter

    try {
      const embed = await createEmbeddedAdvert()
      client.channels.cache.get(channel).send(embed)
      console.log(`MelonsBot: Sent advert message ${number.toString()}/${totalAdvertCount.toString()}.`)
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
