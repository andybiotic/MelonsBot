const botCheckString = "!bot";
const botTestString = "!test";
const botRandomString = "!random";
const botAdvertString = "!ad";
const botHelpString = "!help";
const botReminderString = "!remind";
const botPaddockString = "!paddock";
const botSwitchModeString = "!mode";
const botResetString = "!reset";

const startupMessage = 'MelonsBot is running. Type !help for commands and information.'
const helpInformation = `
*You can control MelonsBot here in the bot channel, using the commands listed below.*

**Testing and debugging:**
*${botCheckString}* -- Check if MelonsBot is active.
*${botTestString}* -- Send a specific test message to the bot channel. 
*${botRandomString}* -- Send a random message to the bot channel.
*${botHelpString}* -- Repeat this message in the bot channel.
*${botSwitchModeString}* -- Switch from Test Mode to Race Mode.
*${botResetString}* -- Start all message cycles from the beginning.

In Test Mode, all adverts and paddock messages are sent to the bot channel for testing. In Race Mode, messages are sent to the the paddock channel.

**Send a server message:**
*${botAdvertString}* -- Post an advert in sequence to the paddock channel. Loops when all adverts have been posted.
*${botReminderString}* -- Post a reminder to members in the paddock channel.
*${botPaddockString}* -- Post a fun message to the paddock. Loops when all messages have been posted.

*MelonsBot will also post randomly (after every 5 messages) in the race control channel with a random helpful message.*
`

const reminderInformation = `
Just a quick reminder: Please ensure your channel nickname matches your name as it is displayed in iRacing. Check your Server Profile to change it.
`

module.exports = { 
    botCheckString, 
    botTestString, 
    botRandomString, 
    botAdvertString, 
    botHelpString, 
    botReminderString, 
    botPaddockString,
    botSwitchModeString,
    botResetString,
    startupMessage,
    helpInformation, 
    reminderInformation,
}