#!/bin/env node

const express        = require('express');
const bodyParser     = require('body-parser');
const path           = require('path');
const fs             = require('fs');
const request        = require("request");
const http           = require('http');
const app            = express();
const PORT           = process.env.OPENSHIFT_NODEJS_PORT || 8888 ;
const ADDR           = process.env.OPENSHIFT_NODEJS_IP   || '0.0.0.0' ;

// LINE Bot
const LINE_REPLY_API = 'https://api.line.me/v2/bot/message/reply';
const LINE_PUSH_API  = 'https://api.line.me/v2/bot/message/push';
const CHANNEL_TOKEN  = '';
const BOT_FILE       = 'bot-users.json';
let   botUsers       = {};

const botSend = (url, data) => {
  return new Promise((resolve, reject) => {
    request({
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer ' + CHANNEL_TOKEN,
      },
      body: JSON.stringify(data) 
    }, (err, response, body) => {
      if (err) {
        reject(err);
      } else {
        console.log('Response: ', body);
        resolve(body);
      }
    });
  });
};

const botBroadcast = async(message) => {
  let userIds = Object.keys(botUsers);  
  for(let i = 0; i < userIds.length; i++) {
    try {
      let data = {
        "to" : userIds[i],
        "messages": [{
          "type": "text",
          "text": message,
        }]
      };
      await botSend(LINE_PUSH_API, data);
    } catch(e) {
      console.dir(e);
    }
  }
};

const botEcho = async(evt) => {
  let data = {
    "replyToken" : evt.replyToken,
    "messages": [{
      "type": "text",
      "text": 'echo "' + evt.message.text + '"',
    }]
  };
  try {
    await botSend(LINE_REPLY_API, data);
  } catch(e) {
    console.dir(e);
  }
};

const readFile = (file) => {
  let ret = {};
  try { 
    let data = fs.readFileSync(file, 'utf8');
    if(data) {
      ret = JSON.parse(data); 
    }
  } catch(e) {
    console.dir(e);
  } finally {
    return ret;
  }
};

const writeFile = (file, data) => {
  try { 
    let _data = JSON.stringify(data);
    fs.writeFileSync(file, _data, 'utf8');     
  } catch(e) {
    console.dir(e);
  }
};

app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  botUsers = readFile(BOT_FILE);
  return next();
});


app.get('/health', (req, res) => {
  return res.end();
});

app.post('/webhook', async(req, res) => {
  if(!(req.body && req.body.events)) {
    return res.end();
  }
  const events = req.body.events;
  for(let i = 0; i < req.body.events.length; i++) {
    const evt = req.body.events[i];
    if(evt.type !== 'message') { 
      continue;
    } else if(!evt.message) {
      continue;
    } else if(evt.message.type !== 'text') {
      continue;
    } 

    // Update user list
    const userId = evt.source.userId;
    if(!botUsers[userId]) { // new user
      botUsers[userId] = 1;
      writeFile(BOT_FILE, botUsers);
    }

    // Echo user's messages
    try {
      await botEcho(evt);
    } catch(e) {
      console.dir(e);
    }
  }
  return res.end();
});

// Send LINE Bot test message (Broadcast)
app.get('/line-bot', async(req, res) => {
  let message = req.query.message ? req.query.message : 'Test Message!';
  await botBroadcast(message);
  return res.end();
});

app.listen(PORT, ADDR, () => {
  console.log(`Worker ${process.pid} started at Port ${PORT}`);
});

