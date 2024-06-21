"use strict";

const Base = require("./Base");

/**
 * Represents a Message on WhatsApp
 * @extends {Base}
 */
class Histories extends Base {
  constructor(client, data) {
    super(client);

    if (data) this._patch(data);
  }

  _patch(data) {
    this._data = data;

    /**
     * Badge for Histories
     * @type {string}
     */
    this.badge = data.badge;

    /**
     * Country Code for Histories
     * @type {string}
     */
    this.countryCode = data.countryCode;

    /**
     * Date for HostoryList
     * @type {string}
     */
    this.date = data.date;

    /**
    * Name for Histories
    * @type {string}
    */
    this.name = data.displayName;

    /**
    * Image for Histories
    * @type {string}
    */
    this.image = data.image;

    /**
     * Name for Histories
     * @type {string}
     */
    this.phone_number = data.number;

    return super._patch(data);
  }
}

module.exports = Histories;
