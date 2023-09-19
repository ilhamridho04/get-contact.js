"use strict";

exports.GcontcWebURL = "https://web.getcontact.com/";

exports.DefaultOptions = {
  puppeteer: {
    headless: true,
    defaultViewport: null,
  },
  webVersion: "2.2333.11",
  webVersionCache: {
    type: "local",
  },
  authTimeoutMs: 0,
  qrMaxRetries: 0,
  takeoverOnConflict: false,
  takeoverTimeoutMs: 0,
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36",
  ffmpegPath: "ffmpeg",
  bypassCSP: false,
  proxyAuthentication: undefined,
};

/**
 * Client status
 * @readonly
 * @enum {number}
 */
exports.Status = {
  INITIALIZING: 0,
  AUTHENTICATING: 1,
  READY: 3,
};

/**
 * Events that can be emitted by the client
 * @readonly
 * @enum {string}
 */
exports.Events = {
  AUTHENTICATED: "authenticated",
  AUTHENTICATION_FAILURE: "auth_failure",
  READY: "ready",
  QR_RECEIVED: "qr",
  LOADING_SCREEN: "loading_screen",
  DISCONNECTED: "disconnected",
  STATE_CHANGED: "change_state",
};
