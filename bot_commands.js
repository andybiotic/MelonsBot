const botCheckString = "!bot";
const botTestString = "!test";
const botRandomString = "!random";
const botAdvertString = "!ad";
const botHelpString = "!help";

const helpInformation = `
MelonsBot is running.

*You can communicate with MelonsBot here in the bot channel, using the commands listed below.*

*Testing and Debugging:*
*${botCheckString}* -- Replies when MelonsBot is up and active.
*${botTestString}* -- Sends a specific message to test to the bot channel. 
*${botRandomString}* -- Sends a random message to the bot channel.
*${botHelpString}* -- Repeats this message in the bot channel.


*Send a public message:*
*${botAdvertString}* -- Posts an advert in sequence to the paddock channel. Loops when all adverts have been posted.
MelonsBot will also reply periodically in the race control channel with a random message.
`

module.exports = { botCheckString, botTestString, botRandomString, botAdvertString, botHelpString, helpInformation}