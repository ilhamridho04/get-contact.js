const { GClient, GLocalAuth } = require("./index");
const qrcode = require("qrcode-terminal");

const client = new GClient({
  // proxyAuthentication: { username: 'username', password: 'password' },
  puppeteer: {
    // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
    headless: false,
  },
  authStrategy: new GLocalAuth({
    clientId: "test-aja-inimah",
    // dataPath: './.wwebjs_auth/'
  }),
});

client.initialize();

client.on("loading_screen", (percent, message) => {
  console.log("LOADING SCREEN", percent, message);
});

client.on("qr", (qr) => {
  // NOTE: This event will not be fired if a session is specified.
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", async () => {
  console.log("AUTHENTICATED");
  client.searchNumber("ID", "085771116774").then((result) => {
    console.log(result);
  });
});

client.on("auth_failure", (msg) => {
  // Fired if session restore was unsuccessful
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on("ready", () => {
  console.log("READY");
});
