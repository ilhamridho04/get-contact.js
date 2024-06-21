"use strict";

const Constants = require("./src/util/Constants");

module.exports = {
  GClient: require("./src/GClient"),

  version: require("./package.json").version,

  // Structures
  PhoneNumber: require("./src/structures/PhoneNumber"),

  History: require("./src/structures/Histories"),

  // Auth Strategies
  GLocalAuth: require("./src/authStrategies/GLocalAuth"),

  ...Constants,
};
