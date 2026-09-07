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

// Safety net: never let a stray rejected promise (e.g. a failed Discord
// API call) take the whole bot down.
process.on('unhandledRejection', function (reason) {
  console.log(`MelonsBot: Unhandled promise rejection: ${reason && reason.message ? reason.message : reason}`)
});

const controlMessages = require('./raceControlStrings.js');
const botCommands = require('./bot_commands.js');
const importer = require('./messageStringImporter.js');
const { channel } = require("diagnostics_channel");

// Channel IDs. Do not change.
const channelBot = config.CHANNEL_BOT;
const channelRaceControl = config.CHANNEL_RACECONTROL;
const channelPaddock = config.CHANNEL_PADDOCK;
const channelRaceUpdates = config.CHANNEL_RACEUPDATES;

var raceModeOn = false
var paddockMessageTarget = channelBot
var raceControlMessageTarget = channelBot
var raceUpdatesMessageTarget = channelBot

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
    raceUpdatesMessageTarget = channelRaceUpdates
    postBotSwitchMessage(channelBot)
    console.log("MelonsBot: Race Mode enabled.")
  } else {
    raceModeOn = false
    paddockMessageTarget = channelBot
    raceControlMessageTarget = channelBot
    raceUpdatesMessageTarget = channelBot
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

// Pulls the recorded timestamp out of an incident submission message.
// Expected format: "!incidentsubmitted - Car 123, 00:10:20"
function parseIncidentTimestamp(content) {
  const parts = content.split(",");
  return parts.length > 1 ? parts[parts.length - 1].trim() : "";
}

async function postIncidentMessage(content) {
  const timestamp = parseIncidentTimestamp(content);
  const incidentString = timestamp
    ? `Incident submitted. Recorded timestamp: ${timestamp}`
    : "Incident submitted.";
  try {
    client.channels.cache.get(raceUpdatesMessageTarget).send(incidentString);
    console.log(`MelonsBot: Sent incident message (${timestamp}).`)
  } catch {
    console.log("Error sending incident message.")
  }
}

// Strips a leading command word from an incident message, leaving the
// "Car 69, 00:03:54 - Warning" detail portion.
function parseIncidentDetails(content, command) {
  return content.slice(command.length).trim();
}

async function postIncidentResolvedMessage(content) {
  const details = parseIncidentDetails(content, botCommands.botIncidentResolvedString);
  const resolvedString = `Incident resolved: ${details}`;
  try {
    client.channels.cache.get(raceUpdatesMessageTarget).send(resolvedString);
    console.log(`MelonsBot: Sent incident resolved message (${details}).`)
  } catch {
    console.log("Error sending incident resolved message.")
  }
}

// Pulls the car number out of a spicy-badge message.
// Expected format: "!spicy Car 69"
function parseSpicyCarNumber(content) {
  const match = content.match(/car\s*(\S+)/i);
  return match ? match[1] : "";
}

async function postSpicyMessage(content) {
  const carNumber = parseSpicyCarNumber(content);
  const spicyString = `:hot_pepper: SPICY BADGE AWARDED TO CAR ${carNumber}. The stewards will review the team's conduct after the event.`;
  try {
    client.channels.cache.get(raceUpdatesMessageTarget).send(spicyString);
    console.log(`MelonsBot: Sent spicy badge message (Car ${carNumber}).`)
  } catch {
    console.log("Error sending spicy badge message.")
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

  // Incident messages are delivered to the bot channel by a webhook, so
  // they arrive flagged as bot/webhook messages. Let those through.
  const isIncidentMessage =
    message.channel.id === channelBot &&
    (message.content.startsWith(botCommands.botIncidentString) ||
      message.content.startsWith(botCommands.botIncidentResolvedString) ||
      message.content.startsWith(botCommands.botSpicyString));

  if (message.author.bot && !isIncidentMessage) {
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
    } else if (message.content.startsWith(botCommands.botIncidentResolvedString)) {
      // CONFIRM AN INCIDENT RESOLUTION (SENT HERE BY THE SHEET WEBHOOK).
      postIncidentResolvedMessage(message.content);
    } else if (message.content.startsWith(botCommands.botIncidentString)) {
      // CONFIRM AN INCIDENT SUBMISSION (SENT HERE BY THE FORM WEBHOOK).
      postIncidentMessage(message.content);
    } else if (message.content.startsWith(botCommands.botSpicyString)) {
      // AWARD A SPICY BADGE (SENT HERE BY THE SHEET WEBHOOK).
      postSpicyMessage(message.content);
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

client.on("guildMemberAdd", async function (member) {
  console.log("MelonsBot: User has joined - ");
  try {
    await member.send(`Hello, and welcome to the Melons 24h!

    Please take a moment to set your nickname to match your name in iRacing (Go to the channel menu > tap Melons 24h at the top > Change Nickname).

    The info channel contains important information and a link to download the race programme.

    Come and join us in the paddock!
    `)
  } catch (err) {
    console.log(`MelonsBot: Could not DM new member ${member.user?.tag ?? member.id}: ${err.message}`)
  }
});

client.login(config.BOT_TOKEN);
