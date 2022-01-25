const botCheckString = "!bot";
const botTestString = "!test";
const botRandomString = "!random";
const botAdvertString = "!ad";
const botHelpString = "!help";
const botReminderString = "!remind";
const botPaddockString = "!paddock";
const botSwitchModeString = "!mode";

const helpInformation = `
MelonsBot is running.

*You can communicate with MelonsBot here in the bot channel, using the commands listed below.*

**Testing and Debugging:**
*${botCheckString}* -- Check if MelonsBot is active.
*${botTestString}* -- Send a specific message to test to the bot channel. 
*${botRandomString}* -- Send a random message to the bot channel.
*${botHelpString}* -- Repeat this message in the bot channel.
*${botSwitchModeString}* -- Switch from Test Mode to Race Mode.


**Send a public message:**
*${botAdvertString}* -- Post an advert in sequence to the paddock channel. Loops when all adverts have been posted.
*${botReminderString}* -- Post a reminder to members in the paddock channel.
*${botPaddockString}* -- Post a fun message to the paddock. Loops when all messages have been posted.

*MelonsBot will also reply periodically in the race control channel with a random helpful message.*
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
    helpInformation, 
    reminderInformation,
}