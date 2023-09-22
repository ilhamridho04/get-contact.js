# This api unofficial from GetContact

[![npm](https://img.shields.io/npm/v/get-contact.js.svg)](https://www.npmjs.com/package/get-contact.js)

# whatsapp-web.js

A WhatsApp API client that connects through the WhatsApp Web browser app

It uses Puppeteer to run a real instance of Whatsapp Web to avoid getting blocked.

**NOTE:** I can't guarantee you will not be blocked by using this method, although it has worked for me. WhatsApp does not allow bots or unofficial clients on their platform, so this shouldn't be considered totally safe.

## Quick Links

- [GitHub](https://github.com/ilhamridho04/get-contact.js)
- [npm](https://npmjs.org/package/get-contact.js)

## Installation

The module is now available on npm! `npm i whatsapp-web.js`

Please note that Node v12+ is required.

## Example usage

```js
const { GClient } = require("get-contact.js");

const gclient = new GClient();

client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  console.log("QR RECEIVED", qr);
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.initialize();
```

Take a look at [example.js](https://github.com/ilhamridho04/get-contact.js/blob/main/test/searchNumber.test.js) for another example with more use cases.
