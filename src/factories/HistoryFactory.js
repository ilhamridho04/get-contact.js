'use strict';

const HistoryList = require("../structures/HistoryList");

class HistoryFactory {
    static create(client, data) {
        return new HistoryList(client, data);
    }
}

module.exports = HistoryFactory;