"use strict";

const EventEmitter = require("events");
const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const downloadFolder = "./uploads/qrcode";
const QrCode = require("qrcode-reader");
const Jimp = require("jimp");

const Util = require("./util/Util");
const { GcontcWebURL, DefaultOptions, Events } = require("./util/Constants");
const PhoneNumber = require("./structures/PhoneNumber");

/**
 * Starting point for interacting with the WhatsApp Web API
 * @extends {EventEmitter}
 * @param {object} options - GClient options
 * @param {AuthStrategy} options.authStrategy - Determines how to save and restore sessions. Will use LegacySessionAuth if options.session is set. Otherwise, NoAuth will be used.
 * @param {string} options.webVersion - The version of WhatsApp Web to use. Use options.webVersionCache to configure how the version is retrieved.
 * @param {object} options.webVersionCache - Determines how to retrieve the WhatsApp Web version. Defaults to a local cache (LocalWebCache) that falls back to latest if the requested version is not found.
 * @param {number} options.authTimeoutMs - Timeout for authentication selector in puppeteer
 * @param {object} options.puppeteer - Puppeteer launch options. View docs here: https://github.com/puppeteer/puppeteer/
 * @param {number} options.qrMaxRetries - How many times should the qrcode be refreshed before giving up
 * @param {number} options.takeoverOnConflict - If another whatsapp web session is detected (another browser), take over the session in the current browser
 * @param {number} options.takeoverTimeoutMs - How much time to wait before taking over the session
 * @param {string} options.userAgent - User agent to use in puppeteer
 * @param {string} options.ffmpegPath - Ffmpeg path to use when formating videos to webp while sending stickers
 * @param {boolean} options.bypassCSP - Sets bypassing of page's Content-Security-Policy.
 * @param {object} options.proxyAuthentication - Proxy Authentication object.
 *
 * @fires GClient#qr
 * @fires GClient#authenticated
 * @fires GClient#auth_failure
 * @fires GClient#ready
 * @fires GClient#disconnected
 * @fires GClient#change_state
 */
class GClient extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = Util.mergeDefault(DefaultOptions, options);

    this.authStrategy = this.options.authStrategy;

    this.authStrategy.setup(this);

    this.pupBrowser = null;
    this.pupPage = null;

    Util.setFfmpegPath(this.options.ffmpegPath);
  }

  /**
   * Sets up events and requirements, kicks off authentication request
   */
  async initialize() {
    let [browser, page] = [null, null];

    await this.authStrategy.beforeBrowserInitialized();

    const puppeteerOpts = this.options.puppeteer;
    if (puppeteerOpts && puppeteerOpts.browserWSEndpoint) {
      browser = await puppeteer.connect(puppeteerOpts);
      page = await browser.newPage();
    } else {
      const browserArgs = [...(puppeteerOpts.args || [])];
      if (!browserArgs.find((arg) => arg.includes("--user-agent"))) {
        browserArgs.push(`--user-agent=${this.options.userAgent}`);
      }

      browser = await puppeteer.launch({ ...puppeteerOpts, args: browserArgs });
      page = (await browser.pages())[0];
    }

    if (this.options.proxyAuthentication !== undefined) {
      await page.authenticate(this.options.proxyAuthentication);
    }

    await page.setUserAgent(this.options.userAgent);
    if (this.options.bypassCSP) await page.setBypassCSP(true);

    this.pupBrowser = browser;
    this.pupPage = page;

    await this.authStrategy.afterBrowserInitialized();

    await page.goto(GcontcWebURL, {
      waitUntil: "load",
      timeout: 0,
      referer: "https://getcontact.com/",
    });

    const INTRO_IMG_SELECTOR = ".hn-user";
    const INTRO_QRCODE_SELECTOR = ".qrcode img";

    // Checks which selector appears first
    const needAuthentication = await Promise.race([
      new Promise((resolve) => {
        page
          .waitForSelector(INTRO_IMG_SELECTOR, {
            timeout: this.options.authTimeoutMs,
          })
          .then(() => resolve(false))
          .catch((err) => resolve(err));
      }),
      new Promise((resolve) => {
        page
          .waitForSelector(INTRO_QRCODE_SELECTOR, {
            timeout: this.options.authTimeoutMs,
          })
          .then(() => resolve(true))
          .catch((err) => resolve(err));
      }),
    ]);

    // Checks if an error occurred on the first found selector. The second will be discarded and ignored by .race;
    if (needAuthentication instanceof Error) throw needAuthentication;

    // Scan-qrcode selector was found. Needs authentication
    if (needAuthentication) {
      const { failed, failureEventPayload, restart } =
        await this.authStrategy.onAuthenticationNeeded();
      if (failed) {
        /**
         * Emitted when there has been an error while trying to restore an existing session
         * @event GClient#auth_failure
         * @param {string} message
         */
        this.emit(Events.AUTHENTICATION_FAILURE, failureEventPayload);
        await this.destroy();
        if (restart) {
          // session restore failed so try again but without session to force new authentication
          return this.initialize();
        }
        return;
      }

      const QR_CONTAINER = ".qrcode img";
      const QR_RETRY_BUTTON = ".q-refresh > a";
      let qrRetries = 0;
      let imagePath;
      let QRCode;
      await page.exposeFunction("qrChanged", async (qr) => {
        const newPage = await browser.newPage();
        const response = await newPage.goto(qr);

        if (response.ok()) {
          // Menghasilkan nama berkas acak dengan ekstensi .png
          const randomFileName =
            crypto.randomBytes(16).toString("hex") + ".png";

          // Path lengkap untuk menyimpan gambar
          imagePath = path.join(downloadFolder, randomFileName);

          const imageBuffer = await response.buffer();

          // Menyimpan gambar ke folder yang ditentukan
          fs.writeFileSync(imagePath, imageBuffer);

          console.log(`Gambar berhasil disimpan di ${imagePath}`);
          await newPage.close();

          // Membaca QR code dari gambar
          const image = await Jimp.read(imagePath);
          const qr = new QrCode();
          qr.callback = (err, value) => {
            if (err) {
              console.error(err);
            } else {
              console.log("Hasil scan QR code:", value.result);
              QRCode = value.result;
              fs.unlinkSync(imagePath);
            }
          };
          qr.decode(image.bitmap);
        } else {
          console.error(`Gagal mengunduh gambar dari ${imageUrl}`);
          await newPage.close();
        }
        /**
         * Emitted when a QR code is received
         * @event GClient#qr
         * @param {string} qr QR Code
         */
        this.emit(Events.QR_RECEIVED, QRCode);
        if (this.options.qrMaxRetries > 0) {
          qrRetries++;
          if (qrRetries > this.options.qrMaxRetries) {
            this.emit(Events.DISCONNECTED, "Max qrcode retries reached");
            await this.destroy();
          }
        }
      });

      await page.evaluate(
        async function (selectors) {
          const qrCodeElement = document.querySelector(selectors.QR_CONTAINER);
          window.qrChanged(qrCodeElement.src);
          return qrCodeElement ? qrCodeElement.src : null;
        },
        {
          QR_CONTAINER,
          QR_RETRY_BUTTON,
        }
      );

      // Wait for code scan
      try {
        await page.waitForSelector(INTRO_IMG_SELECTOR, { timeout: 0 });
      } catch (error) {
        if (
          error.name === "ProtocolError" &&
          error.message &&
          error.message.match(/Target closed/)
        ) {
          // something has called .destroy() while waiting
          return;
        }

        throw error;
      }
    }
    const authEventPayload = await this.authStrategy.getAuthEventPayload();

    /**
     * Emitted when authentication is successful
     * @event GClient#authenticated
     */
    this.emit(Events.AUTHENTICATED, authEventPayload);

    /**
     * Emitted when the client has initialized and is ready to receive messages.
     * @event GClient#ready
     */
    this.emit(Events.READY);
    this.authStrategy.afterAuthReady();
  }

  /**
   * Send a message to a specific chatId
   * @param {string} countryCode
   *
   * @returns {Promise<PhoneNumber>} Message that was just sent
   */
  async searchNumber(countryCode, phoneNumber = {}) {
    const newSearch = await this.pupPage.evaluate(
      async (countryCode, phoneNumber) => {
        const formElement = document.querySelector(".searchForm");
        // Isi formulir dengan data
        document.querySelector(".select-country").value = countryCode; // Ganti dengan selektor untuk memilih kode negara
        document.querySelector("#numberInput").value = phoneNumber; // Ganti dengan selektor untuk input nomor telepon
        document.querySelector(".g-recaptcha").click();
      },
      countryCode,
      phoneNumber
    );

    // Tunggu hasil pencarian dimuat (sesuai dengan kebutuhan Anda)
    await this.pupPage.waitForSelector(".box.r-profile-box"); // Ganti dengan selektor hasil pencarian

    const resultData = await this.pupPage.evaluate(() => {
      const result = {};
      // Mengambil informasi dari profil
      const profileBox = document.querySelector(".box.r-profile-box");
      if (profileBox) {
        result.name = profileBox.querySelector("h1").innerText;
        result.phone_number = profileBox.querySelector("strong a").innerText;
        result.provider = profileBox.querySelector("em").innerText;
      }

      // Mengambil informasi dari tag box
      const tagBox = document.querySelector(".box.r-tag-box");
      tagBox.querySelector("r-box-info");
      const buttonCollapse = tagBox.querySelector(".rbi-link");
      buttonCollapse.click();
      const buttonAttribute = buttonCollapse.getAttribute("aria-expanded");
      if (buttonAttribute != "true") {
        buttonCollapse.click();
      }
      const localStorage = JSON.stringify(window.localStorage);
      result.localStorage = JSON.parse(localStorage);
      return result;
    });
    return new PhoneNumber(this, resultData);
  }
}

module.exports = GClient;
