# TelegramBot
This bot is a basic NodeJs telegram bot that is ready to run.
The first user that speaks tot the bot will be the admin and is able
to add and remove users by /adduser and /removeuser
It includes a blank webpage you could use to build one of your own.
This webpage is limited to LAN only. Use http://localhost:3000 to reach it.
All you need to do is enter your bot's API key and run it.

# Getting Started
Contact @BotFather on telegram and issue /newbot
Follow the steps untill you get a new key.

Make or change the .env file and put the key you just received in it.
    BOT_TOKEN=YourTokenHere

Run the script:
    node bot.js

# Bot Commands
/start
/adduser <user>
/removeuser <user>