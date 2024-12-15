const express = require('express');
const expressApp = express();
const axios = require('axios');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { Telegraf } = require('telegraf');
const fs = require('fs');
// 3000 is the default port number for the webpage
const port = process.env.PORT || 3000; 
const bot = new Telegraf(process.env.BOT_TOKEN);
const filePath = './allowedUsers.json';

// Function to save user IDs
function saveAllowedUsers(users) {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');
}

// Function to load user IDs
function loadAllowedUsers() {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

let allowedUsers = loadAllowedUsers();

expressApp.use(helmet());
expressApp.use(express.json());
expressApp.use(express.static('static'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
expressApp.use(limiter);

// Middleware to restrict access to LAN and localhost only
expressApp.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const isLocalhost = clientIp === '127.0.0.1' || clientIp === '::1';
  const isLocalNetwork = clientIp.startsWith('192.168.');

  if (isLocalhost || isLocalNetwork) {
    next();
  } else {
    res.status(403).send('No access.');
  }
});

// Middleware to monitor users and manage first user
bot.use((ctx, next) => {
  if (allowedUsers.length === 0) {
    allowedUsers.push(ctx.from.id);
    saveAllowedUsers(allowedUsers);
    ctx.reply('You are the first user and have permission to add other users.');
  } else if (!allowedUsers.includes(ctx.from.id)) {
    ctx.reply("Sorry, you don't have permission to use this bot.");
  } else {
    return next();
  }
});

// Command to add a user /adduser <id>
bot.command('adduser', (ctx) => {
  if (allowedUsers.includes(ctx.from.id)) {
    const userId = parseInt(ctx.message.text.split(' ')[1]);
    if (!isNaN(userId) && !allowedUsers.includes(userId)) {
      allowedUsers.push(userId);
      saveAllowedUsers(allowedUsers);
      ctx.reply(`User with ID ${userId} added.`);
    } else {
      ctx.reply('Invalid ID or user already added.');
    }
  } else {
    ctx.reply('You do not have permission to add users.');
  }
});

// Command to delete a user /removeuser <id>
bot.command('removeuser', (ctx) => {
  if (allowedUsers.includes(ctx.from.id)) {
    const userId = parseInt(ctx.message.text.split(' ')[1]);
    if (!isNaN(userId) && allowedUsers.includes(userId)) {
      allowedUsers = allowedUsers.filter(id => id !== userId);
      saveAllowedUsers(allowedUsers);
      ctx.reply(`User with ID ${userId} removed.`);
    } else {
      ctx.reply('Invalid ID or user does not exist.');
    }
  } else {
    ctx.reply('You do not have permission to delete users.');
  }
});

// Handle /start command
bot.command('start', ctx => {
  console.log(ctx.from);
  ctx.reply('Hello, How are you?');
});

bot.launch();

// Serve the main HTML page
expressApp.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + '/html/index.html'));
});

// Start the Express server
expressApp.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});