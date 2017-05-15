# line-bot
A demo bot to interact with other LINE users

### Setup on OpenShift
 - You need to have an [OpenShift](https://www.openshift.com/) account first. 
 - Login to OpenShift Web management console 
 - Create an cartridge for the latest Node.js and `git clone` this project to your cartridge
 - Modify  
 
### Setup on LINE Messaging/Bot service
 - Create a new [LINE Messageing API](https://business.line.me/en/services/bot) 
 - Fill in the required information
 - Make sure your enable the functino `webhook`
 - Fill in the URL of webhook `https://[your-cartridge].rhcloud.com/webhook`
 - Get your CHANNEL_TOKEN from web console and paste it to the file line-bot.js
 - Get your LINE ID/QR Code from web console.

### Setup on your LINE
 - First, login your LINE on PC/mobile
 - Add LINE Bot by LINE ID/QR Code
 - Send a test message in the LINE bot, and you will recvice an echo message.
 - Send a broadcast message by: `curl -X GET https://[your-cartridge].rhcloud.com/line-bot` 

### Reference
 - [LINE Messaging API](https://business.line.me/en/services/bot)
 - [LINE Mesaaging Doc](https://devdocs.line.me/)

### Demo
 ![demo](https://github.com/calmelated/line-bot/blob/master/line-bot.jpg?raw=true)
