# This api unofficial from GetContact

[![npm](https://img.shields.io/npm/v/get-contact.js.svg)](https://www.npmjs.com/package/get-contact.js)

# get-contact.js

A GetContact API gclient that connects through the GetContact Web browser app

It uses Puppeteer to run a real instance of GetContact Web to avoid getting blocked.

**NOTE:** I can't guarantee you will not be blocked by using this method, although it has worked for me. GetContact does not allow bots or unofficial clients on their platform, so this shouldn't be considered totally safe.

## Quick Links

- [GitHub](https://github.com/ilhamridho04/get-contact.js)
- [npm](https://npmjs.org/package/get-contact.js)

## Installation on no-gui systems
For puppeteer to work, you need to install the following dependencies with the apt-get command (remember to apt-get update before you install).

```
sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

## Installation

The module is now available on npm! `npm i get-contact.js`

Please note that Node v12+ is required.

## Example usage

```js
const { GClient } = require("get-contact.js");

const gclient = new GClient();

gclient.on("qr", (qr) => {
  // Generate and scan this code with your phone
  console.log("QR RECEIVED", qr);
});

gclient.on("ready", () => {
  console.log("Client is ready!");
});

gclient.initialize();
```

Take a look at [example.js](https://github.com/ilhamridho04/get-contact.js/blob/main/test/searchNumber.test.js) for another example with more use cases.

## Reference

https://github.com/pedroslopez/whatsapp-web.js
