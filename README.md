#Live Coding TV Chat Bot

Created by Mr. Magma/JPG2000 (@JavascriptFTW) with help from his viewers

##How to Use

Instructions on how to use this bot are as follows

- Open the stream chat in a new window (by clicking the arrow in the upper right corner of the chatbox)
- Open the developer console within the new window by pressing `CTRL/CMD+SHIFT+K`
- Paste the bot.js file into the console and press enter

Congratulations! You've just added Bob the Bot to your stream! He will greet people when they join the stream and has a few commands as well! If you would like more commands than the base set of 3 then read the "Adding Commands" section!

This is the list of commands that anyone in the stream can use now.

- `/help` gets a list of all commands registered with the bot.
- `/help command` returns documentation for a command
- `/roster` outputs how many people are currently in the chat room
- `/who` gets the names of all people who are currently viewing the stream

##Adding Commands

If you would like to add extra commands to Bob then you will need to do the following

- Find the code for the commands that you would like to add. You can use some of the premade commands are in the addons folder, find someone else's command addons, or make your own.
- Open the developer console in the window that your chatbot is active in the same way you did to create your bot
- Paste your addon code into the console and press enter

Viola! Your bot now has new commands that can be used like any other!

##Hints

- To change your bots name, open the console and type `Bot.name = "Your new name"` into the command prompt and press enter.
- To change your bots welcome message open the console and type `Bot.welcome = "Your new welcome message"` or `Bot.welcome = ["Your new welcome message 1", "Your new welcome message 2", ...]` and press enter.
- To disable commands on your bot and make it only greet people who join your stream, open the console, type `Bot.enableCommands = false;`, then press enter.
- If you do not want your bot to greet people when they join the stream and simply accept commands then open the console and type `Bot.enableWelcome = false` and finally press enter.

##Creating Addons

Content coming soon!

##Contributing

Content coming soon!
