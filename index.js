const Discord = require("discord.js");
const config = require("./config.json");
const { Client, GatewayIntentBits, Events, Partials } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User
  ]
});
const fs = require('fs');
const path = require('path')

const controlMessages = require('./raceControlStrings.js');
const botCommands = require('./bot_commands.js');
const importer = require('./messageStringImporter.js');
const { channel } = require("diagnostics_channel");

// Channel IDs. Do not change.
const channelBot = config.CHANNEL_BOT;
const channelRaceControl = config.CHANNEL_RACECONTROL;
const channelPaddock = config.CHANNEL_PADDOCK;

var raceModeOn = false
var paddockMessageTarget = channelBot
var raceControlMessageTarget = channelBot

const messageBotOperational = "MelonsBot is running!";

var paddockMessages = [""]
var paddockMessageTotal = 0
var raceControlMessageCounter = 1;
var paddockMessageCounter = 0;
var advertCounter = 1;
var totalAdvertCount = 0;

const totalRaceControlMessageCount = Object.keys(controlMessages.raceControlDict).length;

function switchRaceMode() {
  if (raceModeOn == false) {
    raceModeOn = true
    paddockMessageTarget = channelPaddock
    raceControlMessageTarget = channelRaceControl
    postBotSwitchMessage(channelBot)
    console.log("MelonsBot: Race Mode enabled.")
  } else {
    raceModeOn = false
    paddockMessageTarget = channelBot
    raceControlMessageTarget = channelBot
    postBotSwitchMessage(channelBot)
    console.log("MelonsBot: Test Mode enabled.")
  }
}

function postBotSwitchMessage(channel) {
  var modeString = ""

  if (raceModeOn == true) {
    modeString = "Race Mode enabled. WARNING: Any paddock messages, adverts and race control messages will be sent to the whole server."
  } else {
    modeString = "Test Mode enabled. Go nuts."
  }
  client.channels.cache.get(channel).send(modeString);
}

async function postHelpMessage() {
  try {
    client.channels.cache.get(channelBot).send(botCommands.helpInformation);
    console.log("MelonsBot: Sent help message.")
  } catch {
    console.log("Error sending help message.")
  }
}

async function postStartupMessage() {
  try {
    client.channels.cache.get(channelBot).send(botCommands.startupMessage);
    console.log("MelonsBot: Sent startup message.")
  } catch {
    console.log("Error sending startup message.")
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
    var imageIsAvailable = true
    while (imageIsAvailable === true) {
      let imagePath = path.join(__dirname, 'images', `discordimage_${advertCounter}.png`)
      if (fs.existsSync(imagePath)) {
        console.log(`Check ${advertCounter} completed.`)
        advertCounter += 1
        totalAdvertCount += 1
      } else {
        imageIsAvailable = false
        console.log(`MelonsBot: Failed to load advert ${imagePath}. Continuing startup...`)
      }
    }
    advertCounter = 1
    console.log("MelonsBot: Advert checks complete.")
  } catch {
    console.log("MelonsBot: Startup Error.")
    process.kill(process.pid, 'SIGTERM')
  }
}

async function loadMessagesAtStartup() {
  try {
    paddockMessages = importer.importStrings()
    paddockMessageTotal = paddockMessages.length
    console.log(`MelonsBot: Loaded ${paddockMessageTotal} paddock messages.`)
  } catch {
    console.log("Failed to load paddock messages.")
  }
}

console.log(`MelonsBot: Up and running! Version: ${config.MELONSBOT_VERSION}`);

client.on("ready", () => {
  console.log("MelonsBot: Ready and waiting!");
  console.log(`MelonsBot: Loaded ${totalRaceControlMessageCount} race control messages.`)

  checkImagesAtStartup();
  loadMessagesAtStartup();
  postStartupMessage();
});

client.on("messageCreate", function (message) {

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function resetAllMessageCounts() {
    raceControlMessageCounter = 1;
    paddockMessageCounter = 0;
    advertCounter = 1;
    const message = "Reset MelonsBot. Ready to go again."
    client.channels.cache.get(channelBot).send(message);
    console.log("MelonsBot: Reset.");
  }

  console.log("MelonsBot: Analysing incoming message.");
  if (raceModeOn == false) {
    // console.log(`MelonsBot: Message - ${message.content}`)
  }

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
      postRaceControlMessage(raceControlMessageTarget, getRandomInt(totalRaceControlMessageCount));
    } else if (message.content.startsWith(botCommands.botAdvertString)) {
      // POST ADVERT TO CHANNEL - SET CHANNEL HERE.
      postAdvertMessage(paddockMessageTarget);
    } else if (message.content.startsWith(botCommands.botRandomString)) {
      // POST RANDOM TEST MESSAGE TO BOT CHANNEL.
      postRaceControlMessage(raceControlMessageTarget, getRandomInt(totalRaceControlMessageCount));
    } else if (message.content.startsWith(botCommands.botHelpString)) {
      // POST HELP MESSAGE TO BOT CHANNEL.
      postHelpMessage();
    } else if (message.content.startsWith(botCommands.botReminderString)) {
      // POST REMINDER TO CHANNEL - SET CHANNEL HERE.
      postReminderMessage(paddockMessageTarget);
    } else if (message.content.startsWith(botCommands.botPaddockString)) {
      // POST MESSAGE TO PADDOCK - SET CHANNEL HERE.
      postPaddockMessage(paddockMessageTarget);
    } else if (message.content.startsWith(botCommands.botSwitchModeString)) {
      // SWITCHES BETWEEN TEST MODE AND RACE MODE.
      switchRaceMode();
    } else if (message.content.startsWith(botCommands.botResetString)) {
      // RESETS ALL MESSAGES, STARTS AGAIN.
      resetAllMessageCounts();
    }
    return
  }

  if (message.channel.id === channelRaceControl) {
    console.log("MelonsBot: Message sent by user in Race Control channel.");
    raceControlMessageCounter += 1;
    console.log(`MelonsBot: Race control counter = ${raceControlMessageCounter}`)

    if (raceControlMessageCounter % 5 === 0) {
      // AUTO POST RACE CONTROL MESSAGE HERE. ADJUST INT ABOVE FOR POSTING FREQUENCY.
      postRaceControlMessage(raceControlMessageTarget, getRandomInt(totalRaceControlMessageCount));
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
    console.log(`${controlMessages.raceControlDict[0]}`)

    try {
      const nickname = await setNickname()
      const firstName = editNickName(nickname)

      if (int == 6) {
        const specialMessage = mergeSassyString(firstName, controlMessages.raceControlDict[6]);
        client.channels.cache.get(channel).send(specialMessage);
      } else {
        client.channels.cache.get(channel).send(controlMessages.raceControlDict[int]);
      }
      console.log(`MelonsBot: Sent auto-message ${int}.`)
    } catch {
      console.log("Error sending bot message.")
    }
  }

  function postPaddockMessage(channel) {
    try {
      const message = paddockMessages[paddockMessageCounter]
      client.channels.cache.get(channel).send(message);
      console.log(`MelonsBot: Sent paddock message ${paddockMessageCounter + 1}/${paddockMessageTotal}.`)
      if (paddockMessageCounter == paddockMessageTotal - 1) {
        console.log("MelonsBot: All messages sent. Starting over.")
        paddockMessageCounter = 0
      } else {
        paddockMessageCounter += 1
      }
    } catch {
      console.log("Error sending paddock message.")
    }
  }

  async function postAdvertMessage(channel) {
    console.log("MelonsBot: Posting Advert...")
    if (advertCounter > totalAdvertCount) {
      advertCounter = 1
    }
    const imagePath = path.join(__dirname, 'images', `discordimage_${advertCounter}.png`)
    const attachment = new Discord.AttachmentBuilder(imagePath, { name: `discordimage_${advertCounter}.png` });
    const embeddedAdvert = new Discord.EmbedBuilder()
      .setColor('#D5114C')
      .setTitle('A Message From Our Sponsors')
      .setImage(`attachment://discordimage_${advertCounter}.png`);
    advertCounter += 1
    client.channels.cache.get(channel).send({ embeds: [embeddedAdvert], files: [attachment] })
    console.log(`MelonsBot: Sent advert message ${advertCounter.toString()}/${totalAdvertCount.toString()}.`)
  }
});

client.on("guildMemberAdd", function (member) {
  console.log("MelonsBot: User has joined - ");
  member.send(`Hello, and welcome to the Melons 24h! 
    
    Please take a moment to set your nickname to match your name in iRacing (Go to the channel menu > tap Melons 24h at the top > Change Nickname). 
    
    The info channel contains important information and a link to download the race programme. 
    
    Come and join us in the paddock!
    `)
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  // When a reaction is received, check if the structure is partial
  if (reaction.partial) {
    // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error);
      // Return as `reaction.message.author` may be undefined/null
      return;
    }
  }

  function postRaceControlAcknowledgement(channel) {
    let acknowledgeString = "Incident acknowledged. We are checking..."
    client.channels.cache.get(channel).send(acknowledgeString);
  }

  var reactionChannel = channelBot

  if (raceModeOn) {
    reactionChannel = channelRaceControl
  }

  if (reactionChannel == reaction.message.channel.id && reaction.emoji.identifier == "%F0%9F%8D%89") {
    postRaceControlAcknowledgement(reactionChannel)
  }

});

client.login(config.BOT_TOKEN);
