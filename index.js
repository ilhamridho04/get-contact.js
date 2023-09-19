"use strict";

const Constants = require("./src/util/Constants");

module.exports = {
  Client: require("./src/Client"),

  version: require("./package.json").version,

  // Structures

  // Auth Strategies
  LocalAuth: require("./src/authStrategies/LocalAuth"),

  ...Constants,
};
