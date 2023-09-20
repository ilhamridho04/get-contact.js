"use strict";

const Constants = require("./src/util/Constants");

module.exports = {
  GClient: require("./src/GClient"),

  version: require("./package.json").version,

  // Structures

  // Auth Strategies
  GLocalAuth: require("./src/authStrategies/GLocalAuth"),

  ...Constants,
};
