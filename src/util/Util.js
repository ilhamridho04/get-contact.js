"use strict";

const path = require("path");
const Crypto = require("crypto");
const { tmpdir } = require("os");
const ffmpeg = require("fluent-ffmpeg");
const webp = require("node-webpmux");
const fs = require("fs").promises;
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/**
 * Utility methods
 */
class Util {
  constructor() {
    throw new Error(
      `The ${this.constructor.name} class may not be instantiated.`
    );
  }

  static generateHash(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   * Sets default properties on an object that aren't already specified.
   * @param {Object} def Default properties
   * @param {Object} given Object to assign defaults to
   * @returns {Object}
   * @private
   */
  static mergeDefault(def, given) {
    if (!given) return def;
    for (const key in def) {
      if (!has(given, key) || given[key] === undefined) {
        given[key] = def[key];
      } else if (given[key] === Object(given[key])) {
        given[key] = Util.mergeDefault(def[key], given[key]);
      }
    }

    return given;
  }

  /**
   * Configure ffmpeg path
   * @param {string} path
   */
  static setFfmpegPath(path) {
    ffmpeg.setFfmpegPath(path);
  }
}

module.exports = Util;
