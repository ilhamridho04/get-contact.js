"use strict";

const Base = require("./Base");

/**
 * Represents a Message on WhatsApp
 * @extends {Base}
 */
class PhoneNumber extends Base {
  constructor(client, data) {
    super(client);

    if (data) this._patch(data);
  }

  _patch(data) {
    this._data = data;

    /**
     * Name for PhoneNumber
     * @type {string}
     */
    this.name = data.name;

    /**
     * Name for PhoneNumber
     * @type {string}
     */
    this.phone_number = data.phone_number;

    /**
     * Provider
     * @type {string}
     */
    this.provider = data.provider;

    /**
     * localStorage data for searchNumber
     * @type {Object}
     */
    this.localStorage = data.localStorage;
    return super._patch(data);
  }
}

module.exports = PhoneNumber;
