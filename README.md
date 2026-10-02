# MelonsBot - A Simple Event Assistant

## Features
- Listens for when new members join the server (guild) and sends them a welcome message.
- Responds to text commands to trigger messages or image embeds.
- Replies with an autoresponse at regular intervals.
- Lets users assign themselves the Team Principal role by posting in a requests channel.

## Installation and Setup
MelonsBot requires a `node.js` environment.

## Updating the config.json file
- The `config-mocks.json` file should be renamed `config.json`
- In this file, the mock value for `BOT_TOKEN` should be replaced with a bot token string from Discord which has the requried permissions.
- Nominate your channels. `CHANNEL_BOT` is used by MelonsBot to post confirmation messages and status reports. This should be a private channel. Any user in this channel can control the bot with commands. For example, `!bot` will ask MelonsBot to confirm it is operational.
- `CHANNEL_RACECONTROL` should be a public channel intended to be used by event participants to communicate with the stewards. MelonsBot will post a random reminder in this channel after a set amount of messages.
- MelonsBot will post messages and image embeds in the `CHANNEL_PADDOCK` channel.
- `CHANNEL_RACEUPDATES` should be a public channel for incident status updates. In race mode, incident submitted / incident resolved / spicy badge messages are posted here; in test mode they go to the `bot` channel.
- `CHANNEL_TEAM_PRINCIPAL_REQUESTS` is the channel where users request the Team Principal role (see below).
- `ROLE_TEAM_PRINCIPAL` is the ID of the role MelonsBot grants to team principals.

## Start MelonsBot
Navigate to the MelonsBot folder and run `node index.js` from the terminal.

## Control MelonsBot
In the `bot` channel, typing `!help` will reveal a list of commands.

## Test Mode
MelonsBot is enabled in Test Mode by default. In Test Mode, all MelonsBot messages are posted to the `bot` channel. `!mode` will switch the bot to the live race mode.

## Team Principal Role
Any message posted in the `CHANNEL_TEAM_PRINCIPAL_REQUESTS` channel grants its author the `ROLE_TEAM_PRINCIPAL` role. Posting `remove` (not case-sensitive) in the same channel removes the role again. MelonsBot reacts with 🍉 once the role has been updated. This works in both Test Mode and Race Mode.

The bot requires the following pernissions:
- Manage Roles
- Add Reactions
- Bypass Slowmode (optional, depending on channel configuration)

The bot's own role must sit above the Team Principal role in Server Settings > Roles.

## Personalisation and Customisation
The `paddockmessages.txt` file can be customised with a series of messages, which MelonsBot will post. Each message should be entered on a new line.

## Image embeds
For image embeds, an `images` folder should be place within the `MelonsBot` directory, which contains PNG files named `discordimage_1.png`, `discordimage_2.png` and so on. Only PNG files are supported at this time.





